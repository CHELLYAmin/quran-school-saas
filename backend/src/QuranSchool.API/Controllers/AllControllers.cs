using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuranSchool.Application.DTOs.Student;
using QuranSchool.Application.DTOs.Group;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.DTOs.Attendance;
using QuranSchool.Application.DTOs.Payment;
using QuranSchool.Application.DTOs.Progress;
using QuranSchool.Application.DTOs.Schedule;
using QuranSchool.Application.DTOs.School;
using QuranSchool.Application.DTOs.Communication;
using QuranSchool.Application.DTOs.Dashboard;
using QuranSchool.Application.DTOs.Homework;
using QuranSchool.Application.DTOs.Parent;
using QuranSchool.Application.DTOs.Quran;
using QuranSchool.Application.DTOs.Role;
using QuranSchool.Application.DTOs.Session;
using QuranSchool.Application.DTOs.Level;
using QuranSchool.API.Attributes;
using QuranSchool.Domain.Constants;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Interfaces;

namespace QuranSchool.API.Controllers;

// ===== UserController =====
[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _service;
    private readonly ICurrentUserService _currentUser;
    public UserController(IUserService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<IReadOnlyList<QuranSchool.Application.DTOs.User.UserResponse>>> GetAll()
        => Ok(await _service.GetAllUsersAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<QuranSchool.Application.DTOs.User.UserResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("roles")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<IReadOnlyList<QuranSchool.Application.DTOs.User.UserResponse>>> GetByRoles([FromQuery] string[] roles)
    {
        return Ok(await _service.GetUsersByRolesAsync(_currentUser.SchoolId ?? Guid.Empty, roles));
    }

    [HttpPost]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<QuranSchool.Application.DTOs.User.UserResponse>> Create([FromBody] QuranSchool.Application.DTOs.User.CreateUserRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateUserAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<QuranSchool.Application.DTOs.User.UserResponse>> Update(Guid id, [FromBody] QuranSchool.Application.DTOs.User.UpdateUserRequest request)
        => Ok(await _service.UpdateUserAsync(id, request));

    [HttpPut("{id}/role")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<QuranSchool.Application.DTOs.User.UserResponse>> UpdateRoles(Guid id, [FromBody] string[] newRoles)
        => Ok(await _service.UpdateUserRolesAsync(id, newRoles));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<IActionResult> Delete(Guid id) 
    { 
        await _service.DeleteUserAsync(id); 
        return NoContent(); 
    }
}

// ===== SchoolController =====
[ApiController]
[Route("api/school")]
[Authorize]
public class SchoolController : ControllerBase
{
    private readonly ISchoolService _service;
    public SchoolController(ISchoolService service) => _service = service;

    [HttpGet]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<ActionResult<IReadOnlyList<SchoolResponse>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<SchoolResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<ActionResult<SchoolResponse>> Create([FromBody] CreateSchoolRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateAsync(request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<ActionResult<SchoolResponse>> Update(Guid id, [FromBody] UpdateSchoolRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}

// ===== StudentController =====
[ApiController]
[Route("api/student")]
[Authorize]
public class StudentController : ControllerBase
{
    private readonly IStudentService _service;
    private readonly ICurrentUserService _currentUser;
    public StudentController(IStudentService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.StudentsView)]
    public async Task<ActionResult<IReadOnlyList<StudentListResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.StudentsView)]
    public async Task<ActionResult<StudentResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("group/{groupId}")]
    [RequirePermission(Permissions.StudentsView)]
    public async Task<ActionResult<IReadOnlyList<StudentListResponse>>> GetByGroup(Guid groupId)
        => Ok(await _service.GetByGroupAsync(groupId));

    [HttpPost]
    [RequirePermission(Permissions.StudentsManage)]
    public async Task<ActionResult<StudentResponse>> Create([FromBody] CreateStudentRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.StudentsManage)]
    public async Task<ActionResult<StudentResponse>> Update(Guid id, [FromBody] UpdateStudentRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.StudentsManage)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}

// ===== GroupController =====
[ApiController]
[Route("api/group")]
[Authorize]
public class GroupController : ControllerBase
{
    private readonly IGroupService _service;
    private readonly ICurrentUserService _currentUser;
    public GroupController(IGroupService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.GroupsView)]
    public async Task<ActionResult<IReadOnlyList<GroupResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.GroupsView)]
    public async Task<ActionResult<GroupResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [RequirePermission(Permissions.GroupsManage)]
    public async Task<ActionResult<GroupResponse>> Create([FromBody] CreateGroupRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.GroupsManage)]
    public async Task<ActionResult<GroupResponse>> Update(Guid id, [FromBody] UpdateGroupRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.GroupsManage)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}

