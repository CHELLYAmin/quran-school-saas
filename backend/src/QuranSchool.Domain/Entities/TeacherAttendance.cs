using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class TeacherAttendance : BaseEntity
{
    public Guid TeacherId { get; set; }
    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
    public TimeOnly? CheckInTime { get; set; }

    // Navigation
    public Teacher? Teacher { get; set; }
}
