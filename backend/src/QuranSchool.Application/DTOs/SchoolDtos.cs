namespace QuranSchool.Application.DTOs.School;

public record CreateSchoolRequest(
    string Name,
    string? Address,
    string? Phone,
    string? Email,
    string? Description
);

public record UpdateSchoolRequest(
    string Name,
    string? Address,
    string? Phone,
    string? Email,
    string? Description,
    string? LogoUrl
);

public record SchoolResponse(
    Guid Id,
    string Name,
    string? Address,
    string? Phone,
    string? Email,
    string? LogoUrl,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);
