using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class StaffAbsence : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public StaffAbsenceType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsValidated { get; set; } = false;

    // Relationships
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;
}
