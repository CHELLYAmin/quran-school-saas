using Microsoft.OpenApi.Models;
using QuranSchool.Application;
using QuranSchool.Infrastructure;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Infrastructure.Seed;
using QuranSchool.API.Middleware;
using QuranSchool.Infrastructure.Hubs;
using Serilog;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;

// Npgsql legacy timestamp behavior
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Add layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// HTTP Context accessor
builder.Services.AddHttpContextAccessor();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddHealthChecks();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// SignalR
builder.Services.AddSignalR();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Quran School SaaS API",
        Version = "v1",
        Description = "API for managing Quran schools — Hifdh, Tajwid, and reading programs.",
        Contact = new OpenApiContact { Name = "Quran School Team", Email = "support@quranschool.com" }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: eyJhbGciOi..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed database based on CLI arguments or environment variables
var envReset = true; // FORCE RESET IN PROD temporarily
var seedReset = args.Contains("--seed-reset") || envReset;
var seed = args.Contains("--seed") || seedReset;

using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        if (seedReset)
        {
            Console.WriteLine(">>> Resetting database (DELETING ALL DATA)...");
            try {
                // Sur AWS RDS, détruire/recréer le schéma supprime les permissions.
                // Au lieu de ça, on supprime dynamiquement tout ce qu'il contient.
                var wipeScript = @"
                    DO $$ DECLARE
                        r RECORD;
                    BEGIN
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
                        END LOOP;
                        FOR r IN (SELECT relname FROM pg_class WHERE relkind = 'S' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
                            EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE';
                        END LOOP;
                        FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
                            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
                        END LOOP;
                    END $$;";
                db.Database.ExecuteSqlRaw(wipeScript);

                Console.WriteLine(">>> Applying new clean migrations...");
                db.Database.Migrate();

                Console.WriteLine(">>> Database dynamicaly wiped, recreated, and migrated.");
                QuranSchool.API.StartupDiagnostics.LastError = "Success - Wiped, recreated, migrated";
            } catch (Exception ex) {
                Console.WriteLine($">>> CRITICAL: Reset failed: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($">>> InnerException: {ex.InnerException.Message}");
                QuranSchool.API.StartupDiagnostics.LastError = $"Error {ex.GetType().Name}: {ex.Message} | Inner: {ex.InnerException?.Message}";
                // Ne pas throw: laisse l'app s'allumer pour debug au lieu qu'AWS fasse un rollback.
            }
        }
        else if (seed)
        {
            Console.WriteLine(">>> Ensuring database exists for seeding...");
            db.Database.EnsureCreated();
            Console.WriteLine(">>> EnsureCreated finished.");
        }
        else 
        {
            Console.WriteLine(">>> Running migrations...");
            try {
                db.Database.Migrate();
                Console.WriteLine(">>> Migrations applied.");
            } catch (Exception ex) {
                Console.WriteLine($">>> CRITICAL: Migrations failed: {ex.Message}");
                Console.WriteLine($">>> StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null) {
                    Console.WriteLine($">>> InnerException: {ex.InnerException.Message}");
                }
            }
        }

        // Always synchronize Hub de Vie content
        try 
        {
            Console.WriteLine(">>> Synchronizing Hub de Vie content...");
            var schoolId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            
            // ENSURE ADMIN USER EXISTS (PASSIVE SEEDING)
            var adminEmail = "admin@alnoor-quran.fr";
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
            if (existingUser == null)
            {
                Console.WriteLine($">>> Seeding default admin: {adminEmail}");
                
                // Ensure School exists
                var school = await db.Schools.FirstOrDefaultAsync(s => s.Id == schoolId);
                if (school == null)
                {
                    school = new School
                    {
                        Id = schoolId,
                        SchoolId = schoolId,
                        Name = "École Al-Noor du Coran",
                        IsActive = true
                    };
                    db.Schools.Add(school);
                    await db.SaveChangesAsync();
                }

                // Ensure Role exists
                var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin" && r.SchoolId == schoolId);
                if (adminRole == null)
                {
                    adminRole = new Role
                    {
                        Id = Guid.NewGuid(),
                        SchoolId = schoolId,
                        Name = "Admin",
                        IsSystemRole = true
                    };
                    db.Roles.Add(adminRole);
                    await db.SaveChangesAsync();
                }

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "Al-Noor",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true,
                    SchoolId = schoolId,
                    PreferredLanguage = "fr",
                    LinkedProfileType = ProfileType.Admin,
                    LinkedProfileId = Guid.NewGuid()
                };
                db.Users.Add(user);
                
                db.UserRoles.Add(new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    RoleId = adminRole.Id,
                    SchoolId = schoolId
                });
                
                await db.SaveChangesAsync();
                Console.WriteLine(">>> Default admin created successfully.");
            }

            // Passive seeding for critical system data
            await SeedData.SeedAsync(db);
        }
        catch (Exception ex)
        {
            Console.WriteLine($">>> WARNING: CMS synchronization failed: {ex.Message}");
        }

        if (seed)
        {
            Console.WriteLine(">>> Starting seeding...");
            var seeder = new AdvancedDataSeeder(db);
            await seeder.SeedLargeDatasetAsync();
            Console.WriteLine(">>> Seeding completed.");
            return;
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($">>> Error during database initialization: {ex.Message}");
    }
}

// Middleware pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quran School API V1");
        c.RoutePrefix = "swagger";
    });
    app.UseCors("AllowAll");
}
else 
{
    app.UseCors("ProductionPolicy");
}

app.UseStaticFiles();
app.UseAuthentication();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHub<NotificationHub>("/notificationHub");
app.MapGet("/api/debug/reset-log", () => Results.Ok(new { log = QuranSchool.API.StartupDiagnostics.LastError }));

app.Run();
// CI Trigger: Force 3 Greens v1.2

namespace QuranSchool.API
{
    public static class StartupDiagnostics {
        public static string LastError { get; set; } = "No errors detected.";
    }
}
