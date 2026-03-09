using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Teacher : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public string? Bio { get; set; }
    public DateTime? HireDate { get; set; }

    // Navigation
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<TeacherAttendance> Attendances { get; set; } = new List<TeacherAttendance>();
}
