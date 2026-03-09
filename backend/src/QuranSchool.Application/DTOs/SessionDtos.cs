using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Session;

public record CreateSessionRequest(
    Guid? GroupId,
    DateTime Date,
    string StartTime,
    string EndTime,
    string? SessionObjective,
    Guid? SurahId = null,
    int? StartVerse = null,
    int? EndVerse = null,
    bool IsOnline = false,
    string? MeetingUrl = null
);

public record UpdateSessionStatusRequest(SessionStatus Status);

public record SessionAttendanceDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    SessionAttendanceStatus Status,
    string? Comment
);

public record MarkSessionAttendanceRequest(List<SessionAttendanceDto> Attendances);

public record StartSessionRecitationRequest(
    Guid StudentId,
    int SurahNumber,
    int StartVerse,
    int EndVerse
);

public record SessionWordAnnotationDto(
    Guid Id,
    Guid WordId,
    SessionWordAnnotationType AnnotationType,
    string? Comment
);

public record SessionVerseEvaluationDto(
    Guid Id,
    Guid VerseId,
    SessionVerseEvaluationStatus Status,
    bool AssistanceGiven,
    string? Comment,
    List<SessionWordAnnotationDto> WordAnnotations
);

public record SessionRecitationResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid SurahId,
    string SurahName,
    int StartVerse,
    int EndVerse,
    int RecitationOrder,
    string? GlobalComment,
    DateTime CreatedAt,
    List<SessionVerseEvaluationDto> VerseEvaluations
);

public record SessionResponse(
    Guid Id,
    Guid? GroupId,
    string GroupName,
    Guid TeacherId,
    string TeacherName,
    DateTime Date,
    string StartTime,
    string EndTime,
    SessionStatus Status,
    string? SessionObjective,
    Guid? SurahId,
    int? StartVerse,
    int? EndVerse,
    bool IsOnline,
    string? MeetingUrl,
    List<SessionAttendanceDto> Attendances,
    List<SessionRecitationResponse> Recitations
);

public record AnnotateSessionVerseRequest(
    Guid VerseId,
    SessionVerseEvaluationStatus Status,
    bool AssistanceGiven,
    string? Comment
);

public record AnnotateSessionWordRequest(
    Guid VerseEvaluationId,
    Guid WordId,
    SessionWordAnnotationType AnnotationType,
    string? Comment
);

public record SessionReportSummary(
    DateTime Date,
    int TotalStudents,
    int PresentCount,
    int AbsentCount,
    int TotalRecitations,
    int TotalBlocked,
    int TotalForgotten,
    int TotalTajwidErrors,
    string? PedagogicalSummary
);

public record SmartQueueStudentDto(
    Guid StudentId,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    double PriorityIndex,
    int DaysSinceLastRecitation,
    int RecentErrorsCount,
    string RecommendedAction,
    int? SuggestedSurahNumber,
    int? LastRecitedSurahNumber,
    string? SuggestedSurahName,
    int RecitationsInSessionCount
);

// Represents a surah within the group's level objective
public record LevelSurahDto(int Number, string NameEnglish, string NameArabic);

public record SessionCockpitResponse(
    Guid SessionId,
    Guid? GroupId,
    string GroupName,
    string? LevelName,
    int? LevelStartSurah,
    int? LevelEndSurah,
    SessionStatus Status,
    string? SessionObjective,
    List<SmartQueueStudentDto> SmartQueue,
    List<SessionAttendanceDto> Attendances,
    List<SessionRecitationResponse> RecentRecitations,
    List<LevelSurahDto> LevelSurahs,
    bool IsOnline = false,
    string? MeetingUrl = null
);

public record BatchSessionEvaluationRequest(
    Guid RecitationId,
    List<AnnotateSessionVerseRequest> VerseEvaluations
);
