using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class Session : BaseEntity
{
    public Guid? GroupId { get; set; }
    public Guid TeacherId { get; set; }
    public DateTime Date { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Planned;
    public string? SessionObjective { get; set; }
    
    public Guid? SurahId { get; set; }
    public int? StartVerse { get; set; }
    public int? EndVerse { get; set; }

    public bool IsOnline { get; set; } = false;
    public string? MeetingUrl { get; set; }

    public ICollection<SessionAttendance> Attendances { get; set; } = new List<SessionAttendance>();
    public ICollection<SessionRecitation> Recitations { get; set; } = new List<SessionRecitation>();

    public Group? Group { get; set; }
    public Teacher? Teacher { get; set; }
}

public class SessionAttendance : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }
    public SessionAttendanceStatus Status { get; set; }
    public string? Comment { get; set; }

    public Session? Session { get; set; }
    public Student? Student { get; set; }
}

public class SessionRecitation : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }
    public Guid SurahId { get; set; }
    public int StartVerse { get; set; }
    public int EndVerse { get; set; }
    public int RecitationOrder { get; set; }
    public int? QualityScore { get; set; }
    public string? GlobalComment { get; set; }
    
    public ICollection<SessionVerseEvaluation> VerseEvaluations { get; set; } = new List<SessionVerseEvaluation>();
    
    public Session? Session { get; set; }
    public Student? Student { get; set; }
    public Surah? Surah { get; set; }
}

public class SessionVerseEvaluation : BaseEntity
{
    public Guid SessionRecitationId { get; set; }
    public Guid VerseId { get; set; }
    public SessionVerseEvaluationStatus Status { get; set; }
    public bool AssistanceGiven { get; set; }
    public string? Comment { get; set; }

    public ICollection<SessionWordAnnotation> WordAnnotations { get; set; } = new List<SessionWordAnnotation>();
    public SessionRecitation? Recitation { get; set; }
    public Verse? Verse { get; set; }
}

public class SessionWordAnnotation : BaseEntity
{
    public Guid SessionVerseEvaluationId { get; set; }
    public Guid WordId { get; set; }
    public SessionWordAnnotationType AnnotationType { get; set; }
    public string? Comment { get; set; }

    public SessionVerseEvaluation? VerseEvaluation { get; set; }
    public VerseWord? Word { get; set; }
}

public class StudentProgressSnapshot : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid SessionId { get; set; }
    public Guid SurahId { get; set; }
    public string? VersesCovered { get; set; } // e.g. "1-7"
    public int BlockedCount { get; set; }
    public int ForgottenCount { get; set; }
    public int TajwidErrorsCount { get; set; }
    public double PerformanceScore { get; set; }
    public DateTime Date { get; set; }

    public Session? Session { get; set; }
    public Student? Student { get; set; }
}
