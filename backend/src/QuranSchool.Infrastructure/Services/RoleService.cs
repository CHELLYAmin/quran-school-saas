using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Role;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RoleResponse>> GetAllRolesAsync(Guid schoolId)
    {
        return await _context.Roles
            .Where(r => r.SchoolId == schoolId || r.IsSystemRole)
            .OrderBy(r => r.Name)
            .Select(r => new RoleResponse(r.Id, r.Name, r.Description, r.IsSystemRole, r.CreatedAt))
            .ToListAsync();
    }

    public async Task<RoleResponse> GetRoleByIdAsync(Guid id)
    {
        var role = await _context.Roles.FindAsync(id) ?? throw new KeyNotFoundException("Role not found");
        return new RoleResponse(role.Id, role.Name, role.Description, role.IsSystemRole, role.CreatedAt);
    }

    public async Task<RoleResponse> CreateRoleAsync(Guid schoolId, CreateRoleRequest request)
    {
        var role = new Role
        {
            SchoolId = schoolId,
            Name = request.Name,
            Description = request.Description,
            IsSystemRole = false
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        if (request.Permissions != null && request.Permissions.Any())
        {
            var permissions = await _context.Permissions
                .Where(p => p.SchoolId == schoolId && request.Permissions.Contains(p.Code))
                .ToListAsync();

            foreach (var p in permissions)
            {
                _context.RolePermissions.Add(new RolePermission { SchoolId = schoolId, RoleId = role.Id, PermissionId = p.Id });
            }
            await _context.SaveChangesAsync();
        }

        return await GetRoleByIdAsync(role.Id);
    }

    public async Task<RoleResponse> UpdateRoleAsync(Guid id, UpdateRoleRequest request)
    {
        var role = await _context.Roles.FindAsync(id) ?? throw new KeyNotFoundException("Role not found");
        
        if (role.IsSystemRole)
            throw new InvalidOperationException("System roles cannot be modified.");

        role.Name = request.Name;
        role.Description = request.Description;

        // Update permissions
        var currentRolePermissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == id)
            .ToListAsync();

        _context.RolePermissions.RemoveRange(currentRolePermissions);

        if (request.Permissions != null && request.Permissions.Any())
        {
            var permissions = await _context.Permissions
                .Where(p => p.SchoolId == role.SchoolId && request.Permissions.Contains(p.Code))
                .ToListAsync();

            foreach (var p in permissions)
            {
                _context.RolePermissions.Add(new RolePermission { SchoolId = role.SchoolId, RoleId = role.Id, PermissionId = p.Id });
            }
        }

        await _context.SaveChangesAsync();
        return await GetRoleByIdAsync(role.Id);
    }

    public async Task DeleteRoleAsync(Guid id)
    {
        var role = await _context.Roles.FindAsync(id) ?? throw new KeyNotFoundException("Role not found");
        
        if (role.IsSystemRole)
            throw new InvalidOperationException("System roles cannot be deleted.");

        var rolePermissions = await _context.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync();
        _context.RolePermissions.RemoveRange(rolePermissions);

        var userRoles = await _context.UserRoles.Where(ur => ur.RoleId == id).ToListAsync();
        _context.UserRoles.RemoveRange(userRoles);

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<PermissionResponse>> GetAllPermissionsAsync(Guid schoolId)
    {
        return await _context.Permissions
            .Where(p => p.SchoolId == schoolId)
            .OrderBy(p => p.Module).ThenBy(p => p.Code)
            .Select(p => new PermissionResponse(p.Id, p.Code, p.Module, p.ActionType, p.Description))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetRolePermissionsAsync(Guid roleId)
    {
        return await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Include(rp => rp.Permission)
            .Select(rp => rp.Permission!.Code)
            .ToListAsync();
    }
}
