using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class Attendance : BaseEntity
{
    public Guid StudentId { get; set; }
    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
    public TimeOnly? CheckInTime { get; set; }

    // Navigation
    public Student? Student { get; set; }
}
