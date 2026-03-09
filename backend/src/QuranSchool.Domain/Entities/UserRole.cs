using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class UserRole : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }

    // Navigation
    public User? User { get; set; }
    public Role? Role { get; set; }
}
