using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuranSchool.Application.DTOs.Session;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Domain.Enums;

namespace QuranSchool.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SessionController : ControllerBase
{
    private readonly ISessionService _service;
    private readonly ICurrentUserService _currentUser;

    public SessionController(ISessionService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    public async Task<ActionResult<SessionResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IReadOnlyList<SessionResponse>>> GetByGroup(Guid groupId)
        => Ok(await _service.GetByGroupAsync(groupId));

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<ActionResult<SessionResponse>> Create(CreateSessionRequest request)
        => Ok(await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, _currentUser.UserId ?? Guid.Empty, request));

    [HttpPut("{id}/assign-group/{groupId}")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<ActionResult<SessionResponse>> AssignGroup(Guid id, Guid groupId)
        => Ok(await _service.AssignGroupAsync(id, groupId));

    [HttpPut("{id}/status")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<ActionResult<SessionResponse>> UpdateStatus(Guid id, [FromBody] SessionStatus status)
        => Ok(await _service.UpdateStatusAsync(id, status));

    [HttpPost("{id}/attendance")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> MarkAttendance(Guid id, MarkSessionAttendanceRequest request)
    {
        await _service.MarkAttendanceAsync(id, request);
        return NoContent();
    }

    [HttpPost("{id}/recitation")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<ActionResult<SessionRecitationResponse>> StartRecitation(Guid id, StartSessionRecitationRequest request)
        => Ok(await _service.StartRecitationAsync(id, request));

    [HttpPost("recitation/{recitationId}/annotate-verse")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> AnnotateVerse(Guid recitationId, AnnotateSessionVerseRequest request)
    {
        await _service.AnnotateVerseAsync(recitationId, request);
        return NoContent();
    }

    [HttpPost("recitation/{recitationId}/annotate-word")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> AnnotateWord(Guid recitationId, AnnotateSessionWordRequest request)
    {
        await _service.AnnotateWordAsync(recitationId, request);
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] string? pedagogicalSummary)
    {
        await _service.CompleteSessionAsync(id, pedagogicalSummary);
        return NoContent();
    }

    [HttpPost("{id}/send-reports")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> SendReports(Guid id)
    {
        await _service.SendParentReportsAsync(id);
        return Ok();
    }

    [HttpGet("{id}/report")]
    public async Task<ActionResult<SessionReportSummary>> GetReport(Guid id)
        => Ok(await _service.GetSessionReportAsync(id));

    [HttpGet("{id}/cockpit")]
    public async Task<ActionResult<SessionCockpitResponse>> GetCockpitData(Guid id)
        => Ok(await _service.GetCockpitDataAsync(id));

    [HttpPost("{id}/evaluations/batch")]
    [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
    public async Task<IActionResult> BatchEvaluate(Guid id, BatchSessionEvaluationRequest request)
    {
        await _service.BatchEvaluateAsync(id, request);
        return NoContent();
    }
}
