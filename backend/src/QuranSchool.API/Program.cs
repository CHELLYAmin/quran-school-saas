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
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

// QuestPDF License
// QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseKind.Community;

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
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });

    // Production Policy (to be configured via env var)
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
            // Auto-migrate in Production
            Console.WriteLine(">>> Running migrations...");
            try {
                db.Database.Migrate();
                Console.WriteLine(">>> Migrations applied.");
            } catch (Exception ex) {
                Console.WriteLine($">>> WARNING: Migrations failed: {ex.Message}");
                // We continue so the diagnostic API can at least answer
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
    // app.UseHsts();
    // app.UseHttpsRedirection();
    app.UseCors("ProductionPolicy");
}

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
