using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Student : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public string? CurrentLevel { get; set; }
    
    // Gamification
    public int TotalXP { get; set; } = 0;
    public int CurrentStreak { get; set; } = 0;
    public int LongestStreak { get; set; } = 0;
    
    // Using a list of strings for simplicity to store badge identifiers
    public List<string> Badges { get; set; } = new List<string>();

    // Foreign Keys
    public Guid? GroupId { get; set; }
    public Guid? ParentId { get; set; }

    // Navigation
    public Group? Group { get; set; }
    public Parent? Parent { get; set; }
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<ExamResult> ExamResults { get; set; } = new List<ExamResult>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Progress> ProgressRecords { get; set; } = new List<Progress>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();

    public string FullName => $"{FirstName} {LastName}";
}
