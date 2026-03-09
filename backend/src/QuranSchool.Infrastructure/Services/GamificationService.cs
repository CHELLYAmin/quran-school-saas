using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.Interfaces;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly AppDbContext _context;

    public GamificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AwardXPAsync(Guid studentId, int amount, string reason)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null) return;

        student.TotalXP += amount;
        
        // Log XP Gain (Optional: Add an XPHistory table if needed later)
        // For now, we just update the student profile directly
        
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStreakAsync(Guid studentId)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null) return;

        var today = DateTime.UtcNow.Date;
        
        // Check if student already had activity today to avoid double-counting
        // We look at SessionRecitations CreatedAt for simplicity
        var hasActivityToday = await _context.SessionRecitations
            .AnyAsync(r => r.StudentId == studentId && r.CreatedAt.Date == today);
            
        // Or Mission submissions
        if (!hasActivityToday)
        {
            hasActivityToday = await _context.StudentMissions
                .AnyAsync(m => m.StudentId == studentId && m.CompletedAt.HasValue && m.CompletedAt.Value.Date == today);
        }

        if (hasActivityToday) return; // Already updated today

        // Check if activity was yesterday for streak continuation
        var yesterday = today.AddDays(-1);
        var hadActivityYesterday = await _context.SessionRecitations
            .AnyAsync(r => r.StudentId == studentId && r.CreatedAt.Date == yesterday) ||
            await _context.StudentMissions
            .AnyAsync(m => m.StudentId == studentId && m.CompletedAt.HasValue && m.CompletedAt.Value.Date == yesterday);

        if (hadActivityYesterday)
        {
            student.CurrentStreak += 1;
            if (student.CurrentStreak > student.LongestStreak)
            {
                student.LongestStreak = student.CurrentStreak;
            }
        }
        else
        {
            student.CurrentStreak = 1;
        }

        await _context.SaveChangesAsync();
    }
}
