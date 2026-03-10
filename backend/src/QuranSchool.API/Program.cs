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

// Seed database based on CLI arguments
var seedReset = args.Contains("--seed-reset");
var seed = args.Contains("--seed") || seedReset;

using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        if (seedReset)
        {
            Console.WriteLine(">>> Resetting database...");
            db.Database.EnsureCreated();
            Console.WriteLine(">>> Database reset finished.");
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
                Console.WriteLine($">>> WARNING: Migrations failed: {ex.Message}");
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

            var requiredPages = new List<CmsPage>
            {
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Accueil", 
                    Slug = "home", 
                    Category = "page", 
                    IsPublished = true,
                    IsSystemPage = true,
                    ShowInMenu = true,
                    SortOrder = 1,
                    Icon = "Home",
                    Content = "Bienvenue sur le portail de l'école Al-Noor."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Le Centre", 
                    Slug = "centre", 
                    Category = "about", 
                    IsPublished = true,
                    IsSystemPage = true,
                    ShowInMenu = true,
                    SortOrder = 2,
                    Icon = "Info",
                    Content = "Le Centre Culturel Islamique de Québec (CCIQ) est une institution pilier..."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Hub de Vie", 
                    Slug = "hub", 
                    Category = "hub", 
                    IsPublished = true,
                    IsSystemPage = true,
                    ShowInMenu = true,
                    SortOrder = 3,
                    Icon = "LayoutGrid",
                    Content = "Découvrez toute l'actualité, les événements et les missions communautaires de notre école."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "L'Islam", 
                    Slug = "islam", 
                    Category = "islam", 
                    IsPublished = true,
                    IsSystemPage = true,
                    ShowInMenu = true,
                    SortOrder = 4,
                    Icon = "BookOpen",
                    Content = "L'Islam est une religion de paix, de miséricorde et de justice..."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Actualités", 
                    Slug = "commemoration-2026", 
                    Category = "announcement", 
                    IsPublished = true,
                    Content = "Le 29 janvier 2026 marquera le 9e anniversaire..."
                }
            };

            foreach (var p in requiredPages)
            {
                var existing = await db.CmsPages.FirstOrDefaultAsync(x => x.Slug == p.Slug);
                if (existing != null)
                {
                    existing.Title = p.Title;
                    existing.Content = p.Content;
                    existing.Category = p.Category;
                    existing.IsPublished = true;
                    existing.IsSystemPage = p.IsSystemPage;
                    existing.ShowInMenu = p.ShowInMenu;
                    existing.SortOrder = p.SortOrder;
                    existing.Icon = p.Icon;
                }
                else
                {
                    p.Id = Guid.NewGuid();
                    db.CmsPages.Add(p);
                }
            }
            await db.SaveChangesAsync();
            Console.WriteLine($">>> Synchronized CMS pages.");
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

app.Run();
// CI Trigger: Force 3 Greens v1.2
