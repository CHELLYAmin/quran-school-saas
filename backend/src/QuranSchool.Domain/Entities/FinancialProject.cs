using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class FinancialProject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;
    public ICollection<FinancialTransaction> Transactions { get; set; } = new List<FinancialTransaction>();
}
