using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace QuranSchool.Infrastructure.Seed;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Seed Quran Data (independent of school)
        var quranSeeder = new QuranDataSeeder(context);
        await quranSeeder.SeedAsync();

        // 2. Define IDs used in seeding
        var schoolId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var fatiha = await context.Surahs
            .Include(s => s.Verses)
            .ThenInclude(v => v.Words)
            .FirstOrDefaultAsync(s => s.Number == 1);
        var fatihaId = fatiha?.Id ?? Guid.Empty;

        // 3. Seed other data only if schools are empty
        if (await context.Schools.AnyAsync()) 
        {
            Console.WriteLine(">>> Schools already exist. Skipping rest of seed.");
            return;
        }

        var school = new School
        {
            Id = schoolId,
            SchoolId = schoolId,
            Name = "École Al-Noor du Coran",
            Address = "123 Rue de la Paix, Paris",
            Phone = "+33 1 23 45 67 89",
            Email = "contact@alnoor-quran.fr",
            Description = "École de Coran spécialisée en Hifdh et Tajwid"
        };
        context.Schools.Add(school);

        // Seed Permissions
        var permissions = new List<Permission>();
        foreach (var p in QuranSchool.Domain.Constants.Permissions.All)
        {
            var parts = p.Split('_');
            var module = parts.Length > 0 ? parts[0] : p;
            var action = parts.Length > 1 ? parts[1] : "VIEW";
            permissions.Add(new Permission { Id = Guid.NewGuid(), SchoolId = schoolId, Code = p, Module = module, ActionType = action, Description = $"Permission {p}" });
        }
        context.Permissions.AddRange(permissions);

        // Seed Roles
        var superAdminRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "SuperAdmin", IsSystemRole = true };
        var adminRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Admin", IsSystemRole = true };
        var teacherRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Teacher", IsSystemRole = true };
        var examinerRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Examiner", IsSystemRole = true };
        var parentRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Parent", IsSystemRole = true };
        var studentRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Student", IsSystemRole = true };
        var accountantRole = new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Accountant", IsSystemRole = true };
        
        var roles = new[] { superAdminRole, adminRole, teacherRole, examinerRole, parentRole, studentRole, accountantRole };
        context.Roles.AddRange(roles);

        // Helper to link
        void LinkRolePerms(Role r, IEnumerable<string> perms)
        {
            foreach (var pCode in perms)
            {
                var permId = permissions.First(x => x.Code == pCode).Id;
                context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), SchoolId = schoolId, RoleId = r.Id, PermissionId = permId });
            }
        }

        // 1. SuperAdmin / Admin (All Permissions except RolesManage for Admin)
        LinkRolePerms(superAdminRole, QuranSchool.Domain.Constants.Permissions.All);
        
        var adminPerms = QuranSchool.Domain.Constants.Permissions.All
            .Where(p => p != QuranSchool.Domain.Constants.Permissions.RolesManage);
        LinkRolePerms(adminRole, adminPerms);

        // 2. Teacher Permissions
        var teacherPerms = new[] { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.GroupsView,
            QuranSchool.Domain.Constants.Permissions.SessionsView, QuranSchool.Domain.Constants.Permissions.SessionsManage,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.AttendanceView, QuranSchool.Domain.Constants.Permissions.AttendanceManage,
            QuranSchool.Domain.Constants.Permissions.ExamsView, QuranSchool.Domain.Constants.Permissions.ExamsManage,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.HomeworkView, QuranSchool.Domain.Constants.Permissions.HomeworkManage,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        LinkRolePerms(teacherRole, teacherPerms);

        // 3. Examiner Permissions
        var examinerPerms = new[] { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.ExamsView, QuranSchool.Domain.Constants.Permissions.ExamsManage,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        LinkRolePerms(examinerRole, examinerPerms);

        // 4. Parent Permissions
        var parentPerms = new[] { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.HomeworkView
        };
        LinkRolePerms(parentRole, parentPerms);

        // 5. Student Permissions
        var studentPerms = new[] { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.HomeworkView,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        LinkRolePerms(studentRole, studentPerms);

        // 6. Accountant Permissions
        var accPerms = new[] { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView, QuranSchool.Domain.Constants.Permissions.PaymentsManage,
        };
        LinkRolePerms(accountantRole, accPerms);

        // Create SuperAdmin
        var superAdminProfileId = Guid.NewGuid();
        // Create Levels
        var level1 = new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 1", Order = 1, Description = "Débutants complets" };
        var level2 = new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 2", Order = 2, Description = "Base de lecture" };
        var level3 = new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 3", Order = 3, Description = "Mémorisation Juz 30" };
        var level4 = new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 4", Order = 4, Description = "Mémorisation Juz 29" };
        var level5 = new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 5", Order = 5, Description = "Avancés" };
        context.Levels.AddRange(level1, level2, level3, level4, level5);

        context.AdminProfiles.Add(new AdminProfile { Id = superAdminProfileId, SchoolId = schoolId, FirstName = "Super", LastName = "Admin", Email = "superadmin@quranschool.com" });

        var superAdmin = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            SchoolId = schoolId,
            Email = "superadmin@quranschool.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Super",
            LastName = "Admin",
            PreferredLanguage = "fr",
            LinkedProfileType = ProfileType.Admin,
            LinkedProfileId = superAdminProfileId
        };
        context.Users.Add(superAdmin);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = superAdmin.Id, RoleId = superAdminRole.Id });

        // Create Admin
        var adminProfileId = Guid.NewGuid();
        context.AdminProfiles.Add(new AdminProfile { Id = adminProfileId, SchoolId = schoolId, FirstName = "Ahmed", LastName = "Benali", Email = "admin@alnoor-quran.fr" });

        var admin = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            SchoolId = schoolId,
            Email = "admin@alnoor-quran.fr",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Ahmed",
            LastName = "Benali",
            PreferredLanguage = "ar",
            LinkedProfileType = ProfileType.Admin,
            LinkedProfileId = adminProfileId
        };
        context.Users.Add(admin);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = admin.Id, RoleId = adminRole.Id });

        // Create Teacher user + entity
        var teacherUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var teacherId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        
        var teacher = new Teacher
        {
            Id = teacherId,
            SchoolId = schoolId,
            FirstName = "Mohamed",
            LastName = "Al-Husseini",
            Email = "teacher@alnoor-quran.fr",
            Phone = "+33 6 11 22 33 44",
            Specialization = "Hifdh & Tajwid",
            HireDate = DateTime.UtcNow.AddYears(-2)
        };
        context.Teachers.Add(teacher);

        var teacherUser = new User
        {
            Id = teacherUserId,
            SchoolId = schoolId,
            Email = "teacher@alnoor-quran.fr",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
            FirstName = "Mohamed",
            LastName = "Al-Husseini",
            PreferredLanguage = "ar",
            LinkedProfileType = ProfileType.Teacher,
            LinkedProfileId = teacher.Id
        };
        context.Users.Add(teacherUser);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = teacherUser.Id, RoleId = teacherRole.Id });

        // --- MASS GENERATED TEACHERS ---
        for (int i = 1; i <= 10; i++)
        {
            var mockTeacherId = Guid.NewGuid();
            var mockTeacherUserId = Guid.NewGuid();
            
            context.Teachers.Add(new Teacher
            {
                Id = mockTeacherId,
                SchoolId = schoolId,
                FirstName = "Enseignant",
                LastName = $"Générique {i}",
                Email = $"professeur{i}@alnoor.fr",
                Specialization = i % 2 == 0 ? "Qira'at" : "Aqida",
                HireDate = DateTime.UtcNow.AddMonths(-i)
            });

            var mockTeacherUser = new User
            {
                Id = mockTeacherUserId,
                SchoolId = schoolId,
                Email = $"professeur{i}@alnoor.fr",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
                FirstName = "Enseignant",
                LastName = $"Générique {i}",
                PreferredLanguage = "fr",
                LinkedProfileType = ProfileType.Teacher,
                LinkedProfileId = mockTeacherId
            };
            context.Users.Add(mockTeacherUser);
            context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = mockTeacherUser.Id, RoleId = teacherRole.Id });
        }
        // -------------------------------

        // Create Parent user + entity
        var parentUserId = Guid.Parse("66666666-6666-6666-6666-666666666666");
        var parentId = Guid.Parse("77777777-7777-7777-7777-777777777777");
        
        var parent = new Parent
        {
            Id = parentId,
            SchoolId = schoolId,
            FirstName = "Fatima",
            LastName = "Zahra",
            Email = "parent@example.com",
            Phone = "+33 6 12 34 56 78",
            Address = "456 Avenue des Champs"
        };
        context.Parents.Add(parent);

        var parentUser = new User
        {
            Id = parentUserId,
            SchoolId = schoolId,
            Email = "parent@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Parent@123"),
            FirstName = "Fatima",
            LastName = "Zahra",
            PreferredLanguage = "fr",
            LinkedProfileType = ProfileType.Parent,
            LinkedProfileId = parent.Id
        };
        context.Users.Add(parentUser);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = parentUser.Id, RoleId = parentRole.Id });

        // --- MASS GENERATED PARENTS ---
        var parentsList = new List<Parent> { parent };
        for (int i = 1; i <= 20; i++)
        {
            var pId = Guid.NewGuid();
            var pUserId = Guid.NewGuid();
            var p = new Parent
            {
                Id = pId,
                SchoolId = schoolId,
                FirstName = $"ParentFR_{i}",
                LastName = $"Nom_{i}",
                Email = $"parent{i}@example.fr",
                Phone = $"+33 6 00 00 00 {i:D2}",
                Address = $"{i} Rue de la Paix, Paris"
            };
            context.Parents.Add(p);
            parentsList.Add(p);

            var pUser = new User
            {
                Id = pUserId,
                SchoolId = schoolId,
                Email = p.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
                FirstName = p.FirstName,
                LastName = p.LastName,
                PreferredLanguage = "fr",
                LinkedProfileType = ProfileType.Parent,
                LinkedProfileId = p.Id
            };
            context.Users.Add(pUser);
            context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = pUser.Id, RoleId = parentRole.Id });
        }

        // Create Groups
        var groupId1 = Guid.NewGuid();
        var group1 = new Group
        {
            Id = groupId1,
            SchoolId = schoolId,
            Name = "Groupe Al-Fatiha",
            LevelId = level1.Id,
            MaxCapacity = 20,
            TeacherId = teacherId,
            Description = "Groupe pour débutants - Juz 30"
        };
        context.Groups.Add(group1);

        var groupId2 = Guid.NewGuid();
        var group2 = new Group
        {
            Id = groupId2,
            SchoolId = schoolId,
            Name = "Groupe Al-Baqara",
            LevelId = level3.Id,
            MaxCapacity = 15,
            TeacherId = teacherId,
            Description = "Groupe intermédiaire - Juz 1-5"
        };
        context.Groups.Add(group2);

        // Create Students
        var studentId1 = Guid.NewGuid();
        var student1 = new Student
        {
            Id = studentId1,
            SchoolId = schoolId,
            FirstName = "Youssef",
            LastName = "Zahra",
            DateOfBirth = new DateTime(2010, 5, 15).ToUniversalTime(),
            GroupId = groupId1,
            ParentId = parent.Id,
            IsActive = true
        };
        context.Students.Add(student1);

        var studentUser1 = new User
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            Email = "student1@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            FirstName = "Youssef",
            LastName = "Zahra",
            PreferredLanguage = "fr",
            LinkedProfileType = ProfileType.Student,
            LinkedProfileId = student1.Id
        };
        context.Users.Add(studentUser1);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = studentUser1.Id, RoleId = studentRole.Id });

        var studentId2 = Guid.NewGuid();
        var student2 = new Student
        {
            Id = studentId2,
            SchoolId = schoolId,
            FirstName = "Amina",
            LastName = "Zahra",
            DateOfBirth = new DateTime(2012, 8, 20).ToUniversalTime(),
            GroupId = groupId1,
            ParentId = parent.Id,
            IsActive = true
        };
        context.Students.Add(student2);

        var studentUser2 = new User
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            Email = "student2@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            FirstName = "Amina",
            LastName = "Zahra",
            PreferredLanguage = "fr",
            LinkedProfileType = ProfileType.Student,
            LinkedProfileId = student2.Id
        };
        context.Users.Add(studentUser2);
        context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = studentUser2.Id, RoleId = studentRole.Id });

        var student3 = new Student
        {
            SchoolId = schoolId,
            FirstName = "Omar",
            LastName = "Al-Fassi",
            DateOfBirth = new DateTime(2011, 3, 10).ToUniversalTime(),
            GroupId = group2.Id,
            IsActive = true
        };
        context.Students.Add(student3);

        // --- MASS GENERATED STUDENTS & PAYMENTS ---
        var random = new Random(123);
        var mockStudents = new List<Student>();
        // Track students per group to enforce MaxCapacity
        // group1 already has student1 and student2, group2 already has student3
        var group1Count = 2;
        var group2Count = 1;
        for (int i = 1; i <= 100; i++)
        {
            var isPaid = random.Next(10) < 7; // 70% chance of paid

            // Determine group assignment respecting MaxCapacity
            Guid? assignedGroupId = null;
            var preferGroup1 = random.Next(2) == 0;
            if (preferGroup1 && group1Count < group1.MaxCapacity)
            {
                assignedGroupId = groupId1;
                group1Count++;
            }
            else if (group2Count < group2.MaxCapacity)
            {
                assignedGroupId = groupId2;
                group2Count++;
            }
            else if (group1Count < group1.MaxCapacity)
            {
                assignedGroupId = groupId1;
                group1Count++;
            }
            // else: student stays unassigned (no group has capacity)

            var newStudent = new Student
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                FirstName = $"Élève",
                LastName = $"Test {i}",
                DateOfBirth = new DateTime(2010 + random.Next(5), random.Next(1, 13), random.Next(1, 28)).ToUniversalTime(),
                GroupId = assignedGroupId,
                ParentId = parent.Id, // Link everyone to the single test parent for simplicity
                IsActive = true
            };
            mockStudents.Add(newStudent);
            
            // Randomly assign a payment status to enrich the "Overdue Payments" widget
            context.Payments.Add(new Payment
            {
                SchoolId = schoolId,
                StudentId = newStudent.Id,
                Amount = 50,
                Status = isPaid ? PaymentStatus.Paid : (random.Next(2) == 0 ? PaymentStatus.Overdue : PaymentStatus.Pending),
                DueDate = DateTime.UtcNow.AddDays(random.Next(-15, 15)),
                PaidDate = isPaid ? DateTime.UtcNow.AddDays(random.Next(-30, -5)) : null,
                Description = $"Mensualité Générée {i}"
            });

            // Randomly assign some exams
            if (random.Next(10) > 5) 
            {
                 context.Exams.Add(new Exam
                {
                    SchoolId = schoolId,
                    Title = $"Évaluation Continue {i}",
                    Type = ExamType.Revision,
                    ExamDate = DateTime.UtcNow.AddDays(random.Next(-30, 0)),
                    GroupId = newStudent.GroupId,
                    StudentId = newStudent.Id,
                    ExaminerId = teacherUserId,
                    SurahId = fatihaId,
                    StartVerse = 1,
                    EndVerse = 2,
                    FinalScore = random.Next(40, 100),
                    FinalStatus = ExamStatus.Completed
                });
            }
        }
        context.Students.AddRange(mockStudents);
        // ------------------------------------------

        // Create Academic Year
        context.AcademicYears.Add(new AcademicYear
        {
            SchoolId = schoolId,
            Name = "2024-2025",
            StartDate = new DateTime(2024, 9, 1).ToUniversalTime(),
            EndDate = new DateTime(2025, 6, 30).ToUniversalTime(),
            IsCurrent = true
        });

        // Progress Records
        var progressList = new List<Progress>
        {
            new Progress { SchoolId = schoolId, StudentId = student1.Id, SurahName = "Al-Baqara", SurahNumber = 2, JuzNumber = 1, Status = ProgressStatus.InProgress, RecordDate = DateTime.UtcNow.AddDays(-2), QualityScore = 8 },
            new Progress { SchoolId = schoolId, StudentId = student1.Id, SurahName = "Al-Fatiha", SurahNumber = 1, JuzNumber = 1, Status = ProgressStatus.Memorized, RecordDate = DateTime.UtcNow.AddDays(-7), QualityScore = 10 },
            new Progress { SchoolId = schoolId, StudentId = student2.Id, SurahName = "An-Nas", SurahNumber = 114, JuzNumber = 30, Status = ProgressStatus.Memorized, RecordDate = DateTime.UtcNow.AddDays(-3), QualityScore = 9 },
            new Progress { SchoolId = schoolId, StudentId = student2.Id, SurahName = "Al-Falaq", SurahNumber = 113, JuzNumber = 30, Status = ProgressStatus.InProgress, RecordDate = DateTime.UtcNow.AddDays(-1), QualityScore = 7 }
        };
        context.ProgressRecords.AddRange(progressList);

        // Exams
        var exam1 = new Exam
        {
            SchoolId = schoolId,
            Title = "Examen de Tajwid - Niveau 1",
            Type = ExamType.Tajwid,
            ExamDate = DateTime.UtcNow.AddDays(-10),
            GroupId = group1.Id,
            StudentId = studentId1,
            ExaminerId = teacherUserId, // Teacher is an examiner
            SurahId = fatihaId,
            StartVerse = 1,
            EndVerse = 7,
            FinalScore = 85,
            FinalStatus = ExamStatus.Completed
        };
        context.Exams.Add(exam1);

        var exam2 = new Exam
        {
            SchoolId = schoolId,
            Title = "Mémorisation Juz 30",
            Type = ExamType.Revision,
            ExamDate = DateTime.UtcNow.AddDays(5),
            GroupId = group1.Id,
            StudentId = studentId2,
            ExaminerId = teacherUserId,
            SurahId = fatihaId,
            StartVerse = 1,
            EndVerse = 7,
            FinalScore = 0,
            FinalStatus = ExamStatus.InProgress
        };
        context.Exams.Add(exam2);

        // Exam Results are now handled by ExamVerseEvaluation
        // Skipping old ExamResult seeding

        // Homework
        var homework1 = new Homework
        {
            SchoolId = schoolId,
            TeacherId = teacherId,
            GroupId = groupId1,
            Title = "Étude de la Sourate Al-Fatiha",
            Description = "Lire et mémoriser les 3 premiers versets.",
            Type = HomeworkType.Memorization,
            DueDate = DateTime.UtcNow.AddDays(2),
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        context.Homeworks.Add(homework1);

        var homework2 = new Homework
        {
            SchoolId = schoolId,
            TeacherId = teacherId,
            GroupId = groupId1,
            Title = "Règles du Tajwid - Nun Sakina",
            Description = "Faire les exercices du manuel à la page 15.",
            Type = HomeworkType.Written,
            DueDate = DateTime.UtcNow.AddDays(-1),
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };
        context.Homeworks.Add(homework2);

        // Homework Assignments
        context.HomeworkAssignments.Add(new HomeworkAssignment
        {
            SchoolId = schoolId,
            HomeworkId = homework1.Id,
            StudentId = studentId1,
            Status = HomeworkStatus.Pending
        });

        context.HomeworkAssignments.Add(new HomeworkAssignment
        {
            SchoolId = schoolId,
            HomeworkId = homework1.Id,
            StudentId = studentId2,
            Status = HomeworkStatus.Pending
        });

        context.HomeworkAssignments.Add(new HomeworkAssignment
        {
            SchoolId = schoolId,
            HomeworkId = homework2.Id,
            StudentId = studentId1,
            Status = HomeworkStatus.Submitted,
            SubmittedAt = DateTime.UtcNow.AddHours(-12),
            StudentNotes = "J'ai terminé les exercices demandés."
        });

        context.HomeworkAssignments.Add(new HomeworkAssignment
        {
            SchoolId = schoolId,
            HomeworkId = homework2.Id,
            StudentId = studentId2,
            Status = HomeworkStatus.Graded,
            SubmittedAt = DateTime.UtcNow.AddHours(-24),
            StudentNotes = "Voici mon travail.",
            Grade = 18,
            TeacherFeedback = "Excellent, continue ainsi !"
        });

        // Payments
        context.Payments.Add(new Payment
        {
            SchoolId = schoolId,
            StudentId = studentId1,
            Amount = 50,
            Status = PaymentStatus.Paid,
            DueDate = DateTime.UtcNow.AddMonths(-1),
            PaidDate = DateTime.UtcNow.AddMonths(-1).AddDays(5),
            Description = "Mensualité Janvier 2025"
        });

        context.Payments.Add(new Payment
        {
            SchoolId = schoolId,
            StudentId = studentId1,
            Amount = 50,
            Status = PaymentStatus.Pending,
            DueDate = DateTime.UtcNow.AddDays(15),
            Description = "Mensualité Février 2025"
        });

        context.Payments.Add(new Payment
        {
            SchoolId = schoolId,
            StudentId = studentId2,
            Amount = 50,
            Status = PaymentStatus.Overdue,
            DueDate = DateTime.UtcNow.AddDays(-5),
            Description = "Mensualité Janvier 2025"
        });

        // Schedules
        context.Schedules.Add(new Schedule
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            GroupId = groupId1,
            DayOfWeek = DayOfWeekEnum.Monday,
            StartTime = new TimeOnly(14, 0),
            EndTime = new TimeOnly(16, 0),
            RoomName = "Salle A"
        });

        context.Schedules.Add(new Schedule
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            GroupId = groupId1,
            DayOfWeek = DayOfWeekEnum.Wednesday,
            StartTime = new TimeOnly(14, 0),
            EndTime = new TimeOnly(16, 0),
            RoomName = "Salle A"
        });

        // ==========================================
        // SESSIONS (For Testing Workflow)
        // ==========================================

        // 1. COMPLETED SESSION (Group 1 - Al-Fatiha)
        var sessionId1 = Guid.NewGuid();
        var session1 = new Session
        {
            Id = sessionId1,
            SchoolId = schoolId,
            GroupId = groupId1,
            TeacherId = teacherId,
            Date = DateTime.UtcNow.AddDays(-2),
            StartTime = "14:00",
            EndTime = "16:00",
            Status = SessionStatus.Completed,
            SessionObjective = "Révision de la sourate Al-Fatiha avec focus sur les Makhaarij.\n\nRésumé Pédagogique:\nTrès bonne séance, le groupe maîtrise bien le début de la sourate.",
            SurahId = fatihaId,
            StartVerse = 1,
            EndVerse = 2
        };
        context.Sessions.Add(session1);

        // Attendances for Session 1
        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId1, StudentId = studentId1, Status = SessionAttendanceStatus.Present });
        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId1, StudentId = studentId2, Status = SessionAttendanceStatus.Late, Comment = "Arrivée avec 15 minutes de retard." });

        // Recitation 1: Youssef (Al-Fatiha)
        var recitation1Id = Guid.NewGuid();
        var recitation1 = new SessionRecitation
        {
            Id = recitation1Id, SessionId = sessionId1, StudentId = studentId1,
            SurahId = fatihaId, StartVerse = 1, EndVerse = 2,
            RecitationOrder = 1, GlobalComment = "Excellente récitation. Masha'Allah."
        };
        context.SessionRecitations.Add(recitation1);

        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = Guid.NewGuid(), SessionRecitationId = recitation1Id, VerseId = fatiha!.Verses!.ElementAt(0).Id, Status = SessionVerseEvaluationStatus.Correct });
        var verse2EvalId = Guid.NewGuid();
        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = verse2EvalId, SessionRecitationId = recitation1Id, VerseId = fatiha!.Verses!.ElementAt(1).Id, Status = SessionVerseEvaluationStatus.TajwidError, Comment = "Erreur de vocalisation légère" });
        context.SessionWordAnnotations.Add(new SessionWordAnnotation { Id = Guid.NewGuid(), SessionVerseEvaluationId = verse2EvalId, WordId = fatiha!.Verses!.ElementAt(1).Words!.ElementAt(2).Id, AnnotationType = SessionWordAnnotationType.TajwidError });


        // Recitation 2: Amina (Al-Fatiha)
        var recitation2Id = Guid.NewGuid();
        var recitation2 = new SessionRecitation
        {
            Id = recitation2Id, SessionId = sessionId1, StudentId = studentId2,
            SurahId = fatihaId, StartVerse = 1, EndVerse = 2,
            RecitationOrder = 2, GlobalComment = "Besoin de réviser le verset 2."
        };
        context.SessionRecitations.Add(recitation2);

        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = Guid.NewGuid(), SessionRecitationId = recitation2Id, VerseId = fatiha.Verses.ElementAt(0).Id, Status = SessionVerseEvaluationStatus.Correct });
        var aminaVerse2EvalId = Guid.NewGuid();
        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = aminaVerse2EvalId, SessionRecitationId = recitation2Id, VerseId = fatiha.Verses.ElementAt(1).Id, Status = SessionVerseEvaluationStatus.Blocked, AssistanceGiven = true, Comment = "Hésitation prolongée" });
        context.SessionWordAnnotations.Add(new SessionWordAnnotation { Id = Guid.NewGuid(), SessionVerseEvaluationId = aminaVerse2EvalId, WordId = fatiha.Verses.ElementAt(1).Words.ElementAt(0).Id, AnnotationType = SessionWordAnnotationType.Blocked });

        // 2. IN-PROGRESS SESSION (Group 2)
        var sessionId2 = Guid.NewGuid();
        var session2 = new Session
        {
            Id = sessionId2,
            SchoolId = schoolId,
            GroupId = groupId2,
            TeacherId = teacherId,
            Date = DateTime.UtcNow,
            StartTime = "09:00",
            EndTime = "11:00",
            Status = SessionStatus.InProgress,
            SessionObjective = "Mémorisation Al-Baqarah (versets 1-2)",
            SurahId = fatihaId,
            StartVerse = 1,
            EndVerse = 2
        };
        context.Sessions.Add(session2);

        // Attendance for Session 2 (Ongoing)
        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId2, StudentId = student3.Id, Status = SessionAttendanceStatus.Present });

        var recitation3Id = Guid.NewGuid();
        var recitation3 = new SessionRecitation
        {
            Id = recitation3Id, SessionId = sessionId2, StudentId = student3.Id,
            SurahId = fatihaId, StartVerse = 1, EndVerse = 2,
            RecitationOrder = 1
        };
        context.SessionRecitations.Add(recitation3);
        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = Guid.NewGuid(), SessionRecitationId = recitation3Id, VerseId = fatiha.Verses.ElementAt(0).Id, Status = SessionVerseEvaluationStatus.Correct });
        context.SessionVerseEvaluations.Add(new SessionVerseEvaluation { Id = Guid.NewGuid(), SessionRecitationId = recitation3Id, VerseId = fatiha.Verses.ElementAt(1).Id, Status = SessionVerseEvaluationStatus.TajwidError });


        // 3. PLANNED SESSION (Group 1 - Tomorrow)
        var sessionId3 = Guid.NewGuid();
        var session3 = new Session
        {
            Id = sessionId3,
            SchoolId = schoolId,
            GroupId = groupId1,
            TeacherId = teacherId,
            Date = DateTime.UtcNow.AddDays(1),
            StartTime = "14:00",
            EndTime = "16:00",
            Status = SessionStatus.Planned,
            SessionObjective = "Introduction aux lettres lunaires et solaires",
        };
        context.Sessions.Add(session3);

        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId3, StudentId = studentId1, Status = SessionAttendanceStatus.Present });
        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId3, StudentId = studentId2, Status = SessionAttendanceStatus.Present });

        // 4. UNASSIGNED SESSION (Planned - no group)
        var sessionId4 = Guid.NewGuid();
        var session4 = new Session
        {
            Id = sessionId4,
            SchoolId = schoolId,
            GroupId = null,
            TeacherId = teacherId,
            Date = DateTime.UtcNow.AddDays(2),
            StartTime = "16:00",
            EndTime = "18:00",
            Status = SessionStatus.Planned,
            SessionObjective = "Séance de rattrapage (Groupe à assigner)",
        };
        context.Sessions.Add(session4);

        // 5. CANCELLED SESSION (Group 2 - past)
        var sessionId5 = Guid.NewGuid();
        var session5 = new Session
        {
            Id = sessionId5,
            SchoolId = schoolId,
            GroupId = groupId2,
            TeacherId = teacherId,
            Date = DateTime.UtcNow.AddDays(-5),
            StartTime = "09:00",
            EndTime = "11:00",
            Status = SessionStatus.Cancelled,
            SessionObjective = "Séance annulée (Professeur malade)",
        };
        context.Sessions.Add(session5);
        context.SessionAttendances.Add(new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId5, StudentId = student3.Id, Status = SessionAttendanceStatus.Absent, Comment = "Séance annulée" });

        // --- MASS GENERATED SESSIONS ---
        for (int d = -30; d <= 30; d++)
        {
            if (d == -2 || d == 0 || d == 1 || d == 2 || d == -5) continue; // Skip days already handled
            
            var sessionDate = DateTime.UtcNow.AddDays(d);
            if (sessionDate.DayOfWeek == DayOfWeek.Friday || sessionDate.DayOfWeek == DayOfWeek.Saturday) continue; // Weekends

            var mockSessionId = Guid.NewGuid();
            context.Sessions.Add(new Session
            {
                Id = mockSessionId,
                SchoolId = schoolId,
                GroupId = random.Next(2) == 0 ? groupId1 : groupId2,
                TeacherId = teacherId,
                Date = sessionDate,
                StartTime = "14:00",
                EndTime = "16:00",
                Status = sessionDate < DateTime.UtcNow ? SessionStatus.Completed : SessionStatus.Planned,
                SessionObjective = $"Séance automatique du jour {d}",
                SurahId = fatihaId,
                StartVerse = 1,
                EndVerse = 7
            });
        }

        await context.SaveChangesAsync();
    }
}
