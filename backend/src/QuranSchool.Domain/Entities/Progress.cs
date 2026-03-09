using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class Progress : BaseEntity
{
    public Guid StudentId { get; set; }
    public string? SurahName { get; set; }
    public int? SurahNumber { get; set; }
    public int? JuzNumber { get; set; }
    public int? HizbNumber { get; set; }
    public int? StartVerse { get; set; }
    public int? EndVerse { get; set; }
    public ProgressStatus Status { get; set; } = ProgressStatus.NotStarted;
    public string? TeacherNotes { get; set; }
    public DateTime RecordDate { get; set; } = DateTime.UtcNow;
    public int? QualityScore { get; set; } // 1-10

    // Navigation
    public Student? Student { get; set; }
}
