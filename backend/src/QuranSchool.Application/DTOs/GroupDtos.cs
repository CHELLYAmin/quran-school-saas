namespace QuranSchool.Application.DTOs.Group;

public record CreateGroupRequest(
    string Name,
    Guid? LevelId,
    int MaxCapacity,
    string? Description,
    Guid? TeacherId
);

public record UpdateGroupRequest(
    string Name,
    Guid? LevelId,
    int MaxCapacity,
    string? Description,
    Guid? TeacherId,
    bool IsActive
);

public record GroupResponse(
    Guid Id,
    string Name,
    Guid? LevelId,
    string? LevelName,
    int MaxCapacity,
    string? Description,
    bool IsActive,
    Guid? TeacherId,
    string? TeacherName,
    int StudentCount,
    int? LevelStartSurah,
    int? LevelEndSurah,
    DateTime CreatedAt
);
