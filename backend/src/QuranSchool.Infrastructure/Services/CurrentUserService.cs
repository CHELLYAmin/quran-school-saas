using System.Security.Claims;
using QuranSchool.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace QuranSchool.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id != null && Guid.TryParse(id, out var guid)) return guid;
            return null;
        }
    }

    public Guid? SchoolId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirst("SchoolId")?.Value;
            if (id != null && Guid.TryParse(id, out var guid)) return guid;
            return null;
        }
    }

    public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
}
