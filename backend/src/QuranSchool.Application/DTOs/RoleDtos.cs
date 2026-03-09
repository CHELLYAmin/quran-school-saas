namespace QuranSchool.Application.DTOs.Role;

public record RoleResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    DateTime CreatedAt
);

public record CreateRoleRequest(
    string Name,
    string? Description,
    IEnumerable<string> Permissions
);

public record UpdateRoleRequest(
    string Name,
    string? Description,
    IEnumerable<string> Permissions
);

public record PermissionResponse(
    Guid Id,
    string Code,
    string Module,
    string ActionType,
    string Description
);
