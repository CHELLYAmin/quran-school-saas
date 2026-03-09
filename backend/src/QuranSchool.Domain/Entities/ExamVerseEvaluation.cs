using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class ExamVerseEvaluation : BaseEntity
{
    public Guid ExamId { get; set; }
    public Guid VerseId { get; set; }
    public VerseEvaluationStatus Status { get; set; }
    public bool AssistanceGiven { get; set; }
    public string? Comment { get; set; }

    public Exam? Exam { get; set; }
    public Verse? Verse { get; set; }
    public ICollection<ExamWordAnnotation> WordAnnotations { get; set; } = new List<ExamWordAnnotation>();
}
