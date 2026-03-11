using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AuditService(AppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task LogAsync(string module, string action, string details)
    {
        var schoolId = _currentUserService.SchoolId;
        var userId = _currentUserService.UserId;

        if (schoolId == null) return;

        var log = new UserActionLog
        {
            SchoolId = (Guid)schoolId,
            UserId = userId ?? Guid.Empty,
            Module = module,
            Action = action,
            Details = details,
            Timestamp = DateTime.UtcNow,
            IpAddress = "Internal" // Could be enhanced by passing HttpContext
        };

        _context.UserActionLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
