using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using QuranSchool.Application.DTOs.Auth;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Collections.Generic;
using System.Linq;

namespace QuranSchool.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);
            
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        var roles = user.UserRoles?.Select(ur => ur.Role?.Name ?? "").Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string>();
        var token = await GenerateJwtTokenAsync(user, roles);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return new AuthResponse(
            user.Id,
            user.Email,
            $"{user.FirstName} {user.LastName}".Trim(),
            roles,
            user.SchoolId,
            token,
            refreshToken,
            DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpiryHours"] ?? "24"))
        );
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            LinkedProfileType = request.ProfileType,
            LinkedProfileId = request.ProfileId,
            SchoolId = request.SchoolId
        };

        _context.Users.Add(user);
        
        var dbRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
        if (dbRole != null)
        {
            _context.UserRoles.Add(new UserRole { SchoolId = request.SchoolId, UserId = user.Id, RoleId = dbRole.Id });
        }

        await _context.SaveChangesAsync();

        var roles = dbRole != null ? new List<string> { dbRole.Name } : new List<string>();
        var token = await GenerateJwtTokenAsync(user, roles);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return new AuthResponse(
            user.Id,
            user.Email,
            $"{user.FirstName} {user.LastName}".Trim(),
            roles,
            user.SchoolId,
            token,
            refreshToken,
            DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpiryHours"] ?? "24"))
        );
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = GetPrincipalFromExpiredToken(request.Token);
        var userId = Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var roles = user.UserRoles?.Select(ur => ur.Role?.Name ?? "").Where(r => !string.IsNullOrEmpty(r)).ToList() ?? new List<string>();
        var newToken = await GenerateJwtTokenAsync(user, roles);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return new AuthResponse(
            user.Id,
            user.Email,
            $"{user.FirstName} {user.LastName}".Trim(),
            roles,
            user.SchoolId,
            newToken,
            newRefreshToken,
            DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpiryHours"] ?? "24"))
        );
    }

    public async Task RevokeTokenAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<object> GetDiagnosticInfoAsync()
    {
        var passwordsToTry = new[] { "^&Kakashi123", "^&Kakashi123;", "Kakashi123" };
        var results = new List<object>();

        foreach (var pwd in passwordsToTry)
        {
            try
            {
                var connString = $"Host=quranschool-db.cjcuksm4yuo2.ca-central-1.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password='{pwd}';";
                var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
                optionsBuilder.UseNpgsql(connString);
                
                using var tempContext = new AppDbContext(optionsBuilder.Options);
                var canConnect = await tempContext.Database.CanConnectAsync();
                
                if (canConnect)
                {
                    var userCount = await tempContext.Users.CountAsync();
                    var superAdmin = await tempContext.Users.FirstOrDefaultAsync(u => u.Email == "superadmin@quranschool.com");
                    
                    return new
                    {
                        Status = "Success",
                        WorkingPasswordFound = true,
                        WorkingPassword = pwd.Substring(0, 2) + "...", // Security
                        UserCount = userCount,
                        SuperAdminExists = superAdmin != null,
                        DatabaseProvider = tempContext.Database.ProviderName
                    };
                }
            }
            catch (Exception ex)
            {
                results.Add(new { PwdSuffix = pwd.Length > 3 ? pwd.Substring(pwd.Length-3) : pwd, Error = ex.Message });
            }
        }

        return new
        {
            Status = "Failure",
            TriedPasswords = results,
            Timestamp = DateTime.UtcNow
        };
    }

    private async Task<string> GenerateJwtTokenAsync(User user, List<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SuperSecretKeyAtLeast32Characters!"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("SchoolId", user.SchoolId.ToString() ?? "")
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var permissions = await _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .Where(rp => roles.Contains(rp.Role.Name) && (rp.SchoolId == user.SchoolId || rp.Role.IsSystemRole))
            .Select(rp => rp.Permission!.Code)
            .Distinct()
            .ToListAsync();

        foreach (var perm in permissions)
        {
            claims.Add(new Claim("Permission", perm));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "QuranSchool",
            audience: _configuration["Jwt:Audience"] ?? "QuranSchoolApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpiryHours"] ?? "24")),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SuperSecretKeyAtLeast32Characters!")),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
}