[Authorize]
[ApiController]
[Route("api/exam")]
public class ExamController : ControllerBase
{
    private readonly IExamService _service;
    private readonly ICurrentUserService _currentUser;

    public ExamController(IExamService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    [RequirePermission(Permissions.ExamsView)]
    public async Task<ActionResult<IReadOnlyList<ExamResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.ExamsView)]
    public async Task<ActionResult<ExamResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpPost("start")]
    [RequirePermission(Permissions.ExamsManage)]
    public async Task<ActionResult<ExamResponse>> Start(StartExamRequest request)
        => Ok(await _service.StartExamAsync(_currentUser.SchoolId ?? Guid.Empty, request.ExaminerId, request));

    [HttpPost("{id}/start")]
    [RequirePermission(Permissions.ExamsManage)]
    public async Task<IActionResult> MarkInProgress(Guid id)
    {
        await _service.MarkInProgressAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/annotate-verse")]
    [RequirePermission(Permissions.ExamsManage)]
    public async Task<IActionResult> AnnotateVerse(Guid id, AnnotateVerseRequest request)
    {
        await _service.AnnotateVerseAsync(id, request);
        return NoContent();
    }

    [HttpPost("{id}/annotate-word")]
    [RequirePermission(Permissions.ExamsManage)]
    public async Task<IActionResult> AnnotateWord(Guid id, AnnotateWordRequest request)
    {
        await _service.AnnotateWordAsync(id, request);
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [RequirePermission(Permissions.ExamsManage)]
    public async Task<IActionResult> Complete(Guid id, [FromBody] string? globalComment)
    {
        await _service.CompleteExamAsync(id, globalComment);
        return NoContent();
    }

    [HttpGet("{id}/report")]
    [RequirePermission(Permissions.ExamsView)]
    public async Task<ActionResult<ExamReportResponse>> GetReport(Guid id)
        => Ok(await _service.GetReportAsync(id));
}

[Authorize]
[ApiController]
[Route("api/mushaf")]
public class MushafController : ControllerBase
{
    private readonly IMushafService _service;

    public MushafController(IMushafService service)
    {
        _service = service;
    }

    [HttpGet("surahs")]
    [RequirePermission(Permissions.MushafView)]
    public async Task<ActionResult<IReadOnlyList<SurahResponse>>> GetSurahs()
        => Ok(await _service.GetSurahsAsync());

    [HttpGet("surahs/{id}")]
    [RequirePermission(Permissions.MushafView)]
    public async Task<ActionResult<SurahResponse>> GetSurahById(Guid id)
        => Ok(await _service.GetSurahByIdAsync(id));

    [HttpGet("surahs/{id}/verses")]
    [RequirePermission(Permissions.MushafView)]
    public async Task<ActionResult<IReadOnlyList<VerseResponse>>> GetVerses(Guid id, [FromQuery] int? start, [FromQuery] int? end)
        => Ok(await _service.GetVersesAsync(id, start, end));
}

// ===== AttendanceController =====
[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;
    private readonly ICurrentUserService _currentUser;
    public AttendanceController(IAttendanceService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpPost]
    [RequirePermission(Permissions.AttendanceManage)]
    public async Task<ActionResult<AttendanceResponse>> Mark([FromBody] MarkAttendanceRequest request)
        => Ok(await _service.MarkAttendanceAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPost("bulk")]
    [RequirePermission(Permissions.AttendanceManage)]
    public async Task<IActionResult> BulkMark([FromBody] BulkAttendanceRequest request)
    { await _service.BulkMarkAttendanceAsync(_currentUser.SchoolId ?? Guid.Empty, request); return Ok(); }

    [HttpGet("student/{studentId}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<IReadOnlyList<AttendanceResponse>>> GetByStudent(Guid studentId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        => Ok(await _service.GetByStudentAsync(studentId, from, to));

    [HttpGet("date/{date}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<IReadOnlyList<AttendanceResponse>>> GetByDate(DateTime date)
        => Ok(await _service.GetByDateAsync(_currentUser.SchoolId ?? Guid.Empty, date));

    [HttpGet("rate/{studentId}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<double>> GetRate(Guid studentId)
        => Ok(await _service.GetAttendanceRateAsync(studentId));
}

// ===== TeacherAttendanceController =====
[ApiController]
[Route("api/teacherattendance")]
[Authorize]
public class TeacherAttendanceController : ControllerBase
{
    private readonly ITeacherAttendanceService _service;
    private readonly ICurrentUserService _currentUser;
    public TeacherAttendanceController(ITeacherAttendanceService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpPost]
    [RequirePermission(Permissions.AttendanceManage)]
    public async Task<ActionResult<TeacherAttendanceResponse>> Mark([FromBody] MarkTeacherAttendanceRequest request)
        => Ok(await _service.MarkAttendanceAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPost("bulk")]
    [RequirePermission(Permissions.AttendanceManage)]
    public async Task<IActionResult> BulkMark([FromBody] BulkTeacherAttendanceRequest request)
    { await _service.BulkMarkAttendanceAsync(_currentUser.SchoolId ?? Guid.Empty, request); return Ok(); }

    [HttpGet("teacher/{teacherId}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<IReadOnlyList<TeacherAttendanceResponse>>> GetByTeacher(Guid teacherId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        => Ok(await _service.GetByTeacherAsync(teacherId, from, to));

    [HttpGet("date/{date}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<IReadOnlyList<TeacherAttendanceResponse>>> GetByDate(DateTime date)
        => Ok(await _service.GetByDateAsync(_currentUser.SchoolId ?? Guid.Empty, date));

    [HttpGet("rate/{teacherId}")]
    [RequirePermission(Permissions.AttendanceView)]
    public async Task<ActionResult<double>> GetRate(Guid teacherId)
        => Ok(await _service.GetAttendanceRateAsync(teacherId));
}

// ===== PaymentController =====
[ApiController]
[Route("api/payment")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;
    private readonly ICurrentUserService _currentUser;
    public PaymentController(IPaymentService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.PaymentsView)]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.PaymentsView)]
    public async Task<ActionResult<PaymentResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("student/{studentId}")]
    [RequirePermission(Permissions.PaymentsView)]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>> GetByStudent(Guid studentId)
        => Ok(await _service.GetByStudentAsync(studentId));

    [HttpPost]
    [RequirePermission(Permissions.PaymentsManage)]
    public async Task<ActionResult<PaymentResponse>> Create([FromBody] CreatePaymentRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}/status")]
    [RequirePermission(Permissions.PaymentsManage)]
    public async Task<ActionResult<PaymentResponse>> UpdateStatus(Guid id, [FromBody] UpdatePaymentStatusRequest request)
        => Ok(await _service.UpdateStatusAsync(id, request));

    [HttpGet("stats")]
    [RequirePermission(Permissions.PaymentsView)]
    public async Task<ActionResult<RevenueStatsResponse>> GetStats()
        => Ok(await _service.GetRevenueStatsAsync(_currentUser.SchoolId ?? Guid.Empty));
}

// ===== ProgressController =====
[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _service;
    private readonly ICurrentUserService _currentUser;
    public ProgressController(IProgressService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.ProgressView)]
    public async Task<ActionResult<IReadOnlyList<ProgressResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.ProgressView)]
    public async Task<ActionResult<ProgressResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("student/{studentId}")]
    [RequirePermission(Permissions.ProgressView)]
    public async Task<ActionResult<IReadOnlyList<ProgressResponse>>> GetByStudent(Guid studentId)
        => Ok(await _service.GetByStudentAsync(studentId));

    [HttpGet("student/{studentId}/summary")]
    [RequirePermission(Permissions.ProgressView)]
    public async Task<ActionResult<StudentProgressSummary>> GetSummary(Guid studentId)
        => Ok(await _service.GetStudentSummaryAsync(studentId));

    [HttpPost]
    [RequirePermission(Permissions.ProgressManage)]
    public async Task<ActionResult<ProgressResponse>> Create([FromBody] CreateProgressRequest request)
        => Ok(await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.ProgressManage)]
    public async Task<ActionResult<ProgressResponse>> Update(Guid id, [FromBody] UpdateProgressRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.ProgressManage)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}

// ===== ScheduleController =====
[ApiController]
[Route("api/schedule")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _service;
    private readonly ICurrentUserService _currentUser;
    public ScheduleController(IScheduleService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.ScheduleView)]
    public async Task<ActionResult<IReadOnlyList<ScheduleResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.ScheduleView)]
    public async Task<ActionResult<ScheduleResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpGet("group/{groupId}")]
    [RequirePermission(Permissions.ScheduleView)]
    public async Task<ActionResult<IReadOnlyList<ScheduleResponse>>> GetByGroup(Guid groupId)
        => Ok(await _service.GetByGroupAsync(groupId));

    [HttpPost]
    [RequirePermission(Permissions.ScheduleManage)]
    public async Task<ActionResult<ScheduleResponse>> Create([FromBody] CreateScheduleRequest request)
        => Ok(await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.ScheduleManage)]
    public async Task<ActionResult<ScheduleResponse>> Update(Guid id, [FromBody] UpdateScheduleRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.ScheduleManage)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}

