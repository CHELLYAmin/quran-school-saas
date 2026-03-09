using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Progress;

public record CreateProgressRequest(
    Guid StudentId,
    string? SurahName,
    int? SurahNumber,
    int? JuzNumber,
    int? HizbNumber,
    int? StartVerse,
    int? EndVerse,
    ProgressStatus Status,
    string? TeacherNotes,
    int? QualityScore
);

public record UpdateProgressRequest(
    ProgressStatus Status,
    string? TeacherNotes,
    int? QualityScore
);

public record ProgressResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    string? SurahName,
    int? SurahNumber,
    int? JuzNumber,
    int? HizbNumber,
    int? StartVerse,
    int? EndVerse,
    ProgressStatus Status,
    string? TeacherNotes,
    DateTime RecordDate,
    int? QualityScore,
    DateTime CreatedAt
);

public record StudentProgressSummary(
    Guid StudentId,
    string StudentName,
    int TotalJuz,
    int MemorizedJuz,
    int InProgressJuz,
    int TotalSurah,
    int MemorizedSurah,
    double AverageQuality,
    DateTime? LastProgressDate
);
