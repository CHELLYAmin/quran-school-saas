using QuranSchool.Application.DTOs.Auth;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.DTOs.Quran;
using QuranSchool.Domain.Entities;
using QuranSchool.Application.DTOs.Student;
using QuranSchool.Application.DTOs.Group;
using QuranSchool.Application.DTOs.Attendance;
using QuranSchool.Application.DTOs.Payment;
using QuranSchool.Application.DTOs.Progress;
using QuranSchool.Application.DTOs.Schedule;
using QuranSchool.Application.DTOs.Dashboard;
using QuranSchool.Application.DTOs.Communication;
using QuranSchool.Application.DTOs.School;
using QuranSchool.Application.DTOs.Homework;
using QuranSchool.Application.DTOs.Parent;
using QuranSchool.Application.DTOs.Session;
using QuranSchool.Application.DTOs.Role;
using QuranSchool.Application.DTOs.Level;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task RevokeTokenAsync(Guid userId);
}

public interface IUserService
{
    Task<QuranSchool.Application.DTOs.User.UserResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<QuranSchool.Application.DTOs.User.UserResponse>> GetUsersByRolesAsync(Guid schoolId, params string[] roles);
    Task<IReadOnlyList<QuranSchool.Application.DTOs.User.UserResponse>> GetAllUsersAsync(Guid schoolId);
    Task<QuranSchool.Application.DTOs.User.UserResponse> CreateUserAsync(Guid schoolId, QuranSchool.Application.DTOs.User.CreateUserRequest request);
    Task<QuranSchool.Application.DTOs.User.UserResponse> UpdateUserAsync(Guid id, QuranSchool.Application.DTOs.User.UpdateUserRequest request);
    Task<QuranSchool.Application.DTOs.User.UserResponse> UpdateUserRolesAsync(Guid id, IEnumerable<string> newRoles);
    Task DeleteUserAsync(Guid id);
}

public interface ISchoolService
{
    Task<SchoolResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<SchoolResponse>> GetAllAsync();
    Task<SchoolResponse> CreateAsync(CreateSchoolRequest request);
    Task<SchoolResponse> UpdateAsync(Guid id, UpdateSchoolRequest request);
    Task DeleteAsync(Guid id);
}

public interface IStudentService
{
    Task<StudentResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<StudentListResponse>> GetAllAsync(Guid schoolId);
    Task<IReadOnlyList<StudentListResponse>> GetByGroupAsync(Guid groupId);
    Task<StudentResponse> CreateAsync(Guid schoolId, CreateStudentRequest request);
    Task<StudentResponse> UpdateAsync(Guid id, UpdateStudentRequest request);
    Task DeleteAsync(Guid id);
}

public interface IGroupService
{
    Task<GroupResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<GroupResponse>> GetAllAsync(Guid schoolId);
    Task<GroupResponse> CreateAsync(Guid schoolId, CreateGroupRequest request);
    Task<GroupResponse> UpdateAsync(Guid id, UpdateGroupRequest request);
    Task DeleteAsync(Guid id);
}

public interface IExamService
{
    Task<ExamResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<ExamResponse>> GetAllAsync(Guid schoolId);
    Task<ExamResponse> StartExamAsync(Guid schoolId, Guid examinerId, StartExamRequest request);
    Task MarkInProgressAsync(Guid examId);
    Task AnnotateVerseAsync(Guid examId, AnnotateVerseRequest request);
    Task AnnotateWordAsync(Guid examId, AnnotateWordRequest request);
    Task CompleteExamAsync(Guid examId, string? globalComment);
    Task<ExamReportResponse> GetReportAsync(Guid examId);
}

public interface IMushafService
{
    Task<IReadOnlyList<SurahResponse>> GetSurahsAsync();
    Task<SurahResponse> GetSurahByIdAsync(Guid id);
    Task<IReadOnlyList<VerseResponse>> GetVersesAsync(Guid surahId, int? start = null, int? end = null);
}

public interface IScoringService
{
    decimal CalculateScore(Exam exam);
}

public interface IExamReportService
{
    Task<ExamReportResponse> GenerateReportAsync(Guid examId);
    Task<byte[]> GeneratePdfReportAsync(Guid examId);
}

