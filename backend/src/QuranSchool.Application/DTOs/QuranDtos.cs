using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Quran;

public record SurahResponse(
    Guid Id,
    int Number,
    string NameArabic,
    string NameEnglish,
    string RevelationType,
    int VerseCount
);

public record VerseResponse(
    Guid Id,
    Guid SurahId,
    int VerseNumber,
    string TextArabic,
    int WordsCount,
    List<WordResponse> Words
);

public record WordResponse(
    Guid Id,
    Guid VerseId,
    int WordIndex,
    string WordText,
    string NormalizedText
);
