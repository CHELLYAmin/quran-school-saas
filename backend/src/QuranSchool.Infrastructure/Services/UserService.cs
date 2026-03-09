using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.User;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UserResponse>> GetUsersByRolesAsync(Guid schoolId, params string[] roles)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.SchoolId == schoolId && u.IsActive);
        
        if (roles != null && roles.Length > 0)
        {
            var roleList = roles.ToList();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role != null && roleList.Contains(ur.Role.Name)));
        }

        var users = await query.OrderBy(u => u.Email).ToListAsync();
        return users.Select(MapUser).ToList();
    }

    public async Task<UserResponse> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");
        return MapUser(user);
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllUsersAsync(Guid schoolId)
    {
        return await GetUsersByRolesAsync(schoolId);
    }

    public async Task<UserResponse> CreateUserAsync(Guid schoolId, CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            SchoolId = schoolId,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            LinkedProfileType = request.LinkedProfileType,
            LinkedProfileId = request.LinkedProfileId,
            PreferredLanguage = request.PreferredLanguage,
            IsActive = request.IsActive
        };

        _context.Users.Add(user);

        if (request.Roles != null)
        {
            var dbRoles = await _context.Roles.Where(r => request.Roles.Contains(r.Name)).ToListAsync();
            foreach (var r in dbRoles)
            {
                _context.UserRoles.Add(new UserRole { SchoolId = schoolId, UserId = user.Id, RoleId = r.Id });
            }
            user.UserRoles = dbRoles.Select(r => new UserRole { Role = r, RoleId = r.Id, UserId = user.Id }).ToList();
        }

        await _context.SaveChangesAsync();

        return MapUser(user);
    }

    public async Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

        if (user.Email != request.Email && await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email already registered by another user.");

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PreferredLanguage = request.PreferredLanguage;
        user.IsActive = request.IsActive;

        if (request.Roles != null)
        {
            _context.UserRoles.RemoveRange(user.UserRoles);
            var dbRoles = await _context.Roles.Where(r => request.Roles.Contains(r.Name)).ToListAsync();
            foreach (var r in dbRoles)
            {
                _context.UserRoles.Add(new UserRole { SchoolId = user.SchoolId, UserId = user.Id, RoleId = r.Id });
            }
        }

        await _context.SaveChangesAsync();
        return MapUser(user);
    }

    public async Task<UserResponse> UpdateUserRolesAsync(Guid id, IEnumerable<string> newRoles)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

        _context.UserRoles.RemoveRange(user.UserRoles);
        var dbRoles = await _context.Roles.Where(r => newRoles.Contains(r.Name)).ToListAsync();
        foreach (var r in dbRoles)
        {
            _context.UserRoles.Add(new UserRole { SchoolId = user.SchoolId, UserId = user.Id, RoleId = r.Id });
        }

        await _context.SaveChangesAsync();
        return MapUser(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) throw new KeyNotFoundException($"User with ID {id} not found.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    private static UserResponse MapUser(User u) => new(
        u.Id,
        u.Email,
        u.FirstName,
        u.LastName,
        $"{u.FirstName} {u.LastName}".Trim(),
        u.UserRoles?.Select(ur => ur.Role?.Name ?? "").Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string>(),
        u.LinkedProfileType,
        u.LinkedProfileId,
        u.IsActive,
        u.PreferredLanguage,
        u.CreatedAt
    );
}
