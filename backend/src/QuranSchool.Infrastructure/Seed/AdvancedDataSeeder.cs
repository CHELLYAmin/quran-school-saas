using Microsoft.EntityFrameworkCore;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Infrastructure.Seed.Fakers;
using Bogus;

namespace QuranSchool.Infrastructure.Seed;

public class AdvancedDataSeeder
{
    private readonly AppDbContext _context;

    public AdvancedDataSeeder(AppDbContext context)
    {
        _context = context;
        Randomizer.Seed = new Random(8675309);
    }

    public async Task SeedLargeDatasetAsync()
    {
        // 1. Base Setup (Admin, Roles, Permissions, Quran Data, Users, School)
        await SeedData.SeedAsync(_context);

        var school = await _context.Schools.FirstOrDefaultAsync();
        if (school == null) return;
        var schoolId = school.Id;

        Console.WriteLine(">>> Starting Advanced Bogus Seeding...");

        // Seed Hub Content (if empty)
        if (!await _context.CmsPages.AnyAsync(p => p.SchoolId == schoolId))
        {
            Console.WriteLine(">>> Seeding Hub Content...");
            // CMS pages are now seeded inside SeedData.SeedAsync if they don't exist
        }

        if (!await _context.DonationCampaigns.AnyAsync(d => d.SchoolId == schoolId))
        {
             // 4. Volunteer & Donations
            var donationCampaigns = new List<DonationCampaign>
            {
                new DonationCampaign
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Campagne Ramadan : Paniers Alimentaires",
                    Description = "Soutenez les familles nécessiteuses de notre communauté pendant ce mois béni. Chaque panier contient des denrées de base pour un mois.",
                    TargetAmount = 15000,
                    CurrentAmount = 4500,
                    EndDate = DateTime.UtcNow.AddDays(20).ToUniversalTime(),
                    IsPublished = true
                },
                new DonationCampaign
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Extension de la Bibliothèque Islamique",
                    Description = "Nous souhaitons acquérir de nouveaux ouvrages de Tafsir, Hadith et Fiqh pour enrichir notre bibliothèque scolaire.",
                    TargetAmount = 5000,
                    CurrentAmount = 1200,
                    EndDate = DateTime.UtcNow.AddMonths(2).ToUniversalTime(),
                    IsPublished = true
                }
            };
            _context.DonationCampaigns.AddRange(donationCampaigns);
            
