using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

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

        var existingSchool = await context.Schools.FirstOrDefaultAsync(s => s.Id == schoolId);
        if (existingSchool == null)
        {
            // PROD FIX: If default school doesn't exist, try to find ANY existing school
            var anySchool = await context.Schools.FirstOrDefaultAsync();
            if (anySchool != null)
            {
                schoolId = anySchool.Id;
                Console.WriteLine($">>> Using existing production school: {anySchool.Name} ({schoolId})");
            }
            else
            {
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
                Console.WriteLine(">>> Created default school.");
            }
        }
        else
        {
            Console.WriteLine(">>> Using existing Al-Noor school.");
        }

        // Seed Permissions
        var permissions = new List<Permission>();
        var allPermStrings = QuranSchool.Domain.Constants.Permissions.All.ToList();
        
        var existingPerms = await context.Permissions.Where(p => p.SchoolId == schoolId).ToListAsync();
        
        foreach (var p in allPermStrings)
        {
            if (existingPerms.Any(x => x.Code == p)) continue;

            var parts = p.Split('_');
            var module = parts.Count() > 0 ? parts[0] : p;
            var action = parts.Count() > 1 ? parts[1] : "VIEW";
            permissions.Add(new Permission { Id = Guid.NewGuid(), SchoolId = schoolId, Code = p, Module = module, ActionType = action, Description = $"Permission {p}" });
        }
        if (permissions.Any())
        {
            context.Permissions.AddRange(permissions);
        }

        // Seed Roles
        var existingRoles = await context.Roles.Where(r => r.SchoolId == schoolId).ToListAsync();
        
        var superAdminRole = existingRoles.FirstOrDefault(r => r.Name == "SuperAdmin") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "SuperAdmin", IsSystemRole = true };
        var adminRole = existingRoles.FirstOrDefault(r => r.Name == "Admin") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Admin", IsSystemRole = true };
        var teacherRole = existingRoles.FirstOrDefault(r => r.Name == "Teacher") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Teacher", IsSystemRole = true };
        var examinerRole = existingRoles.FirstOrDefault(r => r.Name == "Examiner") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Examiner", IsSystemRole = true };
        var parentRole = existingRoles.FirstOrDefault(r => r.Name == "Parent") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Parent", IsSystemRole = true };
        var studentRole = existingRoles.FirstOrDefault(r => r.Name == "Student") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Student", IsSystemRole = true };
        var accountantRole = existingRoles.FirstOrDefault(r => r.Name == "Accountant") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Accountant", IsSystemRole = true };
        
        var newRoles = new List<Role>();
        if (!existingRoles.Any(r => r.Name == "SuperAdmin")) newRoles.Add(superAdminRole);
        if (!existingRoles.Any(r => r.Name == "Admin")) newRoles.Add(adminRole);
        if (!existingRoles.Any(r => r.Name == "Teacher")) newRoles.Add(teacherRole);
        if (!existingRoles.Any(r => r.Name == "Examiner")) newRoles.Add(examinerRole);
        if (!existingRoles.Any(r => r.Name == "Parent")) newRoles.Add(parentRole);
        if (!existingRoles.Any(r => r.Name == "Student")) newRoles.Add(studentRole);
        if (!existingRoles.Any(r => r.Name == "Accountant")) newRoles.Add(accountantRole);

        if (newRoles.Any())
        {
            context.Roles.AddRange(newRoles);
        }

        // Seed CMS Pages (Hub de Vie)
        var existingCmsPages = await context.CmsPages.Where(p => p.SchoolId == schoolId).ToListAsync();
        
        var cmsPages = new List<CmsPage>
        {
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Historique de la communauté", 
                Slug = "historique", 
                Excerpt = "Historique des musulmans de la Grande Région de Québec depuis 1971 — de quatre étudiants à une communauté dynamique.",
                Content = "# Historique de la communauté\n\n### Des débuts modestes à l'Université Laval (1971)\nÀ l’hiver 1971, quatre musulmans se sont rencontrés au Pavillon Maurice Parent de l’Université Laval pour faire connaissance et parler de l’Islam. Ce groupe, composé d'étudiants et chercheurs de l'Inde, du Pakistan, du Bangladesh et de l'Algérie, a formé le premier noyau de regroupement des musulmans de Québec. \n\nEn 1972, l’Association des Étudiants Musulmans de l’Université Laval (AEMUL) voit le jour, marquant la première prière de vendredi (salat el djoumouâ) avec seulement 6 personnes.\n\n### L'expansion et la création du CCIQ (1985)\nGrâce aux excellentes relations avec la Faculté de théologie, la communauté obtient sa première « Mosquée » au sous-sol du Pavillon Biermans-Moraud en 1978. Avec l’arrivée croissante d’étudiants et d’immigrants, le **Centre culturel islamique de Québec (CCIQ)** voit officiellement le jour en 1985.\n\n### Une communauté intégrée et dynamique\nAujourd'hui, la communauté compte entre 5000 et 6000 personnes provenant d'une quinzaine de pays. Ses membres sont des citoyens actifs : professeurs, ingénieurs, médecins, fonctionnaires et entrepreneurs, tous participant à la richesse collective de la Ville de Québec.\n\nLe CCIQ œuvre patiements pour faire connaître l’Islam, religion de Paix et de Justice, tout en contribuant activement au tissu social québécois par le bénévolat et l'engagement communautaire.",
                Category = "about", 
                IsPublished = true, 
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "C'est quoi l'Islam ?", 
                Slug = "islam", 
                Excerpt = "Découvrez les principes fondamentaux de l'Islam : une religion de paix, d'unicité et de responsabilité.",
                Content = "# C’est quoi l’Islam ?\n\nL’Islam, religion de l’Unicité, proclame que **Dieu est Un**, que le Coran est Sa parole et que le prophète Muhammad est Son dernier messager. \n\n### Une mission de gérance\nDieu a confié à l’homme une mission sur terre : être Son gérant. Le musulman est appelé à vivre dans le respect de toutes les créatures, dans la reconnaissance de leur diversité et en préservant l’harmonie de la création.\n\n### Spiritualité et Équilibre\nLa spiritualité islamique engage l’homme à nourrir son esprit comme il nourrit son corps. Il s’agit de vivre avec la conscience du Créateur tout en s'impliquant activement dans la société pour le bien et la justice.\n\n### Une culture de valeurs\nPlus qu’une religion, l’Islam est une culture fondée sur un système de valeurs morales. Elle donne la priorité absolue au sens de la vie et à la finalité des actions humaines, nourrissant aujourd’hui le cœur et la conscience de millions de fidèles à travers le monde.",
                Category = "islam", 
                IsPublished = true, 
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-31)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Nos Services Communautaires", 
                Slug = "services", 
                Excerpt = "Découvrez la gamme de services offerts par le CCIQ pour accompagner la communauté au quotidien.",
                Content = "# Nos Services\n\nLe CCIQ offre une structure complète pour répondre aux besoins spirituels et sociaux :\n\n- **Culte** : Prières quotidiennes et grande prière du Vendredi (Joumouâ).\n- **Éducation** : École coranique (Hifdh et Tajwid) et cours de langue arabe pour enfants et adultes.\n- **Savoir** : Bibliothèque islamique riche et conférences thématiques régulières.\n- **Social** : Aide à l'intégration, conseil et accompagnement, collecte et distribution de Zakat.\n- **Événements** : Soupers communautaires, journées de la famille et activités jeunesse.\n- **Rites** : Services de mariage et accompagnement funéraire complet.",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow.AddDays(-32)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Service Funéraire et Cimetière", 
                Slug = "cimetiere", 
                Excerpt = "Accompagnement des familles dans le deuil et gestion du Cimetière musulman de Québec.",
                Content = "# Services Funéraires et Cimetière\n\nLe CCIQ accompagne les familles dans les moments difficiles avec dignité et respect des rites islamiques.\n\n### Accompagnement complet\nNos bénévoles assistent les proches pour :\n- La préparation des documents administratifs (hôpital, État civil, Certificat de décès).\n- L'organisation du lavage mortuaire (Ghusl) et de la mise en linceul (Kaffan).\n- La prière funéraire (Salat al-Janaza).\n\n### Le Cimetière Musulman de Québec\nSitué à Saint-Augustin-de-Desmaures, il offre un lieu de repos éternel conforme à la Sunnah. \n\n> **Assistance 24h/24** : L’ayant droit ou la famille peut compter sur le soutien indéfectible de nos équipes pour soulager les démarches logistiques durant ces moments de deuil.",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 4,
                CreatedAt = DateTime.UtcNow.AddDays(-33)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Notre Enseignement", 
                Slug = "page-enseignement", 
                Excerpt = "Découvrez notre approche pédagogique pour l'apprentissage du Coran.",
                Content = "# Notre Enseignement\n\nNous proposons une méthode structurée basée sur :\n- **La Mémorisation (Hifdh)** : Un suivi personnalisé selon le rythme de l'élève.\n- **Le Tajwid** : Apprentissage des règles de récitation.\n- **La Compréhension** : Introduction au sens des versets.",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 6,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Ramadan 1447 / 2026", 
                Slug = "ramadan-2026", 
                Excerpt = "Le mois béni de Ramadan débutera inch'Allah autour du 1er Mars 2026.",
                Content = "# Annonce Ramadan 2026\n\nLe Centre Culturel Islamique de Québec a le plaisir de vous informer que le premier jour du mois de Ramadan 1447 sera approximativement le **dimanche 1er Mars 2026**.\n\n### Préparatifs :\n- **Tarawih** : Les prières débuteront la veille au soir.\n- **Iftar** : Des repas communautaires seront organisés pour les étudiants et les personnes seules.\n- **Zakat al-Fitr** : Les modalités de collecte seront annoncées durant la deuxième quinzaine du mois.\n\n*Que ce mois apporte paix, miséricorde et bénédiction à toute la communauté.*",
                Category = "announcement", 
                IsPublished = true, 
                SortOrder = 5,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            }
        };

        // Seed some Financial Transactions
        if (!await context.FinancialTransactions.AnyAsync(t => t.SchoolId == schoolId))
        {
            var category = await context.TransactionCategories.FirstOrDefaultAsync(c => c.SchoolId == schoolId);
            if (category != null)
            {
                context.FinancialTransactions.Add(new FinancialTransaction
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Amount = 1500,
                    Date = DateTime.UtcNow.AddDays(-1),
                    Type = FinancialTransactionType.Income,
                    Reference = "Cotisations Mars",
                    CategoryId = category.Id
                });
                context.FinancialTransactions.Add(new FinancialTransaction
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Amount = 500,
                    Date = DateTime.UtcNow,
                    Type = FinancialTransactionType.Expense,
                    Reference = "Loyer Mars",
                    CategoryId = category.Id
                });
            }
        }
        
        foreach (var p in cmsPages)
        {
            var existing = existingCmsPages.FirstOrDefault(e => e.Slug == p.Slug);
            if (existing != null)
            {
                existing.Title = p.Title;
                existing.Excerpt = p.Excerpt;
                existing.Content = p.Content;
                existing.Category = p.Category;
                existing.IsPublished = true;
                existing.SortOrder = p.SortOrder;
            }
            else
            {
                p.Id = Guid.NewGuid();
                context.CmsPages.Add(p);
            }
        }

        // Helper to link
        async Task LinkRolePerms(Role r, List<string> perms)
        {
            var existingRolePerms = await context.RolePermissions.Where(rp => rp.RoleId == r.Id).ToListAsync();
            foreach (var pCode in perms)
            {
                var permSelected = permissions.FirstOrDefault(x => x.Code == pCode) ?? existingPerms.FirstOrDefault(x => x.Code == pCode);
                if (permSelected != null)
                {
                    if (!existingRolePerms.Any(rp => rp.PermissionId == permSelected.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), SchoolId = schoolId, RoleId = r.Id, PermissionId = permSelected.Id });
                    }
                }
            }
        }

        // 1. SuperAdmin / Admin (All Permissions except RolesManage for Admin)
        await LinkRolePerms(superAdminRole, allPermStrings);
        
        var adminPerms = allPermStrings
            .Where(p => p != QuranSchool.Domain.Constants.Permissions.RolesManage)
            .ToList();
        await LinkRolePerms(adminRole, adminPerms);

        // 2. Teacher Permissions
        var teacherPerms = new List<string> { 
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
        await LinkRolePerms(teacherRole, teacherPerms);

        // 3. Examiner Permissions
        var examinerPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.ExamsView, QuranSchool.Domain.Constants.Permissions.ExamsManage,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(examinerRole, examinerPerms);

        // 4. Parent Permissions
        var parentPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.GroupsView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.TeachersView,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(parentRole, parentPerms);

        // 5. Student Permissions
        var studentPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.HomeworkView,
            QuranSchool.Domain.Constants.Permissions.GroupsView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.TeachersView,
            QuranSchool.Domain.Constants.Permissions.MushafView,
            QuranSchool.Domain.Constants.Permissions.SessionsView,
            QuranSchool.Domain.Constants.Permissions.ExamsView,
            QuranSchool.Domain.Constants.Permissions.AttendanceView
        };
        await LinkRolePerms(studentRole, studentPerms);

        // 6. Accountant Permissions
        var accountantPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView, QuranSchool.Domain.Constants.Permissions.PaymentsManage,
            QuranSchool.Domain.Constants.Permissions.FinanceView, QuranSchool.Domain.Constants.Permissions.FinanceManage
        };
        await LinkRolePerms(accountantRole, accountantPerms);

        // 7. Seed Levels
        var levels = new List<Level>();
        if (!await context.Levels.AnyAsync(l => l.SchoolId == schoolId))
        {
            levels.Add(new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 1 - Débutant", Order = 1, StartSurah = 114, EndSurah = 105, Description = "Apprentissage des petites sourates et bases du Tajwid" });
            levels.Add(new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 2 - Intermédiaire", Order = 2, StartSurah = 104, EndSurah = 90, Description = "Poursuite de la mémorisation du Juz Amma" });
            context.Levels.AddRange(levels);
            await context.SaveChangesAsync();
        }
        else
        {
            levels = await context.Levels.Where(l => l.SchoolId == schoolId).ToListAsync();
        }

        // 8. Seed Teachers
        var teachers = new List<Teacher>();
        if (!await context.Teachers.AnyAsync(t => t.SchoolId == schoolId))
        {
            var teacherData = new[]
            {
                new { First = "Ahmad", Last = "Benali", Email = "ahmed.b@example.com", Specialization = "Hifdh & Tajwid", IsExaminer = true },
                new { First = "Khadija", Last = "Mansour", Email = "khadija.m@example.com", Specialization = "Arabe & Coran", IsExaminer = false }
            };

            foreach (var t in teacherData)
            {
                var teacherId = Guid.NewGuid();
                var teacher = new Teacher
                {
                    Id = teacherId,
                    SchoolId = schoolId,
                    FirstName = t.First,
                    LastName = t.Last,
                    Email = t.Email,
                    Specialization = t.Specialization,
                    HireDate = DateTime.UtcNow.AddYears(-1)
                };
                teachers.Add(teacher);
                context.Teachers.Add(teacher);

                // Associated User
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    FirstName = t.First,
                    LastName = t.Last,
                    Email = t.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    LinkedProfileType = ProfileType.Teacher,
                    LinkedProfileId = teacherId,
                    IsActive = true
                };
                context.Users.Add(user);
                
                // Assign Roles
                context.UserRoles.Add(new UserRole { SchoolId = schoolId, UserId = user.Id, RoleId = teacherRole.Id });
                if (t.IsExaminer)
                {
                    context.UserRoles.Add(new UserRole { SchoolId = schoolId, UserId = user.Id, RoleId = examinerRole.Id });
                }
            }
            await context.SaveChangesAsync();
        }
        else
        {
            teachers = await context.Teachers.Where(t => t.SchoolId == schoolId).ToListAsync();
        }

        // 9. Seed Groups
        var groups = new List<Group>();
        if (!await context.Groups.AnyAsync(g => g.SchoolId == schoolId))
        {
            groups.Add(new Group { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Groupe Al-Fatiha", LevelId = levels[0].Id, TeacherId = teachers[0].Id, MaxCapacity = 15, Description = "Cours du Lundi et Mercredi" });
            groups.Add(new Group { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Groupe Al-Baqarah", LevelId = levels[1].Id, TeacherId = teachers[1].Id, MaxCapacity = 15, Description = "Cours du Mardi et Jeudi" });
            context.Groups.AddRange(groups);
            await context.SaveChangesAsync();
        }
        else
        {
            groups = await context.Groups.Where(g => g.SchoolId == schoolId).ToListAsync();
        }

        // 10. Seed Students
        var students = new List<Student>();
        if (!await context.Students.AnyAsync(s => s.SchoolId == schoolId))
        {
            var studentData = new[]
            {
                new { First = "Youssef", Last = "Zahra", Email = "youssef@example.com", GroupIdx = 0, XP = 1250 },
                new { First = "Amina", Last = "Zahra", Email = "amina@example.com", GroupIdx = 0, XP = 980 },
                new { First = "Omar", Last = "Farooq", Email = "omar@example.com", GroupIdx = 1, XP = 1500 },
                new { First = "Aisha", Last = "Siddiq", Email = "aisha@example.com", GroupIdx = 1, XP = 2100 }
            };

            foreach (var s in studentData)
            {
                var studentId = Guid.NewGuid();
                var student = new Student
                {
                    Id = studentId,
                    SchoolId = schoolId,
                    FirstName = s.First,
                    LastName = s.Last,
                    GroupId = groups[s.GroupIdx].Id,
                    TotalXP = s.XP,
                    DateOfBirth = DateTime.UtcNow.AddYears(-10),
                    EnrollmentDate = DateTime.UtcNow.AddMonths(-6),
                    CurrentLevel = levels[s.GroupIdx].Name
                };
                students.Add(student);
                context.Students.Add(student);

                // Associated User
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    FirstName = s.First,
                    LastName = s.Last,
                    Email = s.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    LinkedProfileType = ProfileType.Student,
                    LinkedProfileId = studentId,
                    IsActive = true
                };
                context.Users.Add(user);
                
                // Assign Role
                context.UserRoles.Add(new UserRole { SchoolId = schoolId, UserId = user.Id, RoleId = studentRole.Id });
            }
            await context.SaveChangesAsync();
        }
        else
        {
            students = await context.Students.Where(s => s.SchoolId == schoolId).ToListAsync();
        }

        // 11. Seed Sessions (Last 7 days and Next 7 days)
        if (!await context.Sessions.AnyAsync(s => s.SchoolId == schoolId))
        {
            var today = DateTime.UtcNow.Date;
            for (int i = -7; i <= 7; i++)
            {
                var sessionDate = today.AddDays(i);
                // Group 1: Mon (1), Wed (3), Fri (5)
                if (new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }.Contains(sessionDate.DayOfWeek))
                {
                    var session = new Session
                    {
                        Id = Guid.NewGuid(),
                        SchoolId = schoolId,
                        GroupId = groups[0].Id,
                        TeacherId = teachers[0].Id,
                        Date = sessionDate,
                        StartTime = "10:00",
                        EndTime = "12:00",
                        Status = sessionDate < today ? SessionStatus.Completed : SessionStatus.Planned,
                        SessionObjective = $"Mémorisation Sourate {levels[0].StartSurah}"
                    };
                    context.Sessions.Add(session);

                    // If past, seed attendance and progress
                    if (sessionDate < today)
                    {
                        foreach (var stu in students.Where(s => s.GroupId == groups[0].Id))
                        {
                            context.SessionAttendances.Add(new SessionAttendance
                            {
                                Id = Guid.NewGuid(),
                                SchoolId = schoolId,
                                SessionId = session.Id,
                                StudentId = stu.Id,
                                Status = SessionAttendanceStatus.Present
                            });

                            context.ProgressRecords.Add(new Progress
                            {
                                Id = Guid.NewGuid(),
                                SchoolId = schoolId,
                                StudentId = stu.Id,
                                SurahNumber = 114,
                                Status = ProgressStatus.Memorized,
                                QualityScore = 9,
                                RecordDate = sessionDate,
                                TeacherNotes = "Trés bien mémorisé."
                            });
                        }
                    }
                }

                // Group 2: Tue (2), Thu (4)
                if (new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday }.Contains(sessionDate.DayOfWeek))
                {
                    var session = new Session
                    {
                        Id = Guid.NewGuid(),
                        SchoolId = schoolId,
                        GroupId = groups[1].Id,
                        TeacherId = teachers[1].Id,
                        Date = sessionDate,
                        StartTime = "14:00",
                        EndTime = "16:00",
                        Status = sessionDate < today ? SessionStatus.Completed : SessionStatus.Planned,
                        SessionObjective = $"Révision Sourate {levels[1].StartSurah}"
                    };
                    context.Sessions.Add(session);
                }
            }
            await context.SaveChangesAsync();
        }

        // 12. Seed Schedules
        if (!await context.Schedules.AnyAsync(s => s.SchoolId == schoolId))
        {
            // Group 1 Schedule
            context.Schedules.Add(new Schedule { Id = Guid.NewGuid(), SchoolId = schoolId, GroupId = groups[0].Id, DayOfWeek = 1, StartTime = "10:00", EndTime = "12:00", RoomName = "Salle 1" });
            context.Schedules.Add(new Schedule { Id = Guid.NewGuid(), SchoolId = schoolId, GroupId = groups[0].Id, DayOfWeek = 3, StartTime = "10:00", EndTime = "12:00", RoomName = "Salle 1" });
            context.Schedules.Add(new Schedule { Id = Guid.NewGuid(), SchoolId = schoolId, GroupId = groups[0].Id, DayOfWeek = 5, StartTime = "10:00", EndTime = "12:00", RoomName = "Salle 1" });

            // Group 2 Schedule
            context.Schedules.Add(new Schedule { Id = Guid.NewGuid(), SchoolId = schoolId, GroupId = groups[1].Id, DayOfWeek = 2, StartTime = "14:00", EndTime = "16:00", RoomName = "Salle 2" });
            context.Schedules.Add(new Schedule { Id = Guid.NewGuid(), SchoolId = schoolId, GroupId = groups[1].Id, DayOfWeek = 4, StartTime = "14:00", EndTime = "16:00", RoomName = "Salle 2" });
            
            await context.SaveChangesAsync();
        }

        Console.WriteLine(">>> Seeding completed successfully.");
    }
}
