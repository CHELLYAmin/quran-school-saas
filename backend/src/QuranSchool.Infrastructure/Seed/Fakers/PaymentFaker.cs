using Bogus;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Infrastructure.Seed.Fakers;

public class PaymentFaker : Faker<Payment>
{
    public PaymentFaker(Guid schoolId, List<Guid> studentIds)
    {
        Randomizer.Seed = new Random(8675309);

        var statuses = new[] { PaymentStatus.Paid, PaymentStatus.Paid, PaymentStatus.Paid, PaymentStatus.Paid, PaymentStatus.Paid, PaymentStatus.Pending, PaymentStatus.Overdue };

        RuleFor(p => p.Id, f => f.Random.Guid());
        RuleFor(p => p.SchoolId, f => schoolId);
        RuleFor(p => p.StudentId, f => f.PickRandom(studentIds));
        
        // Amount is typically fixed (e.g., 50 EUR per month)
        RuleFor(p => p.Amount, f => 50.0m);
        
        RuleFor(p => p.Status, f => f.PickRandom(statuses));
        
        // Due date over the past 6 months
        RuleFor(p => p.DueDate, f => f.Date.Recent(180));
        
        // If paid, paid between due date - 5 days and due date + 15 days
        RuleFor(p => p.PaidDate, (f, p) => p.Status == PaymentStatus.Paid ? p.DueDate.AddDays(f.Random.Int(-5, 15)) : (DateTime?)null);
        
        RuleFor(p => p.Description, (f, p) => $"Frais de scolarité - {p.DueDate:MMMM yyyy}");
    }
}
