using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Application.DTOs.Student;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/gamification")]
public class GamificationController : ControllerBase
{
    private readonly AppDbContext _context;

    public GamificationController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets the top students by total XP (Leaderboard) within a school.
    /// </summary>
    [HttpGet("leaderboard")]
    public async Task<ActionResult<List<StudentListResponse>>> GetLeaderboard([FromQuery] Guid schoolId, [FromQuery] int take = 10)
    {
        var topStudents = await _context.Students
            .Where(s => s.SchoolId == schoolId && s.IsActive && !s.IsDeleted)
            .OrderByDescending(s => s.TotalXP)
            .Take(take)
            .Select(s => new StudentListResponse(
                s.Id, 
                $"{s.FirstName} {s.LastName}".Trim(), 
                s.GroupId, 
                s.Group != null ? s.Group.Name : null, 
                s.IsActive, 
                s.EnrollmentDate, 
                s.CurrentLevel, 
                s.TotalXP, 
                s.CurrentStreak, 
                s.Badges))
            .ToListAsync();

        return Ok(topStudents);
    }
}
