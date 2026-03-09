using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class User : BaseEntity
{
    // Auth
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public string PreferredLanguage { get; set; } = "fr";

    // Polymorphic Link
    public ProfileType LinkedProfileType { get; set; }
    public Guid LinkedProfileId { get; set; }

    // Navigation
    public School? School { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
