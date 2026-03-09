using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuranSchool.Application.DTOs;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class SmartRevisionService : ISmartRevisionService
{
    private readonly AppDbContext _context;
    private readonly ILogger<SmartRevisionService> _logger;

    public SmartRevisionService(AppDbContext context, ILogger<SmartRevisionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<StudentMissionDto?> GenerateSmartRevisionAsync(Guid studentId, CancellationToken cancellationToken = default)
    {
        // 1. Fetch student to ensure they exist
        var student = await _context.Students.FindAsync(new object[] { studentId }, cancellationToken);
        if (student == null)
        {
            _logger.LogWarning("GenerateSmartRevisionAsync: Student {StudentId} not found.", studentId);
            return null;
        }

        // 2. Fetch recitation history for the last 60 days
        var cutoffDate = DateTime.UtcNow.AddDays(-60);
        var snapshots = await _context.StudentProgressSnapshots
            .Where(s => s.StudentId == studentId && s.Date >= cutoffDate)
            .ToListAsync(cancellationToken);

        if (!snapshots.Any())
        {
            _logger.LogInformation("No recent recitation history found for student {StudentId}. Cannot generate smart revision.", studentId);
            return null;
        }

        // 3. Group by Surah and calculate Needs Review Score
        var surahScores = snapshots
            .GroupBy(s => s.SurahId)
            .Select(g =>
            {
                var latestRecitation = g.OrderByDescending(s => s.Date).First();
                var daysSinceLastReview = (DateTime.UtcNow - latestRecitation.Date).TotalDays;
                
                // Aggregate errors from all recitations of this surah in the time period
                var totalBlocked = g.Sum(s => s.BlockedCount);
                var totalForgotten = g.Sum(s => s.ForgottenCount);
                var totalTajwid = g.Sum(s => s.TajwidErrorsCount);
                var avgScore = g.Average(s => s.PerformanceScore);

                // Score Calculation Algorithm
                double score = (daysSinceLastReview * 0.5) 
                             + ((totalBlocked + totalForgotten) * 2.0)
                             + (totalTajwid * 1.5);
                
                if (avgScore < 70) score += 10;

                return new
                {
                    SurahId = g.Key,
                    Score = score,
                    LatestRecitationDate = latestRecitation.Date
                };
            })
            .OrderByDescending(x => x.Score)
            .ToList();

        var topPriority = surahScores.FirstOrDefault();

        // 4. Threshold Check (e.g., if Score < 5, maybe they don't *need* a high priority review right now, but we'll assign one anyway if they asked for it)
        if (topPriority == null) return null;

        var targetSurah = await _context.Surahs.FindAsync(new object[] { topPriority.SurahId }, cancellationToken);
        if (targetSurah == null) return null;

        // 5. Create Mission
        var mission = new StudentMission
        {
            StudentId = studentId,
            Type = MissionType.SmartRevision,
            TargetType = MissionTargetType.Surah,
            TargetId = targetSurah.Number,
            CustomDescription = $"Révision intelligente générée par API-Q. Basée sur vos récitations précédentes.",
            DueDate = DateTime.UtcNow.AddDays(3), // Due in 3 days
            Status = MissionStatus.Pending
        };

        _context.StudentMissions.Add(mission);

        // Add Notification
        var notification = new Notification
        {
            UserId = mission.StudentId,
            Title = "Révision Intelligente",
            Body = $"API-Q vous a programmé une révision intelligente sur la sourate {targetSurah.NameArabic}.",
            Type = "Mission",
            IsRead = false
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Generated smart revision mission {MissionId} for student {StudentId} on Surah {SurahId} (Score: {Score})", 
            mission.Id, studentId, topPriority.SurahId, topPriority.Score);

        // 6. Return DTO
        return new StudentMissionDto
        {
            Id = mission.Id,
            StudentId = mission.StudentId,
            StudentName = $"{student.FirstName} {student.LastName}",
            Type = mission.Type,
            TargetType = mission.TargetType,
            TargetId = mission.TargetId,
            CustomDescription = mission.CustomDescription,
            DueDate = mission.DueDate,
            Status = mission.Status,
            CreatedAt = mission.CreatedAt
        };
    }

    public async Task<int> GenerateBatchRevisionsAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        var studentIds = await _context.Students
            .Where(s => s.GroupId == groupId && !s.IsDeleted)
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        int generatedCount = 0;
        foreach (var studentId in studentIds)
        {
            var mission = await GenerateSmartRevisionAsync(studentId, cancellationToken);
            if (mission != null)
            {
                generatedCount++;
            }
        }

        return generatedCount;
    }
}
