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
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://192.168.2.185:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });

    // Production Policy (to be configured via env var)
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://192.168.2.185:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
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
            Console.WriteLine(">>> Resetting database (Bypassing ensure deleted for RDS)...");
            // db.Database.EnsureDeleted();
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

        // Always synchronize Hub de Vie content (Upsert logic)
        try 
        {
            Console.WriteLine(">>> Synchronizing Hub de Vie content...");
            var schoolId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var requiredPages = new List<CmsPage>
            {
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "9e Commémoration — 29 Janvier 2026", 
                    Slug = "commemoration-2026", 
                    Category = "announcement", 
                    IsPublished = true,
                    Content = "Le 29 janvier 2026 marquera le 9e anniversaire de la tragédie de la Grande Mosquée de Québec. Nous vous invitons à une soirée de commémoration et de recueillement pour honorer la mémoire des victimes et célébrer la résilience de notre communauté."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Le Centre — MISSION ET OBJECTIFS", 
                    Slug = "centre", 
                    Category = "about", 
                    IsPublished = true,
                    Content = "Le Centre Culturel Islamique de Québec (CCIQ) est une institution pilier de la communauté musulmane à Québec depuis 1985. Notre mission est de fournir un espace de culte, d'éducation et de soutien social, favorisant l'épanouissement spirituel et l'intégration harmonieuse dans la société québécoise. Nos objectifs incluent la préservation des valeurs islamiques, l'éducation des jeunes et le dialogue interculturel."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Services Funéraires", 
                    Slug = "services", 
                    Category = "service", 
                    IsPublished = true,
                    Content = "Le CCIQ accompagne les familles dans les moments difficiles en offrant des services funéraires complets conformes aux rites islamiques. Nous assurons le transport, le lavage mortuaire (Ghusl), la prière funéraire (Janaza) et la coordination avec le cimetière. Notre équipe dévouée est disponible 24h/24 pour vous soutenir."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "L'Islam : Comprendre notre Foi", 
                    Slug = "islam", 
                    Category = "islam", 
                    IsPublished = true,
                    Content = "L'Islam est une religion de paix, de miséricorde et de justice. Ce portail est dédié à l'explication des piliers de la foi et de la pratique, ainsi qu'à la réponse aux questions fréquentes. Nous organisons régulièrement des conférences et des cercles d'apprentissage pour approfondir la connaissance de la parole divine et de la Sunna du Prophète (PSL)."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Cimetière Islamique de Québec", 
                    Slug = "cimetiere", 
                    Category = "service", 
                    IsPublished = true,
                    Content = "Inauguré pour offrir un lieu de repos éternel digne à notre communauté, le Cimetière Islamique de Québec est un havre de paix géré par le CCIQ. Nous veillons à l'entretien du site et au respect strict des traditions funéraires musulmanes. Des concessions sont disponibles pour les membres et non-membres de la communauté."
                },
                new CmsPage { 
                    SchoolId = schoolId, 
                    Title = "Ensemble pour notre Mosquée", 
                    Slug = "ensemble-mosquee", 
                    Category = "donation", 
                    IsPublished = true,
                    Content = "Votre mosquée a besoin de vous. Les dons permettent de couvrir les frais de fonctionnement, d'entretien et le développement de nouveaux projets pour nos enfants. Chaque contribution, petite ou grande, est une Sadaka Jariya qui portera ses fruits dans l'au-delà."
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
                }
                else
                {
                    p.Id = Guid.NewGuid();
                    db.CmsPages.Add(p);
                }
            }
            await db.SaveChangesAsync();
            Console.WriteLine($">>> Synchronized {requiredPages.Count} CMS pages.");
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
