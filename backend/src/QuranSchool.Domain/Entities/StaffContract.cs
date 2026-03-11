using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class StaffContract : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public StaffContractType Type { get; set; }
    public decimal? Salary { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public StaffContractStatus Status { get; set; }
    public string? DocumentUrl { get; set; }

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;
}
