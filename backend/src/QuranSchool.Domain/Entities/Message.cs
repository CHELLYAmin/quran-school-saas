using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Message : BaseEntity
{
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Sender { get; set; }
    public User? Receiver { get; set; }
}
