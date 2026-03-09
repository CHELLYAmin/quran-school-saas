using Bogus;
using QuranSchool.Domain.Entities;

namespace QuranSchool.Infrastructure.Seed.Fakers;

public class StudentFaker : Faker<Student>
{
    public StudentFaker(Guid schoolId, List<Guid> parentIds)
    {
        // Enforce deterministic seeding
        Randomizer.Seed = new Random(8675309);

        RuleFor(s => s.Id, f => f.Random.Guid());
        RuleFor(s => s.SchoolId, f => schoolId);
        RuleFor(s => s.FirstName, f => f.Name.FirstName());
        RuleFor(s => s.LastName, f => f.Name.LastName());
        
        // Students are typically aged between 6 and 18 for this type of system
        RuleFor(s => s.DateOfBirth, f => f.Date.Past(12, DateTime.UtcNow.AddYears(-6)));
        
        RuleFor(s => s.ParentId, f => f.PickRandom(parentIds));
        RuleFor(s => s.IsActive, f => f.Random.Bool(0.9f)); // 90% active
        
        // GroupId will be assigned later by the seeder to enforce the max 20 per group rule
    }
}