public interface IAttendanceService
{
    Task<AttendanceResponse> MarkAttendanceAsync(Guid schoolId, MarkAttendanceRequest request);
    Task BulkMarkAttendanceAsync(Guid schoolId, BulkAttendanceRequest request);
    Task<IReadOnlyList<AttendanceResponse>> GetByStudentAsync(Guid studentId, DateTime? from = null, DateTime? to = null);
    Task<IReadOnlyList<AttendanceResponse>> GetByDateAsync(Guid schoolId, DateTime date);
    Task<double> GetAttendanceRateAsync(Guid studentId);
}

public interface ITeacherAttendanceService
{
    Task<TeacherAttendanceResponse> MarkAttendanceAsync(Guid schoolId, MarkTeacherAttendanceRequest request);
    Task BulkMarkAttendanceAsync(Guid schoolId, BulkTeacherAttendanceRequest request);
    Task<IReadOnlyList<TeacherAttendanceResponse>> GetByTeacherAsync(Guid teacherId, DateTime? from = null, DateTime? to = null);
    Task<IReadOnlyList<TeacherAttendanceResponse>> GetByDateAsync(Guid schoolId, DateTime date);
    Task<double> GetAttendanceRateAsync(Guid teacherId);
}

public interface IPaymentService
{
    Task<PaymentResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<PaymentResponse>> GetByStudentAsync(Guid studentId);
    Task<IReadOnlyList<PaymentResponse>> GetAllAsync(Guid schoolId);
    Task<PaymentResponse> CreateAsync(Guid schoolId, CreatePaymentRequest request);
    Task<PaymentResponse> UpdateStatusAsync(Guid id, UpdatePaymentStatusRequest request);
    Task<RevenueStatsResponse> GetRevenueStatsAsync(Guid schoolId);
    Task<string> CreateCheckoutSessionAsync(Guid paymentId, string successUrl, string cancelUrl);
}

public interface IProgressService
{
    Task<ProgressResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<ProgressResponse>> GetByStudentAsync(Guid studentId);
    Task<ProgressResponse> CreateAsync(Guid schoolId, CreateProgressRequest request);
    Task<ProgressResponse> UpdateAsync(Guid id, UpdateProgressRequest request);
    Task<StudentProgressSummary> GetStudentSummaryAsync(Guid studentId);
    Task<IReadOnlyList<ProgressResponse>> GetAllAsync(Guid schoolId);
    Task DeleteAsync(Guid id);
}

public interface IScheduleService
{
    Task<ScheduleResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<ScheduleResponse>> GetByGroupAsync(Guid groupId);
    Task<IReadOnlyList<ScheduleResponse>> GetAllAsync(Guid schoolId);
    Task<ScheduleResponse> CreateAsync(Guid schoolId, CreateScheduleRequest request);
    Task<ScheduleResponse> UpdateAsync(Guid id, UpdateScheduleRequest request);
    Task DeleteAsync(Guid id);
}

public interface IDashboardService
{
    Task<AdminDashboardResponse> GetAdminDashboardAsync(Guid schoolId);
    Task<TeacherDashboardResponse> GetTeacherDashboardAsync(Guid teacherId, Guid schoolId);
    Task<ParentDashboardResponse> GetParentDashboardAsync(Guid parentId, Guid schoolId);
    Task<StudentDashboardResponse> GetStudentDashboardAsync(Guid studentId, Guid schoolId);
}

public interface ICommunicationService
{
    Task<MessageResponse> SendMessageAsync(Guid schoolId, Guid senderId, SendMessageRequest request);
    Task<IReadOnlyList<MessageResponse>> GetInboxAsync(Guid userId);
    Task<IReadOnlyList<MessageResponse>> GetSentAsync(Guid userId);
    Task MarkMessageAsReadAsync(Guid messageId);
    Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId);
    Task MarkNotificationAsReadAsync(Guid notificationId);
    Task CreateNotificationAsync(Guid schoolId, Guid userId, string title, string body, string? type = null, string? referenceId = null);
}

public interface IParentService
{
    Task<IReadOnlyList<ParentResponse>> GetAllAsync(Guid schoolId);
    Task<ParentResponse> GetByIdAsync(Guid id);
    Task<ParentResponse> CreateAsync(Guid schoolId, CreateParentRequest request);
    Task<ParentResponse> UpdateAsync(Guid id, UpdateParentRequest request);
    Task DeleteAsync(Guid id);
}

