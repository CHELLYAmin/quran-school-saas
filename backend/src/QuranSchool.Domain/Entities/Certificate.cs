using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Certificate : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid? ExamId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
    public string? PdfUrl { get; set; }
    public string? CertificateNumber { get; set; }

    // Navigation
    public Student? Student { get; set; }
    public Exam? Exam { get; set; }
}
