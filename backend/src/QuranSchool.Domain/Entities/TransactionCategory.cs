using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class TransactionCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public FinancialTransactionType Type { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;
    public ICollection<FinancialTransaction> Transactions { get; set; } = new List<FinancialTransaction>();
}
