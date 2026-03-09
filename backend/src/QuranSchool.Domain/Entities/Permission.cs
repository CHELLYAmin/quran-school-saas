using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty; // e.g., STUDENT_VIEW
    public string Module { get; set; } = string.Empty; // e.g., Student
    public string ActionType { get; set; } = string.Empty; // e.g., View, Create, Edit, Delete
    public string? Description { get; set; }

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
