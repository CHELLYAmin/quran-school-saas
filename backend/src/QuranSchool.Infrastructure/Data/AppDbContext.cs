using Microsoft.EntityFrameworkCore;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Interfaces;

namespace QuranSchool.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;
    private readonly Guid? _currentSchoolId;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<School> Schools => Set<School>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Level> Levels => Set<Level>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamVerseEvaluation> ExamVerseEvaluations => Set<ExamVerseEvaluation>();
    public DbSet<ExamWordAnnotation> ExamWordAnnotations => Set<ExamWordAnnotation>();
    public DbSet<Surah> Surahs => Set<Surah>();
    public DbSet<Verse> Verses => Set<Verse>();
    public DbSet<VerseWord> VerseWords => Set<VerseWord>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<TeacherAttendance> TeacherAttendances => Set<TeacherAttendance>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Progress> ProgressRecords => Set<Progress>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Homework> Homeworks => Set<Homework>();
    public DbSet<HomeworkAssignment> HomeworkAssignments => Set<HomeworkAssignment>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<SessionAttendance> SessionAttendances => Set<SessionAttendance>();
    public DbSet<SessionRecitation> SessionRecitations => Set<SessionRecitation>();
    public DbSet<SessionVerseEvaluation> SessionVerseEvaluations => Set<SessionVerseEvaluation>();
    public DbSet<SessionWordAnnotation> SessionWordAnnotations => Set<SessionWordAnnotation>();
    public DbSet<StudentProgressSnapshot> StudentProgressSnapshots => Set<StudentProgressSnapshot>();
    public DbSet<StudentMission> StudentMissions => Set<StudentMission>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserActionLog> UserActionLogs => Set<UserActionLog>();
    public DbSet<Examiner> Examiners => Set<Examiner>();
    public DbSet<AdminProfile> AdminProfiles => Set<AdminProfile>();
    public DbSet<MosqueSettings> MosqueSettings => Set<MosqueSettings>();
    public DbSet<CmsPage> CmsPages => Set<CmsPage>();
    public DbSet<DonationCampaign> DonationCampaigns => Set<DonationCampaign>();
    public DbSet<DonationRecord> DonationRecords => Set<DonationRecord>();
    public DbSet<VolunteerMission> VolunteerMissions => Set<VolunteerMission>();
    public DbSet<VolunteerSignup> VolunteerSignups => Set<VolunteerSignup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // === Global query filter for soft delete ===
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (entityType.ClrType.IsSubclassOf(typeof(Domain.Common.BaseEntity)))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(
                        Microsoft.EntityFrameworkCore.Query.QueryFilterHelpers
                            .CreateSoftDeleteFilter(entityType.ClrType));
            }
        }

        // === School ===
        modelBuilder.Entity<School>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === MosqueSettings ===
        modelBuilder.Entity<MosqueSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.School).WithMany().HasForeignKey(e => e.SchoolId).OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === User ===
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.LinkedProfileType).HasConversion<string>();
            entity.HasOne(e => e.School).WithMany(s => s.Users).HasForeignKey(e => e.SchoolId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Role ===
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Permission ===
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === RolePermission ===
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Role).WithMany(r => r.RolePermissions).HasForeignKey(e => e.RoleId);
            entity.HasOne(e => e.Permission).WithMany(p => p.RolePermissions).HasForeignKey(e => e.PermissionId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === UserRole ===
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithMany(u => u.UserRoles).HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Role).WithMany(r => r.UserRoles).HasForeignKey(e => e.RoleId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === UserActionLog ===
        modelBuilder.Entity<UserActionLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Module).HasMaxLength(100);
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Student ===
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.Group).WithMany(g => g.Students).HasForeignKey(e => e.GroupId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Parent).WithMany(p => p.Children).HasForeignKey(e => e.ParentId).OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Parent ===
        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Teacher ===
        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Examiner ===
        modelBuilder.Entity<Examiner>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === AdminProfile ===
        modelBuilder.Entity<AdminProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Group ===
        modelBuilder.Entity<Group>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Teacher).WithMany(t => t.Groups).HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Level).WithMany(l => l.Groups).HasForeignKey(e => e.LevelId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.School).WithMany(s => s.Groups).HasForeignKey(e => e.SchoolId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Level ===
        modelBuilder.Entity<Level>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Surah / Verse / Word ===
        modelBuilder.Entity<Surah>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NameArabic).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NameEnglish).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Verse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Surah).WithMany(s => s.Verses).HasForeignKey(e => e.SurahId);
        });

        modelBuilder.Entity<VerseWord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Verse).WithMany(v => v.Words).HasForeignKey(e => e.VerseId);
        });

        // === Exam ===
        modelBuilder.Entity<Exam>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.FinalStatus).HasConversion<string>();
            entity.Property(e => e.FinalScore).HasPrecision(5, 2);
            
            entity.HasOne(e => e.Group).WithMany(g => g.Exams).HasForeignKey(e => e.GroupId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Examiner).WithMany().HasForeignKey(e => e.ExaminerId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Surah).WithMany().HasForeignKey(e => e.SurahId).OnDelete(DeleteBehavior.NoAction);
            
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Exam Evaluations ===
        modelBuilder.Entity<ExamVerseEvaluation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Exam).WithMany(ex => ex.VerseEvaluations).HasForeignKey(e => e.ExamId);
            entity.HasOne(e => e.Verse).WithMany().HasForeignKey(e => e.VerseId);
        });

        modelBuilder.Entity<ExamWordAnnotation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AnnotationType).HasConversion<string>();
            entity.HasOne(e => e.VerseEvaluation).WithMany(ve => ve.WordAnnotations).HasForeignKey(e => e.VerseEvaluationId);
            entity.HasOne(e => e.Word).WithMany().HasForeignKey(e => e.WordId);
        });

        // === Attendance ===
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Student).WithMany(s => s.Attendances).HasForeignKey(e => e.StudentId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Teacher Attendance ===
        modelBuilder.Entity<TeacherAttendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Teacher).WithMany(t => t.Attendances).HasForeignKey(e => e.TeacherId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Payment ===
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.Discount).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Student).WithMany(s => s.Payments).HasForeignKey(e => e.StudentId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Progress ===
        modelBuilder.Entity<Progress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Student).WithMany(s => s.ProgressRecords).HasForeignKey(e => e.StudentId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Schedule ===
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DayOfWeek).HasConversion<string>();
            entity.HasOne(e => e.Group).WithMany(g => g.Schedules).HasForeignKey(e => e.GroupId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Notification ===
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Message ===
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Sender).WithMany().HasForeignKey(e => e.SenderId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Receiver).WithMany().HasForeignKey(e => e.ReceiverId).OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Certificate ===
        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Student).WithMany(s => s.Certificates).HasForeignKey(e => e.StudentId);
            entity.HasOne(e => e.Exam).WithMany().HasForeignKey(e => e.ExamId).OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === AcademicYear ===
        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.HasOne(e => e.School).WithMany(s => s.AcademicYears).HasForeignKey(e => e.SchoolId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Homework ===
        modelBuilder.Entity<Homework>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasOne(e => e.Group).WithMany().HasForeignKey(e => e.GroupId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Teacher).WithMany().HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === HomeworkAssignment ===
        modelBuilder.Entity<HomeworkAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Homework).WithMany(h => h.Assignments).HasForeignKey(e => e.HomeworkId);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // === Session ===
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Group).WithMany().HasForeignKey(e => e.GroupId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Teacher).WithMany().HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.NoAction);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        modelBuilder.Entity<SessionAttendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Session).WithMany(s => s.Attendances).HasForeignKey(e => e.SessionId);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId);
        });

        modelBuilder.Entity<SessionRecitation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Session).WithMany(s => s.Recitations).HasForeignKey(e => e.SessionId);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId);
            entity.HasOne(e => e.Surah).WithMany().HasForeignKey(e => e.SurahId);
        });

        modelBuilder.Entity<SessionVerseEvaluation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Recitation).WithMany(r => r.VerseEvaluations).HasForeignKey(e => e.SessionRecitationId);
            entity.HasOne(e => e.Verse).WithMany().HasForeignKey(e => e.VerseId);
        });

        modelBuilder.Entity<SessionWordAnnotation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AnnotationType).HasConversion<string>();
            entity.HasOne(e => e.VerseEvaluation).WithMany(ve => ve.WordAnnotations).HasForeignKey(e => e.SessionVerseEvaluationId);
            entity.HasOne(e => e.Word).WithMany().HasForeignKey(e => e.WordId);
        });

        modelBuilder.Entity<StudentProgressSnapshot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId);
            entity.HasOne(e => e.Session).WithMany().HasForeignKey(e => e.SessionId);
        });

        // === StudentMission ===
        modelBuilder.Entity<StudentMission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.TargetType).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Teacher).WithMany().HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.SetNull);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}


