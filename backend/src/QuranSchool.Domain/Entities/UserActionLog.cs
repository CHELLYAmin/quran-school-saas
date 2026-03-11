using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class UserActionLog : BaseEntity
{
    public Guid UserId { get; set; }
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
    public string? Metadata { get; set; } // JSON string e.g.
    public string? IpAddress { get; set; }

    // Multi-tenancy (SaaS V3)
    public Guid SchoolId { get; set; }
    public School? School { get; set; }

    // Navigation
    public User? User { get; set; }
}
