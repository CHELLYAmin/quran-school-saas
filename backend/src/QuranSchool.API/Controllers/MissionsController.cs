using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;
using System.Security.Claims;

namespace QuranSchool.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MissionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISmartRevisionService _smartRevisionService;
    private readonly IGamificationService _gamificationService;

    public MissionsController(AppDbContext context, ISmartRevisionService smartRevisionService, IGamificationService gamificationService)
    {
        _context = context;
        _smartRevisionService = smartRevisionService;
        _gamificationService = gamificationService;
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<StudentMissionDto>>> GetStudentMissions(Guid studentId)
    {
        if (studentId == Guid.Empty) return Ok(new List<StudentMissionDto>());

        var missions = await _context.StudentMissions
            .Include(m => m.Student)
            .Include(m => m.Teacher)
            .Where(m => m.StudentId == studentId)
            .OrderBy(m => m.DueDate)
            .Select(m => new StudentMissionDto
            {
                Id = m.Id,
                StudentId = m.StudentId,
                TeacherId = m.TeacherId,
                StudentName = m.Student != null ? m.Student.FirstName + " " + m.Student.LastName : "Étudiant Inconnu",
                TeacherName = m.Teacher != null ? m.Teacher.FirstName + " " + m.Teacher.LastName : null,
                Type = m.Type,
                TargetType = m.TargetType,
                TargetId = m.TargetId,
                CustomDescription = m.CustomDescription,
                DueDate = m.DueDate,
                Status = m.Status,
                QualityScore = m.QualityScore,
                AudioUrl = m.AudioUrl,
                TeacherFeedback = m.TeacherFeedback,
                CreatedAt = m.CreatedAt,
                CompletedAt = m.CompletedAt
            })
            .ToListAsync();

        return Ok(missions);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher,SuperAdmin")]
    public async Task<ActionResult<StudentMissionDto>> CreateManualMission(CreateManualMissionDto dto)
    {
        // Extract Teacher ID from claims
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        // Ensure teacher exists
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == userId);
        
        var mission = new StudentMission
        {
            StudentId = dto.StudentId,
            TeacherId = teacher?.Id,
            Type = MissionType.ManualAssignment,
            TargetType = dto.TargetType,
            TargetId = dto.TargetId,
            CustomDescription = dto.CustomDescription,
            DueDate = dto.DueDate,
            Status = MissionStatus.Pending
        };

        _context.StudentMissions.Add(mission);

        // Add Notification
        var notification = new Notification
        {
            UserId = mission.StudentId, // This links to Student id assuming Student Id == User Id for students
            Title = "Nouvelle Mission",
            Body = $"Votre enseignant vous a assigné une nouvelle mission à terminer pour le {mission.DueDate:dd/MM/yyyy}.",
            Type = "Mission",
            IsRead = false
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudentMissions), new { studentId = mission.StudentId }, new { mission.Id });
    }

    [HttpPost("group/{groupId}")]
    [Authorize(Roles = "Admin,Teacher,SuperAdmin")]
    public async Task<ActionResult> CreateGroupMission(Guid groupId, CreateManualMissionDto dto)
    {
        // Extract Teacher ID from claims
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        // Ensure teacher exists
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == userId);

        // Get all active students in this group
        var studentIds = await _context.Students
            .Where(s => s.GroupId == groupId && !s.IsDeleted)
            .Select(s => s.Id)
            .ToListAsync();

        if (!studentIds.Any()) return BadRequest("Aucun étudiant trouvé dans ce groupe.");

        var missions = studentIds.Select(sid => new StudentMission
        {
            StudentId = sid,
            TeacherId = teacher?.Id,
            Type = MissionType.ManualAssignment,
            TargetType = dto.TargetType,
            TargetId = dto.TargetId,
            CustomDescription = dto.CustomDescription,
            DueDate = dto.DueDate,
            Status = MissionStatus.Pending
        }).ToList();

        var notifications = studentIds.Select(sid => new Notification
        {
            UserId = sid,
            Title = "Nouvelle Mission de Groupe",
            Body = $"Votre enseignant a assigné une nouvelle mission à votre groupe, à terminer pour le {dto.DueDate:dd/MM/yyyy}.",
            Type = "Mission",
            IsRead = false
        }).ToList();

        _context.StudentMissions.AddRange(missions);
        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{missions.Count} missions ont été assignées avec succès." });
    }

    [HttpPost("student/{studentId}/generate-smart-revision")]
    [Authorize(Roles = "Admin,Teacher,SuperAdmin")]
    public async Task<ActionResult<StudentMissionDto>> TriggerSmartRevisionGeneration(Guid studentId)
    {
        var mission = await _smartRevisionService.GenerateSmartRevisionAsync(studentId);
        if (mission == null) return Ok(new { message = "Aucune révision requise pour le moment." });
        return Ok(mission);
    }

    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteMission(Guid id, CompleteMissionDto dto)
    {
        var mission = await _context.StudentMissions.FindAsync(id);
        if (mission == null) return NotFound();

        mission.Status = MissionStatus.Completed;
        mission.QualityScore = dto.QualityScore;
        mission.CompletedAt = DateTime.UtcNow;

        // Award XP for self-completion
        await _gamificationService.AwardXPAsync(mission.StudentId, 10, $"Mission terminée : {mission.Id}");
        await _gamificationService.UpdateStreakAsync(mission.StudentId);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/submit-audio")]
    public async Task<IActionResult> SubmitAudio(Guid id, SubmitMissionAudioDto dto)
    {
        var mission = await _context.StudentMissions.FindAsync(id);
        if (mission == null) return NotFound();

        mission.AudioUrl = dto.AudioUrl;
        mission.Status = MissionStatus.Submitted;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/feedback")]
    [Authorize(Roles = "Admin,Teacher,SuperAdmin")]
    public async Task<IActionResult> ProvideFeedback(Guid id, ProvideMissionFeedbackDto dto)
    {
        var mission = await _context.StudentMissions.FindAsync(id);
        if (mission == null) return NotFound();

        mission.QualityScore = dto.QualityScore;
        mission.TeacherFeedback = dto.Feedback;
        mission.Status = MissionStatus.Completed;
        mission.CompletedAt = DateTime.UtcNow;

        // Award XP for teacher-corrected mission (Higher reward for reviewed quality)
        await _gamificationService.AwardXPAsync(mission.StudentId, 25, $"Mission corrigée : {mission.Id}");
        await _gamificationService.UpdateStreakAsync(mission.StudentId);

        await _context.SaveChangesAsync();

        // Notify Student
        var notification = new Notification
        {
            UserId = mission.StudentId,
            Title = "Mission Corrigée",
            Body = $"Votre enseignant a corrigé votre mission. Note : {dto.QualityScore}/5.",
            Type = "Mission",
            IsRead = false
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("evaluations/pending")]
    [Authorize(Roles = "Admin,Teacher,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<StudentMissionDto>>> GetPendingEvaluations()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

        var query = _context.StudentMissions
            .Include(m => m.Student)
            .ThenInclude(s => s.Group)
            .Include(m => m.Teacher)
            .Where(m => (m.Status == MissionStatus.Completed && m.QualityScore == null) || m.Status == MissionStatus.Submitted);

        if (!isAdmin)
        {
            query = query.Where(m => m.TeacherId == userId || (m.Student.Group != null && m.Student.Group.TeacherId == userId));
        }

        var missions = await query
            .OrderByDescending(m => m.CreatedAt)
            .Take(50) // Limit to 50 for performance
            .Select(m => new StudentMissionDto
            {
                Id = m.Id,
                StudentId = m.StudentId,
                TeacherId = m.TeacherId,
                StudentName = m.Student != null ? m.Student.FirstName + " " + m.Student.LastName : "Étudiant Inconnu",
                TeacherName = m.Teacher != null ? m.Teacher.FirstName + " " + m.Teacher.LastName : null,
                Type = m.Type,
                TargetType = m.TargetType,
                TargetId = m.TargetId,
                CustomDescription = m.CustomDescription,
                DueDate = m.DueDate,
                Status = m.Status,
                QualityScore = m.QualityScore,
                AudioUrl = m.AudioUrl,
                TeacherFeedback = m.TeacherFeedback,
                CreatedAt = m.CreatedAt,
                CompletedAt = m.CompletedAt
            })
            .ToListAsync();

        return Ok(missions);
    }
}
