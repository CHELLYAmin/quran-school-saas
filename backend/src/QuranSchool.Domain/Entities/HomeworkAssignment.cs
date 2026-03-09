using QuranSchool.Domain.Enums;
using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class HomeworkAssignment : BaseEntity
{
    
    public Guid HomeworkId { get; set; }
    public Homework? Homework { get; set; }

    public Guid StudentId { get; set; }
    public Student? Student { get; set; }

    public HomeworkStatus Status { get; set; } = HomeworkStatus.Pending;
    public string? StudentNotes { get; set; }
    public DateTime? SubmittedAt { get; set; }

    public string? TeacherFeedback { get; set; }
    public int? Grade { get; set; } // 0-10 or 0-100
}
