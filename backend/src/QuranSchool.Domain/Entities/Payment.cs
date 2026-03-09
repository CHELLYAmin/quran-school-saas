using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid StudentId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? Description { get; set; }
    public string? TransactionReference { get; set; }
    public decimal? Discount { get; set; }
    public string? DiscountReason { get; set; }

    // Navigation
    public Student? Student { get; set; }
}
