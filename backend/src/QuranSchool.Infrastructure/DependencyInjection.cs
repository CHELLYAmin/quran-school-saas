using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Infrastructure.Repositories;
using QuranSchool.Infrastructure.Services;
using System.Text;

namespace QuranSchool.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        bool useSqlite = true;
        
        // If we have a valid PostgreSQL connection string AND we are NOT in a local dev environment that requires SQLite
        if (connectionString != null && connectionString.Contains("rds.amazonaws.com") && configuration["USE_SQLITE"] != "true")
        {
            // Only use Postgres if we are sure we are in an environment that can reach RDS
            useSqlite = false;
        }

        if (useSqlite || string.IsNullOrEmpty(connectionString))
        {
            var sqlitePath = connectionString != null && connectionString.Contains(".db") ? connectionString : "Data Source=quranschool.db";
            Console.WriteLine($">>> Using SQLite Database: {sqlitePath}");
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(sqlitePath));
        }

        if (useSqlite)
        {
            Console.WriteLine(">>> Using SQLite Database");
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(connectionString ?? "Data Source=quranschool.db"));
        }
        else
        {
            Console.WriteLine(">>> Using PostgreSQL Database");
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISchoolService, SchoolService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ITeacherAttendanceService, TeacherAttendanceService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IProgressService, ProgressService>();
        services.AddScoped<IScheduleService, ScheduleService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IParentService, ParentService>();
        services.AddScoped<ICommunicationService, CommunicationService>();
        services.AddScoped<IHomeworkService, HomeworkService>();
        services.AddScoped<IMushafService, MushafService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<ILevelService, LevelService>();
        services.AddScoped<IFinancialService, FinancialService>();
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IAuditService, AuditService>();

        // System
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IScoringService, ScoringService>();
        services.AddScoped<IExamReportService, ExamReportService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<IProgressCalculationService, ProgressCalculationService>();
        services.AddScoped<ISmartQueueService, SmartQueueService>();
        services.AddScoped<ISmartRevisionService, SmartRevisionService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IGamificationService, GamificationService>();

        // JWT Authentication
        var jwtKey = configuration["Jwt:Key"] ?? "SuperSecretKeyAtLeast32Characters!";
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"] ?? "QuranSchool",
                ValidAudience = configuration["Jwt:Audience"] ?? "QuranSchoolApp",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
        });

        services.AddAuthorization();

        return services;
    }
}