public interface IRoleService
{
    Task<IReadOnlyList<RoleResponse>> GetAllRolesAsync(Guid schoolId);
    Task<RoleResponse> GetRoleByIdAsync(Guid id);
    Task<RoleResponse> CreateRoleAsync(Guid schoolId, CreateRoleRequest request);
    Task<RoleResponse> UpdateRoleAsync(Guid id, UpdateRoleRequest request);
    Task DeleteRoleAsync(Guid id);
    Task<IReadOnlyList<PermissionResponse>> GetAllPermissionsAsync(Guid schoolId);
    Task<IReadOnlyList<string>> GetRolePermissionsAsync(Guid roleId);
}

public interface IHomeworkService
{
    Task<HomeworkResponse> GetByIdAsync(Guid id);
    Task<HomeworkAssignmentResponse> GetAssignmentByIdAsync(Guid id);
    Task<IReadOnlyList<HomeworkResponse>> GetByTeacherAsync(Guid teacherId);
    Task<IReadOnlyList<HomeworkResponse>> GetByGroupAsync(Guid groupId);
    Task<IReadOnlyList<HomeworkAssignmentResponse>> GetStudentAssignmentsAsync(Guid studentId);
    Task<HomeworkResponse> CreateAsync(Guid schoolId, Guid teacherId, CreateHomeworkRequest request);
    Task<HomeworkResponse> UpdateAsync(Guid id, UpdateHomeworkRequest request);
    Task DeleteAsync(Guid id);
    Task SubmitAssignmentAsync(Guid assignmentId, SubmitHomeworkRequest request);
    Task GradeAssignmentAsync(Guid assignmentId, GradeHomeworkRequest request);
    Task<IReadOnlyList<HomeworkAssignmentResponse>> GetHomeworkAssignmentsAsync(Guid homeworkId);
}

public interface ISessionService
{
    Task<SessionResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<SessionResponse>> GetAllAsync(Guid schoolId);
    Task<IReadOnlyList<SessionResponse>> GetByGroupAsync(Guid groupId);
    Task<SessionResponse> CreateAsync(Guid schoolId, Guid teacherId, CreateSessionRequest request);
    Task<SessionResponse> AssignGroupAsync(Guid sessionId, Guid groupId);
    Task<SessionResponse> UpdateStatusAsync(Guid id, SessionStatus status);
    Task MarkAttendanceAsync(Guid sessionId, MarkSessionAttendanceRequest request);
    Task<SessionRecitationResponse> StartRecitationAsync(Guid sessionId, StartSessionRecitationRequest request);
    Task AnnotateVerseAsync(Guid recitationId, AnnotateSessionVerseRequest request);
    Task AnnotateWordAsync(Guid recitationId, AnnotateSessionWordRequest request);
    Task CompleteSessionAsync(Guid sessionId, string? pedagogicalSummary);
    Task<SessionReportSummary> GetSessionReportAsync(Guid sessionId);
    Task SendParentReportsAsync(Guid sessionId);
    
    // API-Q Cockpit Methods
    Task<SessionCockpitResponse> GetCockpitDataAsync(Guid sessionId);
    Task BatchEvaluateAsync(Guid sessionId, BatchSessionEvaluationRequest request);
}

public interface ILevelService
{
    Task<LevelResponse> GetByIdAsync(Guid id);
    Task<IReadOnlyList<LevelResponse>> GetAllAsync(Guid schoolId);
    Task<LevelResponse> CreateAsync(Guid schoolId, CreateLevelRequest request);
    Task<LevelResponse> UpdateAsync(Guid id, UpdateLevelRequest request);
    Task DeleteAsync(Guid id);
}

public interface IProgressCalculationService
{
    Task CreateProgressSnapshotAsync(Guid studentId, Guid sessionId);
    Task<IReadOnlyList<StudentProgressSnapshot>> GetStudentHistoryAsync(Guid studentId);
}

public interface ISmartQueueService
{
    Task<IReadOnlyList<SmartQueueStudentDto>> GenerateQueueForGroupAsync(Guid groupId, Guid? sessionId = null);
    Task<SmartQueueStudentDto> GetStudentPriorityAsync(Guid studentId, Guid? sessionId = null, int? levelStartSurah = null, int? levelEndSurah = null);
}
public interface IReportService
{
    Task<byte[]> GenerateStudentProgressPdfAsync(Guid studentId);
}
