using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Parent : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Occupation { get; set; }

    // Navigation
    public ICollection<Student> Children { get; set; } = new List<Student>();
}
