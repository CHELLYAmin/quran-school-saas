using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? Type { get; set; } // Attendance, Payment, Exam, etc.
    public string? ReferenceId { get; set; } // Link to related entity

    // Navigation
    public User? User { get; set; }
}
