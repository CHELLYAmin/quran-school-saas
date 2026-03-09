namespace QuranSchool.Application.DTOs.Level;

public record LevelResponse(
    Guid Id,
    string Name,
    string? Description,
    int Order,
    bool IsActive,
    int? StartSurah,
    int? EndSurah,
    int GroupsCount,
    DateTime CreatedAt
);

public record CreateLevelRequest(
    string Name,
    string? Description,
    int? StartSurah,
    int? EndSurah,
    int Order
);

public record UpdateLevelRequest(
    string Name,
    string? Description,
    int Order,
    int? StartSurah,
    int? EndSurah,
    bool IsActive
);
