using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class UserActionLog : BaseEntity
{
    public Guid UserId { get; set; }
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Metadata { get; set; } // JSON string e.g.

    // Navigation
    public User? User { get; set; }
}
