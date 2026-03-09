using QuranSchool.Domain.Enums;
namespace QuranSchool.Application.DTOs.User;

public record UserResponse(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? FullName,
    IEnumerable<string> Roles,
    ProfileType LinkedProfileType,
    Guid LinkedProfileId,
    bool IsActive = true,
    string PreferredLanguage = "fr",
    DateTime CreatedAt = default
);

public record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    IEnumerable<string> Roles,
    ProfileType LinkedProfileType,
    Guid LinkedProfileId,
    string PreferredLanguage = "fr",
    bool IsActive = true
);

public record UpdateUserRequest(
    string Email,
    string FirstName,
    string LastName,
    IEnumerable<string> Roles,
    string PreferredLanguage = "fr",
    bool IsActive = true
);