// ===== DashboardController =====
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;
    private readonly ICurrentUserService _currentUser;
    public DashboardController(IDashboardService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet("admin")]
    [RequirePermission(Permissions.AdminDashboardView)]
    public async Task<ActionResult<AdminDashboardResponse>> GetAdminDashboard()
        => Ok(await _service.GetAdminDashboardAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("teacher/{teacherId}")]
    [RequirePermission(Permissions.DashboardView)]
    public async Task<ActionResult<TeacherDashboardResponse>> GetTeacherDashboard(Guid teacherId)
        => Ok(await _service.GetTeacherDashboardAsync(teacherId, _currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("parent/{parentId}")]
    [RequirePermission(Permissions.DashboardView)]
    public async Task<ActionResult<ParentDashboardResponse>> GetParentDashboard(Guid parentId)
        => Ok(await _service.GetParentDashboardAsync(parentId, _currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("student/{studentId}")]
    [RequirePermission(Permissions.DashboardView)]
    public async Task<ActionResult<StudentDashboardResponse>> GetStudentDashboard(Guid studentId)
        => Ok(await _service.GetStudentDashboardAsync(studentId, _currentUser.SchoolId ?? Guid.Empty));
}

// ===== CommunicationController =====
[ApiController]
[Route("api/communication")]
[Authorize]
public class CommunicationController : ControllerBase
{
    private readonly ICommunicationService _service;
    private readonly ICurrentUserService _currentUser;
    public CommunicationController(ICommunicationService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpPost("messages")]
    [RequirePermission(Permissions.MessagesSend)]
    public async Task<ActionResult<MessageResponse>> SendMessage([FromBody] SendMessageRequest request)
        => Ok(await _service.SendMessageAsync(_currentUser.SchoolId ?? Guid.Empty, _currentUser.UserId ?? Guid.Empty, request));

    [HttpGet("messages/inbox")]
    [RequirePermission(Permissions.MessagesView)]
    public async Task<ActionResult<IReadOnlyList<MessageResponse>>> GetInbox()
        => Ok(await _service.GetInboxAsync(_currentUser.UserId ?? Guid.Empty));

    [HttpGet("messages/sent")]
    [RequirePermission(Permissions.MessagesView)]
    public async Task<ActionResult<IReadOnlyList<MessageResponse>>> GetSent()
        => Ok(await _service.GetSentAsync(_currentUser.UserId ?? Guid.Empty));

    [HttpPut("messages/{id}/read")]
    [RequirePermission(Permissions.MessagesView)]
    public async Task<IActionResult> MarkMessageRead(Guid id) { await _service.MarkMessageAsReadAsync(id); return NoContent(); }

    [HttpGet("notifications")]
    [RequirePermission(Permissions.MessagesView)]
    public async Task<ActionResult<IReadOnlyList<NotificationResponse>>> GetNotifications()
        => Ok(await _service.GetNotificationsAsync(_currentUser.UserId ?? Guid.Empty));

    [HttpPut("notifications/{id}/read")]
    [RequirePermission(Permissions.MessagesView)]
    public async Task<IActionResult> MarkNotificationRead(Guid id) { await _service.MarkNotificationAsReadAsync(id); return NoContent(); }
}

// ===== ParentController =====
[ApiController]
[Route("api/parent")]
[Authorize]
public class ParentController : ControllerBase
{
    private readonly IParentService _service;
    private readonly ICurrentUserService _currentUser;
    public ParentController(IParentService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<IReadOnlyList<ParentResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<ParentResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<ParentResponse>> Create(CreateParentRequest request)
    {
        var schoolId = _currentUser.SchoolId ?? Guid.Empty;
        var parent = await _service.CreateAsync(schoolId, request);
        return CreatedAtAction(nameof(GetById), new { id = parent.Id }, parent);
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<ParentResponse>> Update(Guid id, UpdateParentRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}

// ===== RoleController =====
[ApiController]
[Route("api/role")]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRoleService _service;
    private readonly ICurrentUserService _currentUser;
    public RoleController(IRoleService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<IReadOnlyList<RoleResponse>>> GetAllRoles()
        => Ok(await _service.GetAllRolesAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<RoleResponse>> GetRoleById(Guid id)
        => Ok(await _service.GetRoleByIdAsync(id));

    [HttpPost]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<RoleResponse>> CreateRole(CreateRoleRequest request)
    {
        var schoolId = _currentUser.SchoolId ?? Guid.Empty;
        var role = await _service.CreateRoleAsync(schoolId, request);
        return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role);
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<RoleResponse>> UpdateRole(Guid id, UpdateRoleRequest request)
        => Ok(await _service.UpdateRoleAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        await _service.DeleteRoleAsync(id);
        return NoContent();
    }

    [HttpGet("permissions")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<IReadOnlyList<PermissionResponse>>> GetAllPermissions()
        => Ok(await _service.GetAllPermissionsAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{roleId}/permissions")]
    [RequirePermission(Permissions.RolesManage)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetRolePermissions(Guid roleId)
        => Ok(await _service.GetRolePermissionsAsync(roleId));
}

// ===== LevelController =====
[ApiController]
[Route("api/level")]
[Authorize]
public class LevelController : ControllerBase
{
    private readonly ILevelService _service;
    private readonly ICurrentUserService _currentUser;
    public LevelController(ILevelService service, ICurrentUserService currentUser) { _service = service; _currentUser = currentUser; }

    [HttpGet]
    [RequirePermission(Permissions.SettingsView)]
    public async Task<ActionResult<IReadOnlyList<LevelResponse>>> GetAll()
        => Ok(await _service.GetAllAsync(_currentUser.SchoolId ?? Guid.Empty));

    [HttpGet("{id}")]
    [RequirePermission(Permissions.SettingsView)]
    public async Task<ActionResult<LevelResponse>> GetById(Guid id)
        => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<ActionResult<LevelResponse>> Create([FromBody] CreateLevelRequest request)
        => CreatedAtAction(nameof(GetById), new { id = Guid.NewGuid() }, await _service.CreateAsync(_currentUser.SchoolId ?? Guid.Empty, request));

    [HttpPut("{id}")]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<ActionResult<LevelResponse>> Update(Guid id, [FromBody] UpdateLevelRequest request)
        => Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.SettingsManage)]
    public async Task<IActionResult> Delete(Guid id) { await _service.DeleteAsync(id); return NoContent(); }
}
