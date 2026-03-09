using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class AcademicYear : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "2024-2025"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;

    // Navigation
    public School? School { get; set; }
}
