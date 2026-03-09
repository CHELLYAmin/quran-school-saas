using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class ExamWordAnnotation : BaseEntity
{
    public Guid VerseEvaluationId { get; set; }
    public Guid WordId { get; set; }
    public WordAnnotationType AnnotationType { get; set; }
    public string? Comment { get; set; }

    public ExamVerseEvaluation? VerseEvaluation { get; set; }
    public VerseWord? Word { get; set; }
}
