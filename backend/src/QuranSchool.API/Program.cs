using Microsoft.OpenApi.Models;
using QuranSchool.Application;
using QuranSchool.Infrastructure;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Infrastructure.Seed;
using QuranSchool.API.Middleware;
using QuranSchool.Infrastructure.Hubs;
using Serilog;
using QuestPDF.Infrastructure;
using Microsoft.EntityFrameworkCore;

// QuestPDF License
// QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseKind.Community;

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
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });

    // Production Policy (to be configured via env var)
    var prodOrigin = builder.Configuration["AllowedOrigins"] ?? "";
    options.AddPolicy("ProductionPolicy", policy =>
    {
        if (!string.IsNullOrEmpty(prodOrigin))
        {
            policy.WithOrigins(prodOrigin.Split(','))
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
        else
        {
            // Fallback for security
            policy.AllowAnyMethod().AllowAnyHeader();
        }
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
        Console.WriteLine(">>> Resolving AppDbContext...");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Console.WriteLine(">>> AppDbContext resolved.");
        
        if (seedReset)
        {
            Console.WriteLine(">>> Resetting database (Dropping & Recreating)...");
            db.Database.EnsureDeleted();
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
            // Manual Schema Repair for SQLite (Environment Fix)
            Console.WriteLine(">>> Checking for SQLite schema repair...");
            try 
            {
                using var connection = db.Database.GetDbConnection();
                await connection.OpenAsync();
                
                // Add missing columns if they don't exist
                var columns = new[] { "Badges", "TotalXP", "CurrentStreak", "LongestStreak" };
                foreach (var col in columns)
                {
                    var checkTable = connection.CreateCommand();
                    checkTable.CommandText = $"PRAGMA table_info(Students);";
                    bool exists = false;
                    using (var reader = await checkTable.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            if (reader.GetString(1).Equals(col, StringComparison.OrdinalIgnoreCase))
                            {
                                exists = true;
                                break;
                            }
                        }
                    }

                    if (!exists)
                    {
                        Console.WriteLine($">>> Adding missing column {col} to Students table...");
                        var addCol = connection.CreateCommand();
                        if (col == "Badges")
                            addCol.CommandText = $"ALTER TABLE Students ADD COLUMN {col} TEXT NOT NULL DEFAULT '';";
                        else
                            addCol.CommandText = $"ALTER TABLE Students ADD COLUMN {col} INTEGER NOT NULL DEFAULT 0;";
                        await addCol.ExecuteNonQueryAsync();
                    }
                }

                // Sync Migrations History to prevent "Table already exists" on next migration
                var migrations = new[] { "20260306191005_AddStudentMissions", "20260306211538_AddGamificationToStudent", "20260307051631_AddSessionVirtualMeeting" };
                foreach (var migration in migrations)
                {
                    var checkMig = connection.CreateCommand();
                    checkMig.CommandText = $"SELECT COUNT(*) FROM __EFMigrationsHistory WHERE MigrationId = '{migration}';";
                    var count = (long)(await checkMig.ExecuteScalarAsync() ?? 0L);
                    if (count == 0)
                    {
                        Console.WriteLine($">>> Syncing migration history for {migration}...");
                        var insertMig = connection.CreateCommand();
                        insertMig.CommandText = $"INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('{migration}', '8.0.0');";
                        await insertMig.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception dbEx)
            {
                Console.WriteLine($">>> Warning: Manual schema repair failed: {dbEx.Message}");
            }
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
        Console.WriteLine(ex.StackTrace);
    }
}
Console.WriteLine(">>> Startup logic finished. Starting web host...");

// Middleware pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

// Standard Forwarded Headers for AWS/Proxy environments
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
    app.UseHsts();
    app.UseHttpsRedirection();
    app.UseCors("ProductionPolicy");
}

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
