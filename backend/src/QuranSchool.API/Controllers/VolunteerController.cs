using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VolunteerController : ControllerBase
{
    private readonly AppDbContext _context;

    public VolunteerController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("missions")]
    [AllowAnonymous]
    public async Task<ActionResult<List<VolunteerMissionDto>>> GetMissions([FromQuery] bool? published)
    {
        var query = _context.VolunteerMissions.AsQueryable();

        if (published.HasValue)
            query = query.Where(m => m.IsPublished == published.Value);

        var missions = await query.OrderByDescending(m => m.Date).ToListAsync();

        return Ok(missions.Select(m => new VolunteerMissionDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            Date = m.Date,
            Location = m.Location,
            RequiredVolunteers = m.RequiredVolunteers,
            CurrentVolunteers = m.CurrentVolunteers,
            IsPublished = m.IsPublished,
            SkillsRequired = m.SkillsRequired,
            CreatedAt = m.CreatedAt
        }).ToList());
    }

    [HttpPost("missions")]
    public async Task<ActionResult<VolunteerMissionDto>> CreateMission([FromBody] CreateVolunteerMissionDto dto)
    {
        var mission = new VolunteerMission
        {
            Title = dto.Title,
            Description = dto.Description,
            Date = dto.Date,
            Location = dto.Location,
            RequiredVolunteers = dto.RequiredVolunteers,
            IsPublished = dto.IsPublished,
            SkillsRequired = dto.SkillsRequired
        };

        _context.VolunteerMissions.Add(mission);
        await _context.SaveChangesAsync();

        return Ok(new VolunteerMissionDto { Id = mission.Id, Title = mission.Title });
    }

    [HttpGet("signups")]
    public async Task<ActionResult<List<VolunteerSignupDto>>> GetSignups()
    {
        var signups = await _context.VolunteerSignups
            .Include(s => s.Mission)
            .Include(s => s.User)
            .OrderByDescending(s => s.SignupDate)
            .ToListAsync();

        return Ok(signups.Select(s => new VolunteerSignupDto
        {
            Id = s.Id,
            MissionId = s.MissionId,
            MissionTitle = s.Mission.Title,
            UserId = s.UserId,
            UserFullName = $"{s.User.FirstName} {s.User.LastName}",
            Status = s.Status.ToString(),
            Notes = s.Notes,
            SignupDate = s.SignupDate
        }).ToList());
    }

    [HttpPost("signups")]
    public async Task<ActionResult<VolunteerSignupDto>> Signup([FromBody] CreateVolunteerSignupDto dto)
    {
        // Assuming current user ID from token, but for now taking from some context or mock
        // Guid currentUserId = GetCurrentUserId(); 
        
        // Mocking user for now if context not available
        var user = await _context.Users.FirstOrDefaultAsync();
        if (user == null) return BadRequest("No user found");

        var mission = await _context.VolunteerMissions.FindAsync(dto.MissionId);
        if (mission == null) return NotFound("Mission not found");

        var signup = new VolunteerSignup
        {
            MissionId = dto.MissionId,
            UserId = user.Id,
            Notes = dto.Notes,
            Status = VolunteerSignupStatus.Pending
        };

        _context.VolunteerSignups.Add(signup);
        mission.CurrentVolunteers++;
        
        await _context.SaveChangesAsync();

        return Ok(new VolunteerSignupDto { Id = signup.Id, MissionTitle = mission.Title });
    }
}
