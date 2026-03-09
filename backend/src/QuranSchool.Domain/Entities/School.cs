using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<AcademicYear> AcademicYears { get; set; } = new List<AcademicYear>();
}
