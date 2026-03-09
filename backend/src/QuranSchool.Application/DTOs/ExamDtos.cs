using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Exam;

public record StartExamRequest(
    Guid StudentId,
    Guid ExaminerId,
    Guid? SurahId,
    string? ExamLevel,
    int? StartVerse,
    int? EndVerse,
    string Title,
    bool IsLevelProgressionExam = false,
    string? TargetLevel = null
);

public record AnnotateVerseRequest(
    Guid VerseId,
    VerseEvaluationStatus Status,
    bool AssistanceGiven,
    string? Comment
);

public record AnnotateWordRequest(
    Guid VerseEvaluationId,
    Guid WordId,
    WordAnnotationType AnnotationType,
    string? Comment
);

public record ExamResponse(
    Guid Id,
    string Title,
    ExamType Type,
    DateTime ExamDate,
    Guid StudentId,
    string StudentName,
    Guid ExaminerId,
    string ExaminerName,
    Guid? SurahId,
    string? SurahName,
    string? ExamLevel,
    int? StartVerse,
    int? EndVerse,
    ExamStatus FinalStatus,
    decimal FinalScore,
    bool IsLevelProgressionExam,
    string? TargetLevel,
    DateTime CreatedAt
);

public record ExamReportResponse(
    Guid ExamId,
    string StudentName,
    string SurahName,
    int? StartVerse,
    int? EndVerse,
    int TotalVersesEvaluated,
    int BlockedCount,
    int ForgottenCount,
    int TajwidErrorCount,
    decimal FinalScore,
    string? GlobalComment,
    List<VerseEvaluationDetail> VerseDetails
);

public record VerseEvaluationDetail(
    int VerseNumber,
    string TextArabic,
    VerseEvaluationStatus Status,
    bool AssistanceGiven,
    string? Comment,
    List<WordAnnotationDetail> WordAnnotations
);

public record WordAnnotationDetail(
    int WordIndex,
    string WordText,
    WordAnnotationType Type,
    string? Comment
);
