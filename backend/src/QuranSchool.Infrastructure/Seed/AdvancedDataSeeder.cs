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

        // Check if large dataset already seeded
        if (await _context.Students.CountAsync() > 200) 
        {
            Console.WriteLine(">>> Bogus Dataset already exists. Skipping.");
            return;
        }

        Console.WriteLine(">>> Starting Advanced Bogus Seeding...");

        // 3. Create Basic Entities
        var students = new List<Student>();
        var parentIds = new List<Guid>();
        var teacherIds = new List<Guid>();

        // Generate 50 Parents
        for (int i = 0; i < 50; i++)
        {
            var pId = Guid.NewGuid();
            parentIds.Add(pId);
            _context.Parents.Add(new Parent { Id = pId, SchoolId = schoolId, FirstName = $"Parent{i}", LastName = "Bogus", Phone = "+33600000000" });
        }

        // Generate 10 Teachers
        for (int i = 0; i < 10; i++)
        {
            var tId = Guid.NewGuid();
            teacherIds.Add(tId);
            _context.Teachers.Add(new Teacher { Id = tId, SchoolId = schoolId, FirstName = $"Enseignant{i}", LastName = "Bogus", HireDate = DateTime.UtcNow.AddYears(-2) });
        }
        await _context.SaveChangesAsync();

        // Generate Levels with defined ranges
        var levels = new List<Level>
        {
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Débutant (Juz Amma)", StartSurah = 78, EndSurah = 114, Order = 1 },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Intermédiaire (Juz Tabarak)", StartSurah = 67, EndSurah = 77, Order = 2 },
            new Level { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Avancé (Al-Baqarah)", StartSurah = 1, EndSurah = 5, Order = 3 }
        };
        _context.Levels.AddRange(levels);
        await _context.SaveChangesAsync();

        // Generate Groups (Max 20 students per group rule)
        var groups = new List<Group>();
        var faker = new Faker();
        for (int i = 0; i < 15; i++) // 15 groups
        {
            var grp = new Group
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                Name = $"Groupe Bogus {i}",
                LevelId = faker.PickRandom(levels).Id,
                TeacherId = faker.PickRandom(teacherIds),
                MaxCapacity = 20
            };
            groups.Add(grp);
        }
        _context.Groups.AddRange(groups);
        await _context.SaveChangesAsync();

        // Generate 250 Students
        var studentFaker = new StudentFaker(schoolId, parentIds);
        var generatedStudents = studentFaker.Generate(250);

        // Distribute students enforcing MaxCapacity = 20
        var unassignedStudents = new Queue<Student>(generatedStudents);
        
        foreach (var group in groups)
        {
            var studentsToAssign = Math.Min(group.MaxCapacity, unassignedStudents.Count);
            for (int i = 0; i < studentsToAssign; i++)
            {
                var student = unassignedStudents.Dequeue();
                student.GroupId = group.Id;
                _context.Students.Add(student);
                students.Add(student);
            }
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

        Console.WriteLine($">>> Bogus Seeding Finished! Created {students.Count} students across {groups.Count} groups.");
    }
}
