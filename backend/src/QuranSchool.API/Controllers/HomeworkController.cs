using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuranSchool.Application.DTOs.Homework;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Domain.Constants;
using QuranSchool.API.Attributes;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HomeworkController : ControllerBase
{
    private readonly IHomeworkService _service;
    private readonly ICurrentUserService _currentUser;

    public HomeworkController(IHomeworkService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HomeworkResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("assignments/{id}")]
    public async Task<ActionResult<HomeworkAssignmentResponse>> GetAssignmentById(Guid id)
        => Ok(await _service.GetAssignmentByIdAsync(id));

    [HttpGet("teacher")]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<ActionResult<IReadOnlyList<HomeworkResponse>>> GetByTeacher()
        => Ok(await _service.GetByTeacherAsync(_currentUser.UserId ?? Guid.Empty));

    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IReadOnlyList<HomeworkResponse>>> GetByGroup(Guid groupId)
        => Ok(await _service.GetByGroupAsync(groupId));

    [HttpGet("student/my-assignments")]
    [RequirePermission(Permissions.HomeworkView)]
    public async Task<ActionResult<IReadOnlyList<HomeworkAssignmentResponse>>> GetMyAssignments()
        => Ok(await _service.GetStudentAssignmentsAsync(_currentUser.UserId ?? Guid.Empty));
    
    [HttpGet("student/{studentId}/assignments")]
    [RequirePermission(Permissions.HomeworkView)]
    public async Task<ActionResult<IReadOnlyList<HomeworkAssignmentResponse>>> GetStudentAssignments(Guid studentId)
        => Ok(await _service.GetStudentAssignmentsAsync(studentId));

    [HttpPost]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<ActionResult<HomeworkResponse>> Create([FromBody] CreateHomeworkRequest request)
        => Ok(await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, _currentUser.UserId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<ActionResult<HomeworkResponse>> Update(Guid id, [FromBody] UpdateHomeworkRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("assignments/{assignmentId}/submit")]
    [RequirePermission(Permissions.HomeworkView)]
    public async Task<IActionResult> SubmitAssignment(Guid assignmentId, [FromBody] SubmitHomeworkRequest request)
    {
        // Ideally verify student owns this assignment
        await _service.SubmitAssignmentAsync(assignmentId, request);
        return Ok();
    }

    [HttpPost("assignments/{assignmentId}/grade")]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<IActionResult> GradeAssignment(Guid assignmentId, [FromBody] GradeHomeworkRequest request)
    {
        await _service.GradeAssignmentAsync(assignmentId, request);
        return Ok();
    }

    [HttpGet("{id}/assignments")]
    [RequirePermission(Permissions.HomeworkManage)]
    public async Task<ActionResult<IReadOnlyList<HomeworkAssignmentResponse>>> GetAssignments(Guid id)
        => Ok(await _service.GetHomeworkAssignmentsAsync(id));
}
