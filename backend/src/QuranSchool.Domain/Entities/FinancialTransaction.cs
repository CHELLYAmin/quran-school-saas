using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class FinancialTransaction : BaseEntity
{
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public FinancialTransactionType Type { get; set; }
    public TransactionPaymentMethod PaymentMethod { get; set; }
    public string? Reference { get; set; } // Facture, Reçu, Transaction ID
    public string? Note { get; set; }
    public string? AttachmentUrl { get; set; }

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public TransactionCategory Category { get; set; } = null!;

    public Guid? ProjectId { get; set; }
    public FinancialProject? Project { get; set; }

    public Guid? DonorId { get; set; }
    public DonorProfile? Donor { get; set; }
}
