using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets the analytics overview for the specified school
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<AnalyticsOverviewResponse>> GetOverview([FromQuery] Guid schoolId)
    {
        var activeStudentsCount = await _context.Students
            .CountAsync(s => s.SchoolId == schoolId && s.IsActive && !s.IsDeleted);
            
        var activeTeachersCount = await _context.Teachers
            .CountAsync(t => t.SchoolId == schoolId && !t.IsDeleted);
            
        var totalGroupsCount = await _context.Groups
            .CountAsync(g => g.SchoolId == schoolId && !g.IsDeleted);
            
        var activeMissions = await _context.StudentMissions
            .CountAsync(m => m.Status != MissionStatus.Completed);
            
        // Assuming missions completed this week
        var weekStart = DateTime.UtcNow.AddDays(-7);
        var completedMissionsThisWeek = await _context.StudentMissions
            .CountAsync(m => m.Status == MissionStatus.Completed && m.CompletedAt >= weekStart);

        return Ok(new AnalyticsOverviewResponse(
            activeStudentsCount,
            activeTeachersCount,
            totalGroupsCount,
            activeMissions,
            completedMissionsThisWeek
        ));
    }

    /// <summary>
    /// Gets analytics for a specific parent (all their children)
    /// </summary>
    [HttpGet("parent/{parentId}")]
    public async Task<ActionResult<ParentAnalyticsResponse>> GetParentAnalytics(Guid parentId)
    {
        var children = await _context.Students
            .Where(s => s.ParentId == parentId && !s.IsDeleted)
            .Select(s => new { s.Id, s.FirstName, s.LastName })
            .ToListAsync();

        if (!children.Any())
        {
            return Ok(new ParentAnalyticsResponse(new List<ChildAnalyticsStats>()));
        }

        var childIds = children.Select(c => c.Id).ToList();

        // 1. Fetch all Attendance stats in one query
        var attendanceStats = await _context.SessionAttendances
            .Where(a => childIds.Contains(a.StudentId))
            .GroupBy(a => a.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                Total = g.Count(),
                Present = g.Count(a => a.Status == SessionAttendanceStatus.Present || a.Status == SessionAttendanceStatus.Late)
            })
            .ToDictionaryAsync(x => x.StudentId);

        // 2. Fetch all Mission stats in one query
        var missionStats = await _context.StudentMissions
            .Where(m => childIds.Contains(m.StudentId))
            .GroupBy(m => m.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                Total = g.Count(),
                Completed = g.Count(m => m.Status == MissionStatus.Completed)
            })
            .ToDictionaryAsync(x => x.StudentId);

        // 3. Fetch Recent Quality Scores (Last 20 per student to filter down safely in memory)
        // Note: For large datasets, a more specialized query or raw SQL might be better, 
        // but for <100 students this is much faster than N separate queries.
        var allRecentScores = await _context.SessionRecitations
            .Where(r => childIds.Contains(r.StudentId))
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.StudentId, r.CreatedAt, Score = r.QualityScore ?? 0 })
            .ToListAsync();

        var childStats = new List<ChildAnalyticsStats>();

        foreach (var child in children)
        {
            // Attendance calculation
            int attendanceRate = 100;
            if (attendanceStats.TryGetValue(child.Id, out var att))
            {
                attendanceRate = att.Total > 0 ? (int)((double)att.Present / att.Total * 100) : 100;
            }

            // Mission calculation
            int missionsTotal = 0;
            int missionsCompleted = 0;
            if (missionStats.TryGetValue(child.Id, out var mis))
            {
                missionsTotal = mis.Total;
                missionsCompleted = mis.Completed;
            }

            // Quality Trend (Take 10 from pre-fetched scores for this student)
            var qualityTrend = allRecentScores
                .Where(s => s.StudentId == child.Id)
                .Take(10)
                .Select(s => new QualityPoint(s.CreatedAt, s.Score))
                .ToList();

            childStats.Add(new ChildAnalyticsStats(
                child.Id,
                $"{child.FirstName} {child.LastName}",
                attendanceRate,
                missionsTotal,
                missionsCompleted,
                qualityTrend
            ));
        }

        return Ok(new ParentAnalyticsResponse(childStats));
    }
}

public record AnalyticsOverviewResponse(
    int ActiveStudents,
    int ActiveTeachers,
    int TotalGroups,
    int ActiveMissions,
    int CompletedMissionsThisWeek
);

public record ParentAnalyticsResponse(List<ChildAnalyticsStats> Children);
public record ChildAnalyticsStats(
    Guid StudentId,
    string StudentName,
    int AttendanceRate,
    int TotalMissions,
    int CompletedMissions,
    List<QualityPoint> QualityTrend
);
public record QualityPoint(DateTime Date, int Score);
