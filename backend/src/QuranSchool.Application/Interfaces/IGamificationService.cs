namespace QuranSchool.Application.Interfaces;

public interface IGamificationService
{
    Task AwardXPAsync(Guid studentId, int amount, string reason);
    Task UpdateStreakAsync(Guid studentId);
}