            var volunteerMissions = new List<VolunteerMission>
            {
                new VolunteerMission
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Bénévolat : Accueil des nouveaux élèves",
                    Description = "Nous cherchons des volontaires pour guider les parents et les élèves lors de la journée d'accueil.",
                    RequiredVolunteers = 10,
                    CurrentVolunteers = 3,
                    Date = DateTime.UtcNow.AddDays(7).ToUniversalTime(),
                    IsPublished = true,
                    Location = "Hall principal de l'école"
                },
                new VolunteerMission
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Organisation de la Fête du Coran",
                    Description = "Participez à la logistique et à l'organisation de notre événement annuel de remise des prix.",
                    RequiredVolunteers = 15,
                    CurrentVolunteers = 5,
                    Date = DateTime.UtcNow.AddMonths(1).ToUniversalTime(),
                    IsPublished = true,
                    Location = "Grande Salle Polyvalente"
                }
            };
            _context.VolunteerMissions.AddRange(volunteerMissions);
            await _context.SaveChangesAsync();
        }

        // Check if large dataset already seeded
        if (await _context.Students.CountAsync() > 200) 
        {
            Console.WriteLine(">>> Bogus Dataset already exists. Skipping.");
            return;
        }

        // 3. Create Basic Entities
        var students = new List<Student>();
        var parentIds = new List<Guid>();
        var teacherIds = new List<Guid>();
        var examinerIds = new List<Guid>();
        var faker = new Faker("fr");
        
        var teacherRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Teacher");
        var parentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Parent");
        var studentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
        var examinerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Examiner");

        // Generate 100 Parents
        for (int i = 1; i <= 100; i++)
        {
            var pId = Guid.NewGuid();
            var email = $"parent{i}@quranschool.com";
            parentIds.Add(pId);
            
            _context.Parents.Add(new Parent { Id = pId, SchoolId = schoolId, FirstName = faker.Name.FirstName(), LastName = faker.Name.LastName(), Email = email, Phone = faker.Phone.PhoneNumber() });
            
            var user = new User { Id = Guid.NewGuid(), SchoolId = schoolId, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"), FirstName = "Parent", LastName = $"Test {i}", PreferredLanguage = "fr", LinkedProfileType = QuranSchool.Domain.Enums.ProfileType.Parent, LinkedProfileId = pId };
            _context.Users.Add(user);
            if (parentRole != null) _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = user.Id, RoleId = parentRole.Id });
        }

        // Generate 40 Teachers
        for (int i = 1; i <= 40; i++)
        {
            var tId = Guid.NewGuid();
            var email = $"teacher{i}@quranschool.com";
            teacherIds.Add(tId);
            _context.Teachers.Add(new Teacher { Id = tId, SchoolId = schoolId, FirstName = faker.Name.FirstName(), LastName = faker.Name.LastName(), Email = email, HireDate = DateTime.UtcNow.AddYears(-faker.Random.Number(1, 5)), Specialization = faker.PickRandom("Hifdh", "Tajwid", "Qira'at", "Tafsir") });

            var user = new User { Id = Guid.NewGuid(), SchoolId = schoolId, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"), FirstName = "Enseignant", LastName = $"Test {i}", PreferredLanguage = "fr", LinkedProfileType = QuranSchool.Domain.Enums.ProfileType.Teacher, LinkedProfileId = tId };
            _context.Users.Add(user);
            if (teacherRole != null) _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = user.Id, RoleId = teacherRole.Id });
        }

        // Generate 10 Examiners
        for (int i = 1; i <= 10; i++)
        {
            var pId = Guid.NewGuid();
            var email = $"examiner{i}@quranschool.com";
            _context.Teachers.Add(new Teacher { Id = pId, SchoolId = schoolId, FirstName = faker.Name.FirstName(), LastName = faker.Name.LastName(), Email = email, HireDate = DateTime.UtcNow.AddYears(-faker.Random.Number(1, 5)), Specialization = "Examen" });

            var user = new User { Id = Guid.NewGuid(), SchoolId = schoolId, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"), FirstName = "Examinateur", LastName = $"Test {i}", PreferredLanguage = "fr", LinkedProfileType = QuranSchool.Domain.Enums.ProfileType.Teacher, LinkedProfileId = pId };
            examinerIds.Add(user.Id); // Fix: Use User.Id for Examiner relation
            _context.Users.Add(user);
            if (examinerRole != null) _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = user.Id, RoleId = examinerRole.Id });
        }
        await _context.SaveChangesAsync();

        // Generate All Levels
        var levels = new List<Level>
        {
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 1 (Débutants)", StartSurah = 105, EndSurah = 114, Order = 1, Description = "Apprentissage des lettres et petites sourates" },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 2 (Préparatoire)", StartSurah = 87, EndSurah = 104, Order = 2, Description = "Juz Amma pt 2" },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 3 (Intermédiaire)", StartSurah = 78, EndSurah = 86, Order = 3, Description = "Juz Amma pt 1" },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 4 (Avancé)", StartSurah = 67, EndSurah = 77, Order = 4, Description = "Juz Tabarak" },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Niveau 5 (Maîtrise)", StartSurah = 1, EndSurah = 5, Order = 5, Description = "Al-Baqarah et suite" }
        };
        _context.Levels.AddRange(levels);
        await _context.SaveChangesAsync();

        // Generate Groups (Max 10 students per group rule)
        var groups = new List<Group>();
        for (int i = 1; i <= 30; i++) // 30 groups max 10 = 300 capacity (enough for 250 students)
        {
            var grp = new Group
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Name = $"Groupe Elite {i}",
                LevelId = faker.PickRandom(levels).Id,
                TeacherId = faker.PickRandom(teacherIds),
                MaxCapacity = 10
            };
            groups.Add(grp);
        }
        _context.Groups.AddRange(groups);
        await _context.SaveChangesAsync();

        // Generate 250 Students
        var studentFaker = new StudentFaker(schoolId, parentIds);
        var generatedStudents = studentFaker.Generate(250);

        // Distribute students enforcing MaxCapacity = 10
        var unassignedStudents = new Queue<Student>(generatedStudents);
        int studentIdx = 1;
        
        foreach (var group in groups)
        {
            var studentsToAssign = Math.Min(group.MaxCapacity, unassignedStudents.Count);
            for (int i = 0; i < studentsToAssign; i++)
            {
                var student = unassignedStudents.Dequeue();
                student.GroupId = group.Id;
                string email = $"student{studentIdx}@quranschool.com";
                _context.Students.Add(student);
                students.Add(student);

                var user = new User { Id = Guid.NewGuid(), SchoolId = schoolId, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"), FirstName = student.FirstName, LastName = student.LastName, PreferredLanguage = "fr", LinkedProfileType = QuranSchool.Domain.Enums.ProfileType.Student, LinkedProfileId = student.Id };
                _context.Users.Add(user);
                if (studentRole != null) _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = user.Id, RoleId = studentRole.Id });
                studentIdx++;
            }
        }
        
        // Add any remaining unassigned students
        while (unassignedStudents.Any())
        {
            var student = unassignedStudents.Dequeue();
            student.GroupId = null;
            string email = $"student{studentIdx}@quranschool.com";
            _context.Students.Add(student);
            students.Add(student);

            var user = new User { Id = Guid.NewGuid(), SchoolId = schoolId, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"), FirstName = student.FirstName, LastName = student.LastName, PreferredLanguage = "fr", LinkedProfileType = QuranSchool.Domain.Enums.ProfileType.Student, LinkedProfileId = student.Id };
            _context.Users.Add(user);
            if (studentRole != null) _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), SchoolId = schoolId, UserId = user.Id, RoleId = studentRole.Id });
            studentIdx++;
        }
        await _context.SaveChangesAsync();

        // Fetch deep Quran entities for session generating
        var allSurahs = await _context.Surahs.Include(s => s.Verses).ThenInclude(v => v.Words).ToListAsync();

        // Generate session history per group
        var sessionFaker = new SessionHistoryFaker(schoolId);
        foreach (var group in groups)
        {
            var groupStudents = students.Where(s => s.GroupId == group.Id).ToList();
            if (groupStudents.Any())
            {
                // Generate deep linked session objects
                var groupSessions = sessionFaker.GenerateHistoricalSessions(group, groupStudents, allSurahs, monthsBack: 3);
                foreach (var s in groupSessions)
                {
                    _context.Sessions.Add(s);
                    _context.SessionAttendances.AddRange(s.Attendances);
                    foreach (var r in s.Recitations)
                    {
                        _context.SessionRecitations.Add(r);
                        _context.SessionVerseEvaluations.AddRange(r.VerseEvaluations);
                        foreach (var ve in r.VerseEvaluations)
                        {
                            if (ve.WordAnnotations != null) _context.SessionWordAnnotations.AddRange(ve.WordAnnotations);
                        }
                    }
                }
            }
        }
        await _context.SaveChangesAsync();

        // Generate Payments 
        var paymentFaker = new PaymentFaker(schoolId, students.Select(s => s.Id).ToList());
        var payments = paymentFaker.Generate(600); // multiple payments per student
        _context.Payments.AddRange(payments);
        await _context.SaveChangesAsync();

        Console.WriteLine(">>> Generating Exams, Homework, and Missions...");
        
        // 1. Exams
        var exams = new List<Exam>();
        var examTypes = new[] { QuranSchool.Domain.Enums.ExamType.Hifdh, QuranSchool.Domain.Enums.ExamType.Tajwid, QuranSchool.Domain.Enums.ExamType.Revision };
        var examStatuses = new[] { QuranSchool.Domain.Enums.ExamStatus.Completed, QuranSchool.Domain.Enums.ExamStatus.Planned, QuranSchool.Domain.Enums.ExamStatus.InProgress };
        
        foreach (var student in students.Take(150)) // 150 students have exams
        {
            var exam = new Exam
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Title = $"Examen de {faker.PickRandom("Hifdh", "Tajwid", "Révision")}",
                Type = faker.PickRandom(examTypes),
                ExamDate = faker.Date.Past(1).ToUniversalTime(),
                Description = "Examen d'évaluation périodique",
                StudentId = student.Id,
                ExaminerId = faker.PickRandom(examinerIds),
                GlobalComment = "Très bon effort, continuer la révision.",
                FinalScore = faker.Random.Number(50, 100),
                FinalStatus = faker.PickRandom(examStatuses),
                IsLevelProgressionExam = faker.Random.Bool(),
                GroupId = student.GroupId
            };
            exams.Add(exam);
        }
        _context.Exams.AddRange(exams);
        
        // 2. Homeworks
        var homeworks = new List<Homework>();
        var homeworkAssignments = new List<HomeworkAssignment>();
        foreach (var group in groups)
        {
            for (int i = 0; i < 3; i++) // 3 homeworks per group
            {
                var hw = new Homework
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = $"Devoir: {faker.PickRandom("Mémoriser", "Réviser")} {faker.PickRandom("Al-Baqarah", "Yasin", "Al-Mulk")}",
                    Description = "Veuillez enregistrer votre récitation et l'envoyer.",
                    Type = QuranSchool.Domain.Enums.HomeworkType.Memorization,
                    DueDate = faker.Date.Soon(7).ToUniversalTime(),
                    GroupId = group.Id,
                    TeacherId = group.TeacherId.Value
                };
                homeworks.Add(hw);
                
                var groupStudents = students.Where(s => s.GroupId == group.Id).ToList();
                foreach (var gs in groupStudents)
                {
                    homeworkAssignments.Add(new HomeworkAssignment
                    {
                        Id = Guid.NewGuid(),
                        SchoolId = schoolId,
                        HomeworkId = hw.Id,
                        StudentId = gs.Id,
                        Status = faker.PickRandom(QuranSchool.Domain.Enums.HomeworkStatus.Pending, QuranSchool.Domain.Enums.HomeworkStatus.Submitted, QuranSchool.Domain.Enums.HomeworkStatus.Graded),
                        Grade = faker.Random.Int(10, 20),
                        TeacherFeedback = "Bien reçu."
                    });
                }
            }
        }
        _context.Homeworks.AddRange(homeworks);
        _context.HomeworkAssignments.AddRange(homeworkAssignments);
        
        // 3. Student Missions (Gamification)
        var missions = new List<StudentMission>();
        var missionTypes = new[] { QuranSchool.Domain.Enums.MissionType.ManualAssignment, QuranSchool.Domain.Enums.MissionType.SmartRevision };
        var targetTypes = new[] { QuranSchool.Domain.Enums.MissionTargetType.Surah, QuranSchool.Domain.Enums.MissionTargetType.Hizb };
        foreach (var student in students)
        {
            for (int i = 0; i < 2; i++) // 2 missions per student
            {
                missions.Add(new StudentMission
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    StudentId = student.Id,
                    Type = faker.PickRandom(missionTypes),
                    TargetType = faker.PickRandom(targetTypes),
                    DueDate = faker.Date.Soon(5).ToUniversalTime(),
                    Status = faker.PickRandom(QuranSchool.Domain.Enums.MissionStatus.Pending, QuranSchool.Domain.Enums.MissionStatus.Completed),
                    QualityScore = faker.Random.Int(1, 5),
                    CompletedAt = faker.Date.Recent(5).ToUniversalTime()
                });
            }
        }
        _context.StudentMissions.AddRange(missions);

        // Hub content moved to beginning of method

        await _context.SaveChangesAsync();

        Console.WriteLine($">>> Bogus Seeding Finished! Created {students.Count} students across {groups.Count} groups.");
    }
}
