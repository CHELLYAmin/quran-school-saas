using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class DonorProfile : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? InternalNote { get; set; }

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;
    public ICollection<FinancialTransaction> Donations { get; set; } = new List<FinancialTransaction>();
}
