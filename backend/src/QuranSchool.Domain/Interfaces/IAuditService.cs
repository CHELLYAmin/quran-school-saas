namespace QuranSchool.Domain.Interfaces;

public interface IAuditService
{
    Task LogAsync(string module, string action, string details);
}
