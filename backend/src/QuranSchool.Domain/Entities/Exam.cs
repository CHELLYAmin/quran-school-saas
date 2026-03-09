using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class Exam : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public ExamType Type { get; set; }
    public DateTime ExamDate { get; set; }
    public string? Description { get; set; }
    
    // Evaluation Logic
    public Guid StudentId { get; set; }
    public Guid ExaminerId { get; set; }
    public Guid? SurahId { get; set; }
    public string? ExamLevel { get; set; }
    public int? StartVerse { get; set; }
    public int? EndVerse { get; set; }
    public string? GlobalComment { get; set; }
    public decimal FinalScore { get; set; }
    public ExamStatus FinalStatus { get; set; }
    public bool IsLevelProgressionExam { get; set; }
    public string? TargetLevel { get; set; }

    // Navigation
    public Student? Student { get; set; }
    public User? Examiner { get; set; } // Examiner is a User with Examiner role
    public Surah? Surah { get; set; }
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }
    
    public ICollection<ExamVerseEvaluation> VerseEvaluations { get; set; } = new List<ExamVerseEvaluation>();
}
