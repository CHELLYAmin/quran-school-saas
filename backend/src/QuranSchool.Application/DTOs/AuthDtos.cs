using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Role, // Main role to assign at registration
    ProfileType ProfileType,
    Guid ProfileId,
    Guid SchoolId
);

public record AuthResponse(
    Guid UserId,
    string Email,
    string? FullName,
    IEnumerable<string> Roles,
    Guid SchoolId,
    string Token,
    string RefreshToken,
    DateTime TokenExpiry
);

public record RefreshTokenRequest(string Token, string RefreshToken);
