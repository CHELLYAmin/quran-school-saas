using QuranSchool.Application.DTOs.Session;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Domain.Enums;

using QuranSchool.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace QuranSchool.Infrastructure.Services;

public class SmartQueueService : ISmartQueueService
{
    private readonly AppDbContext _context;

    public SmartQueueService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SmartQueueStudentDto>> GenerateQueueForGroupAsync(Guid groupId, Guid? sessionId = null)
    {
        var group = await _context.Groups
            .Include(g => g.Students)
            .Include(g => g.Level)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null) return new List<SmartQueueStudentDto>();

        int? levelStartSurah = group.Level?.StartSurah;
        int? levelEndSurah = group.Level?.EndSurah;

        var queue = new List<SmartQueueStudentDto>();
        foreach (var student in group.Students)
        {
            queue.Add(await GetStudentPriorityAsync(student.Id, sessionId, levelStartSurah, levelEndSurah));
        }

        return queue.OrderByDescending(q => q.PriorityIndex).ToList();
    }

    public async Task<SmartQueueStudentDto> GetStudentPriorityAsync(Guid studentId, Guid? sessionId = null, int? levelStartSurah = null, int? levelEndSurah = null)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null) throw new Exception("Student not found");

        int recitationsInSessionCount = 0;
        if (sessionId.HasValue)
        {
            recitationsInSessionCount = await _context.SessionRecitations
                .CountAsync(r => r.StudentId == studentId && r.SessionId == sessionId.Value);
        }

        // Get recent recitations including surah info
        var recentRecitations = await _context.SessionRecitations
            .Include(r => r.VerseEvaluations)
            .Include(r => r.Surah)
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .ToListAsync();

        int daysSinceLastRecitation = 30; // default penalty if never recited
        int recentErrorsCount = 0;
        int? lastRecitedSurahNumber = null;
        string? lastRecitedSurahName = null;
        int? suggestedSurahNumber = null;
        string? suggestedSurahName = null;

        if (recentRecitations.Any())
        {
            var lastRecitation = recentRecitations.First();
            daysSinceLastRecitation = (DateTime.UtcNow - lastRecitation.CreatedAt).Days;
            lastRecitedSurahNumber = lastRecitation.Surah?.Number;
            lastRecitedSurahName = lastRecitation.Surah?.NameEnglish;

            foreach (var rec in recentRecitations)
            {
                recentErrorsCount += rec.VerseEvaluations.Count(e => e.Status != SessionVerseEvaluationStatus.Correct);
            }
        }

        // === Surah Suggestion Logic ===
        // Strategy: 
        //   - If errors or long gap → suggest SAME surah (revision/catchup)
        //   - If progressing well → suggest NEXT surah in level range
        //   - If no history → suggest first surah of the level
        if (levelStartSurah.HasValue && levelEndSurah.HasValue)
        {
            int minSurah = Math.Min(levelStartSurah.Value, levelEndSurah.Value);
            int maxSurah = Math.Max(levelStartSurah.Value, levelEndSurah.Value);

            if (lastRecitedSurahNumber.HasValue && lastRecitedSurahNumber >= minSurah && lastRecitedSurahNumber <= maxSurah)
            {
                if (recentErrorsCount > 5 || daysSinceLastRecitation > 7)
                {
                    // Revision or catchup: same surah
                    suggestedSurahNumber = lastRecitedSurahNumber;
                    suggestedSurahName = lastRecitedSurahName;
                }
                else
                {
                    // Progression: next surah in the level, or stay at last if at end
                    int nextSurah = lastRecitedSurahNumber.Value + 1;
                    suggestedSurahNumber = nextSurah <= maxSurah ? nextSurah : lastRecitedSurahNumber;
                    if (suggestedSurahNumber != lastRecitedSurahNumber)
                    {
                        // Fetch the name of the next surah
                        var nextSurahEntity = await _context.Surahs.FirstOrDefaultAsync(s => s.Number == suggestedSurahNumber);
                        suggestedSurahName = nextSurahEntity?.NameEnglish;
                    }
                    else
                    {
                        suggestedSurahName = lastRecitedSurahName;
                    }
                }
            }
            else
            {
                // Student has no history in this level range → suggest first surah of level
                suggestedSurahNumber = minSurah;
                var firstSurahEntity = await _context.Surahs.FirstOrDefaultAsync(s => s.Number == minSurah);
                suggestedSurahName = firstSurahEntity?.NameEnglish;
            }
        }
        else if (lastRecitedSurahNumber.HasValue)
        {
            // No level defined → suggest same surah as last time
            suggestedSurahNumber = lastRecitedSurahNumber;
            suggestedSurahName = lastRecitedSurahName;
        }
        else
        {
            // Absolute fallback: No history AND no level boundaries
            suggestedSurahNumber = 1;
            suggestedSurahName = "Al-Fatihah";
        }

        // The core API-Q algorithm:
        double priorityIndex = (daysSinceLastRecitation * 1.5) + (recentErrorsCount * 2);

        string recommendation = "Prêt à avancer";
        if (daysSinceLastRecitation > 14) recommendation = "Doit rattraper le retard";
        else if (recentErrorsCount > 10) recommendation = "Révision intensive requise";
        else if (recentErrorsCount > 5) recommendation = "Consolider la dernière leçon";

        return new SmartQueueStudentDto(
            studentId,
            student.FirstName,
            student.LastName,
            null, // Could be student.AvatarUrl if exists
            priorityIndex,
            daysSinceLastRecitation,
            recentErrorsCount,
            recommendation,
            suggestedSurahNumber,
            lastRecitedSurahNumber,
            suggestedSurahName,
            recitationsInSessionCount
        );
    }
}
