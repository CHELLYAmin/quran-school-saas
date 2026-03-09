using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class ExamResult : BaseEntity
{
    public Guid ExamId { get; set; }
    public Guid StudentId { get; set; }
    public decimal Score { get; set; }
    public string? Notes { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }

    // Navigation
    public Exam? Exam { get; set; }
    public Student? Student { get; set; }
}
