using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Group;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.DTOs.Attendance;
using QuranSchool.Application.DTOs.Payment;
using QuranSchool.Application.DTOs.Progress;
using QuranSchool.Application.DTOs.Schedule;
using QuranSchool.Application.DTOs.School;
using QuranSchool.Application.DTOs.Communication;
using QuranSchool.Application.DTOs.Dashboard;
using QuranSchool.Application.DTOs.Parent;
using QuranSchool.Application.DTOs.Level;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.SignalR;

namespace QuranSchool.Infrastructure.Services;

// ===== SchoolService =====
public class SchoolService : ISchoolService
{
    private readonly AppDbContext _context;
    public SchoolService(AppDbContext context) => _context = context;

    public async Task<SchoolResponse> GetByIdAsync(Guid id)
    {
        var s = await _context.Schools.FindAsync(id) ?? throw new KeyNotFoundException("School not found.");
        return new SchoolResponse(s.Id, s.Name, s.Address, s.Phone, s.Email, s.LogoUrl, s.Description, s.IsActive, s.CreatedAt);
    }

    public async Task<IReadOnlyList<SchoolResponse>> GetAllAsync()
        => await _context.Schools.Select(s => new SchoolResponse(s.Id, s.Name, s.Address, s.Phone, s.Email, s.LogoUrl, s.Description, s.IsActive, s.CreatedAt)).ToListAsync();

    public async Task<SchoolResponse> CreateAsync(CreateSchoolRequest request)
    {
        var school = new School { Name = request.Name, Address = request.Address, Phone = request.Phone, Email = request.Email, Description = request.Description, SchoolId = Guid.NewGuid() };
        school.SchoolId = school.Id; // Self-reference for multi-tenant
        _context.Schools.Add(school);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(school.Id);
    }

    public async Task<SchoolResponse> UpdateAsync(Guid id, UpdateSchoolRequest request)
    {
        var school = await _context.Schools.FindAsync(id) ?? throw new KeyNotFoundException("School not found.");
        school.Name = request.Name; school.Address = request.Address; school.Phone = request.Phone;
        school.Email = request.Email; school.Description = request.Description; school.LogoUrl = request.LogoUrl;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(school.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var school = await _context.Schools.FindAsync(id) ?? throw new KeyNotFoundException("School not found.");
        school.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}

// ===== GroupService =====
public class GroupService : IGroupService
{
    private readonly AppDbContext _context;
    public GroupService(AppDbContext context) => _context = context;

    public async Task<GroupResponse> GetByIdAsync(Guid id)
    {
        var g = await _context.Groups.Include(g => g.Teacher).Include(g => g.Level).Include(g => g.Students).FirstOrDefaultAsync(g => g.Id == id)
            ?? throw new KeyNotFoundException("Group not found.");
        return MapGroup(g);
    }

    public async Task<IReadOnlyList<GroupResponse>> GetAllAsync(Guid schoolId)
        => await _context.Groups.Where(g => g.SchoolId == schoolId).Include(g => g.Teacher).Include(g => g.Level).Include(g => g.Students)
            .Select(g => MapGroup(g)).ToListAsync();

    public async Task<GroupResponse> CreateAsync(Guid schoolId, CreateGroupRequest request)
    {
        var group = new Group { SchoolId = schoolId, Name = request.Name, LevelId = request.LevelId, MaxCapacity = request.MaxCapacity, Description = request.Description, TeacherId = request.TeacherId };
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(group.Id);
    }

    public async Task<GroupResponse> UpdateAsync(Guid id, UpdateGroupRequest request)
    {
        var group = await _context.Groups.FindAsync(id) ?? throw new KeyNotFoundException("Group not found.");
        group.Name = request.Name; group.LevelId = request.LevelId; group.MaxCapacity = request.MaxCapacity;
        group.Description = request.Description; group.TeacherId = request.TeacherId; group.IsActive = request.IsActive;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(group.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var group = await _context.Groups.FindAsync(id) ?? throw new KeyNotFoundException("Group not found.");
        group.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    private static GroupResponse MapGroup(Group g) => new(
        g.Id, g.Name, g.LevelId, g.Level?.Name, g.MaxCapacity, g.Description, g.IsActive,
        g.TeacherId, g.Teacher != null ? $"{g.Teacher.FirstName} {g.Teacher.LastName}".Trim() : null, g.Students.Count,
        g.Level?.StartSurah, g.Level?.EndSurah, g.CreatedAt
    );
}

// ===== AttendanceService =====
public class AttendanceService : IAttendanceService
{
    private readonly AppDbContext _context;
    public AttendanceService(AppDbContext context) => _context = context;

    public async Task<AttendanceResponse> MarkAttendanceAsync(Guid schoolId, MarkAttendanceRequest request)
    {
        var attendance = new Attendance { SchoolId = schoolId, StudentId = request.StudentId, Date = request.Date, Status = request.Status, Notes = request.Notes, CheckInTime = TimeOnly.FromDateTime(DateTime.UtcNow) };
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        var student = await _context.Students.FindAsync(request.StudentId);
        return new AttendanceResponse(attendance.Id, attendance.StudentId, student != null ? $"{student.FirstName} {student.LastName}".Trim() : "", attendance.Date, attendance.Status, attendance.Notes, attendance.CheckInTime);
    }

    public async Task BulkMarkAttendanceAsync(Guid schoolId, BulkAttendanceRequest request)
    {
        foreach (var record in request.Records)
            await MarkAttendanceAsync(schoolId, record);
    }

    public async Task<IReadOnlyList<AttendanceResponse>> GetByStudentAsync(Guid studentId, DateTime? from, DateTime? to)
    {
        var query = _context.Attendances.Where(a => a.StudentId == studentId).Include(a => a.Student).AsQueryable();
        if (from.HasValue) query = query.Where(a => a.Date >= from.Value);
        if (to.HasValue) query = query.Where(a => a.Date <= to.Value);
        return await query.OrderByDescending(a => a.Date)
            .Select(a => new AttendanceResponse(a.Id, a.StudentId, a.Student != null ? $"{a.Student.FirstName} {a.Student.LastName}".Trim() : "", a.Date, a.Status, a.Notes, a.CheckInTime)).ToListAsync();
    }

    public async Task<IReadOnlyList<AttendanceResponse>> GetByDateAsync(Guid schoolId, DateTime date)
        => await _context.Attendances.Where(a => a.SchoolId == schoolId && a.Date.Date == date.Date).Include(a => a.Student)
            .Select(a => new AttendanceResponse(a.Id, a.StudentId, a.Student != null ? $"{a.Student.FirstName} {a.Student.LastName}".Trim() : "", a.Date, a.Status, a.Notes, a.CheckInTime)).ToListAsync();

    public async Task<double> GetAttendanceRateAsync(Guid studentId)
    {
        var total = await _context.Attendances.CountAsync(a => a.StudentId == studentId);
        if (total == 0) return 100;
        var present = await _context.Attendances.CountAsync(a => a.StudentId == studentId && (a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late));
        return Math.Round((double)present / total * 100, 1);
    }
}

// ===== TeacherAttendanceService =====
public class TeacherAttendanceService : ITeacherAttendanceService
{
    private readonly AppDbContext _context;
    public TeacherAttendanceService(AppDbContext context) => _context = context;

    public async Task<TeacherAttendanceResponse> MarkAttendanceAsync(Guid schoolId, MarkTeacherAttendanceRequest request)
    {
        var attendance = new TeacherAttendance { Date = request.Date, Status = request.Status, Notes = request.Notes, CheckInTime = TimeOnly.FromDateTime(DateTime.UtcNow), TeacherId = request.TeacherId };
        _context.TeacherAttendances.Add(attendance);
        await _context.SaveChangesAsync();
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == request.TeacherId);
        return new TeacherAttendanceResponse(attendance.Id, attendance.TeacherId, teacher != null ? $"{teacher.FirstName} {teacher.LastName}".Trim() : "", attendance.Date, attendance.Status, attendance.Notes, attendance.CheckInTime);
    }

    public async Task BulkMarkAttendanceAsync(Guid schoolId, BulkTeacherAttendanceRequest request)
    {
        foreach (var record in request.Records)
            await MarkAttendanceAsync(schoolId, record);
    }

    public async Task<IReadOnlyList<TeacherAttendanceResponse>> GetByTeacherAsync(Guid teacherId, DateTime? from, DateTime? to)
    {
        var query = _context.TeacherAttendances.Where(a => a.TeacherId == teacherId).Include(a => a.Teacher).AsQueryable();
        if (from.HasValue) query = query.Where(a => a.Date >= from.Value);
        if (to.HasValue) query = query.Where(a => a.Date <= to.Value);
        return await query.OrderByDescending(a => a.Date)
            .Select(a => new TeacherAttendanceResponse(a.Id, a.TeacherId, a.Teacher != null ? $"{a.Teacher.FirstName} {a.Teacher.LastName}".Trim() : "", a.Date, a.Status, a.Notes, a.CheckInTime)).ToListAsync();
    }

    public async Task<IReadOnlyList<TeacherAttendanceResponse>> GetByDateAsync(Guid schoolId, DateTime date)
        => await _context.TeacherAttendances.Where(a => a.Teacher!.SchoolId == schoolId && a.Date.Date == date.Date).Include(a => a.Teacher)
            .Select(a => new TeacherAttendanceResponse(a.Id, a.TeacherId, a.Teacher != null ? $"{a.Teacher.FirstName} {a.Teacher.LastName}".Trim() : "", a.Date, a.Status, a.Notes, a.CheckInTime)).ToListAsync();

    public async Task<double> GetAttendanceRateAsync(Guid teacherId)
    {
        var total = await _context.TeacherAttendances.CountAsync(a => a.TeacherId == teacherId);
        if (total == 0) return 100;
        var present = await _context.TeacherAttendances.CountAsync(a => a.TeacherId == teacherId && (a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late));
        return Math.Round((double)present / total * 100, 1);
    }
}

// ===== PaymentService =====
public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;
    private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

    public PaymentService(AppDbContext context, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<PaymentResponse> GetByIdAsync(Guid id)
    {
        var p = await _context.Payments.Include(p => p.Student).FirstOrDefaultAsync(p => p.Id == id) ?? throw new KeyNotFoundException("Payment not found.");
        return MapPayment(p);
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetByStudentAsync(Guid studentId)
        => await _context.Payments.Where(p => p.StudentId == studentId).Include(p => p.Student).OrderByDescending(p => p.DueDate).Select(p => MapPayment(p)).ToListAsync();

    public async Task<IReadOnlyList<PaymentResponse>> GetAllAsync(Guid schoolId)
        => await _context.Payments.Where(p => p.SchoolId == schoolId).Include(p => p.Student).OrderByDescending(p => p.DueDate).Select(p => MapPayment(p)).ToListAsync();

    public async Task<PaymentResponse> CreateAsync(Guid schoolId, CreatePaymentRequest request)
    {
        var payment = new Payment { SchoolId = schoolId, StudentId = request.StudentId, Amount = request.Amount, DueDate = request.DueDate, Description = request.Description, Discount = request.Discount, DiscountReason = request.DiscountReason };
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(payment.Id);
    }

    public async Task<PaymentResponse> UpdateStatusAsync(Guid id, UpdatePaymentStatusRequest request)
    {
        var payment = await _context.Payments.FindAsync(id) ?? throw new KeyNotFoundException("Payment not found.");
        payment.Status = request.Status; payment.PaidDate = request.PaidDate; payment.TransactionReference = request.TransactionReference;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(payment.Id);
    }

    public async Task<RevenueStatsResponse> GetRevenueStatsAsync(Guid schoolId)
    {
        var payments = await _context.Payments.Where(p => p.SchoolId == schoolId).ToListAsync();
        var now = DateTime.UtcNow;
        return new RevenueStatsResponse(
            payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount),
            payments.Where(p => p.Status == PaymentStatus.Paid && p.PaidDate?.Month == now.Month && p.PaidDate?.Year == now.Year).Sum(p => p.Amount),
            payments.Count,
            payments.Count(p => p.Status == PaymentStatus.Paid),
            payments.Count(p => p.Status == PaymentStatus.Overdue),
            payments.Count(p => p.Status == PaymentStatus.Pending)
        );
    }

    public async Task<string> CreateCheckoutSessionAsync(Guid paymentId, string successUrl, string cancelUrl)
    {
        var payment = await _context.Payments.Include(p => p.Student).FirstOrDefaultAsync(p => p.Id == paymentId) 
            ?? throw new KeyNotFoundException("Payment not found.");

        Stripe.StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];

        var options = new Stripe.Checkout.SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
            {
                new Stripe.Checkout.SessionLineItemOptions
                {
                    PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(payment.Amount * 100), // Stripe uses cents
                        Currency = "eur",
                        ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Frais Scolaires - {payment.Student?.FirstName} {payment.Student?.LastName}",
                            Description = payment.Description ?? "Paiement mensuel",
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = successUrl + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "paymentId", paymentId.ToString() }
            }
        };

        var service = new Stripe.Checkout.SessionService();
        Stripe.Checkout.Session session = await service.CreateAsync(options);

        return session.Url;
    }

    private static PaymentResponse MapPayment(Payment p) => new(p.Id, p.StudentId, p.Student != null ? $"{p.Student.FirstName} {p.Student.LastName}".Trim() : "", p.Amount, p.DueDate, p.PaidDate, p.Status, p.Description, p.TransactionReference, p.Discount, p.DiscountReason, p.CreatedAt);
}

// ===== ProgressService =====
public class ProgressService : IProgressService
{
    private readonly AppDbContext _context;
    public ProgressService(AppDbContext context) => _context = context;

    public async Task<ProgressResponse> GetByIdAsync(Guid id)
    {
        var p = await _context.ProgressRecords.Include(p => p.Student).FirstOrDefaultAsync(p => p.Id == id) ?? throw new KeyNotFoundException("Progress not found.");
        return MapProgress(p);
    }

    public async Task<IReadOnlyList<ProgressResponse>> GetByStudentAsync(Guid studentId)
        => await _context.ProgressRecords.Where(p => p.StudentId == studentId).Include(p => p.Student)
            .OrderByDescending(p => p.RecordDate).Select(p => MapProgress(p)).ToListAsync();

    public async Task<ProgressResponse> CreateAsync(Guid schoolId, CreateProgressRequest request)
    {
        var progress = new Progress { SchoolId = schoolId, StudentId = request.StudentId, SurahName = request.SurahName, SurahNumber = request.SurahNumber, JuzNumber = request.JuzNumber, HizbNumber = request.HizbNumber, StartVerse = request.StartVerse, EndVerse = request.EndVerse, Status = request.Status, TeacherNotes = request.TeacherNotes, QualityScore = request.QualityScore };
        _context.ProgressRecords.Add(progress);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(progress.Id);
    }

    public async Task<ProgressResponse> UpdateAsync(Guid id, UpdateProgressRequest request)
    {
        var progress = await _context.ProgressRecords.FindAsync(id) ?? throw new KeyNotFoundException("Progress not found.");
        progress.Status = request.Status; progress.TeacherNotes = request.TeacherNotes; progress.QualityScore = request.QualityScore;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(progress.Id);
    }

    public async Task<StudentProgressSummary> GetStudentSummaryAsync(Guid studentId)
    {
        var student = await _context.Students.FindAsync(studentId) ?? throw new KeyNotFoundException("Student not found.");
        var records = await _context.ProgressRecords.Where(p => p.StudentId == studentId).ToListAsync();

        return new StudentProgressSummary(
            studentId, $"{student.FirstName} {student.LastName}".Trim(),
            records.Where(r => r.JuzNumber.HasValue).Select(r => r.JuzNumber!.Value).Distinct().Count(),
            records.Where(r => r.JuzNumber.HasValue && r.Status == ProgressStatus.Memorized).Select(r => r.JuzNumber!.Value).Distinct().Count(),
            records.Where(r => r.JuzNumber.HasValue && r.Status == ProgressStatus.InProgress).Select(r => r.JuzNumber!.Value).Distinct().Count(),
            records.Where(r => r.SurahNumber.HasValue).Select(r => r.SurahNumber!.Value).Distinct().Count(),
            records.Where(r => r.SurahNumber.HasValue && r.Status == ProgressStatus.Memorized).Select(r => r.SurahNumber!.Value).Distinct().Count(),
            records.Where(r => r.QualityScore.HasValue).Any() ? records.Where(r => r.QualityScore.HasValue).Average(r => r.QualityScore!.Value) : 0,
            records.OrderByDescending(r => r.RecordDate).FirstOrDefault()?.RecordDate
        );
    }

    public async Task<IReadOnlyList<ProgressResponse>> GetAllAsync(Guid schoolId)
        => await _context.ProgressRecords.Where(p => p.SchoolId == schoolId).Include(p => p.Student)
            .OrderByDescending(p => p.RecordDate).Select(p => MapProgress(p)).ToListAsync();

    public async Task DeleteAsync(Guid id)
    {
        var progress = await _context.ProgressRecords.FindAsync(id) ?? throw new KeyNotFoundException("Progress not found.");
        _context.ProgressRecords.Remove(progress);
        await _context.SaveChangesAsync();
    }

    private static ProgressResponse MapProgress(Progress p) => new(p.Id, p.StudentId, p.Student != null ? $"{p.Student.FirstName} {p.Student.LastName}".Trim() : "", p.SurahName, p.SurahNumber, p.JuzNumber, p.HizbNumber, p.StartVerse, p.EndVerse, p.Status, p.TeacherNotes, p.RecordDate, p.QualityScore, p.CreatedAt);
}

// ===== ScheduleService =====
public class ScheduleService : IScheduleService
{
    private readonly AppDbContext _context;
    public ScheduleService(AppDbContext context) => _context = context;

    public async Task<ScheduleResponse> GetByIdAsync(Guid id)
    {
        var s = await _context.Schedules.Include(s => s.Group).FirstOrDefaultAsync(s => s.Id == id) ?? throw new KeyNotFoundException("Schedule not found.");
        return MapSchedule(s);
    }

    public async Task<IReadOnlyList<ScheduleResponse>> GetByGroupAsync(Guid groupId)
        => await _context.Schedules.Where(s => s.GroupId == groupId).Include(s => s.Group).Select(s => MapSchedule(s)).ToListAsync();

    public async Task<IReadOnlyList<ScheduleResponse>> GetAllAsync(Guid schoolId)
        => await _context.Schedules.Where(s => s.SchoolId == schoolId).Include(s => s.Group).Select(s => MapSchedule(s)).ToListAsync();

    public async Task<ScheduleResponse> CreateAsync(Guid schoolId, CreateScheduleRequest request)
    {
        var schedule = new Schedule { SchoolId = schoolId, GroupId = request.GroupId, DayOfWeek = request.DayOfWeek, StartTime = request.StartTime, EndTime = request.EndTime, RoomName = request.RoomName, Notes = request.Notes };
        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(schedule.Id);
    }

    public async Task<ScheduleResponse> UpdateAsync(Guid id, UpdateScheduleRequest request)
    {
        var schedule = await _context.Schedules.FindAsync(id) ?? throw new KeyNotFoundException("Schedule not found.");
        schedule.GroupId = request.GroupId; schedule.DayOfWeek = request.DayOfWeek; schedule.StartTime = request.StartTime;
        schedule.EndTime = request.EndTime; schedule.RoomName = request.RoomName; schedule.Notes = request.Notes; schedule.IsActive = request.IsActive;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(schedule.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var s = await _context.Schedules.FindAsync(id) ?? throw new KeyNotFoundException("Schedule not found.");
        s.IsDeleted = true; await _context.SaveChangesAsync();
    }

    private static ScheduleResponse MapSchedule(Schedule s) => new(s.Id, s.GroupId, s.Group?.Name ?? "", s.DayOfWeek, s.StartTime, s.EndTime, s.RoomName, s.Notes, s.IsActive, s.CreatedAt);
}

// ===== CommunicationService =====
public class CommunicationService : ICommunicationService
{
    private readonly AppDbContext _context;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<QuranSchool.Infrastructure.Hubs.NotificationHub> _hubContext;

    public CommunicationService(AppDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<QuranSchool.Infrastructure.Hubs.NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<MessageResponse> SendMessageAsync(Guid schoolId, Guid senderId, SendMessageRequest request)
    {
        var msg = new Message { SchoolId = schoolId, SenderId = senderId, ReceiverId = request.ReceiverId, Subject = request.Subject, Body = request.Body };
        _context.Messages.Add(msg);
        await _context.SaveChangesAsync();
        
        // Notify receiver in real-time
        await CreateNotificationAsync(schoolId, request.ReceiverId, "Nouveau message", $"Vous avez reçu un nouveau message : {request.Subject}", "Message", msg.Id.ToString());
        
        var sender = await _context.Users.FindAsync(senderId);
        var receiver = await _context.Users.FindAsync(request.ReceiverId);
        return new MessageResponse(msg.Id, senderId, sender?.Email ?? "", request.ReceiverId, receiver?.Email ?? "", msg.Subject, msg.Body, msg.IsRead, msg.SentAt);
    }

    public async Task<IReadOnlyList<MessageResponse>> GetInboxAsync(Guid userId)
        => await _context.Messages.Where(m => m.ReceiverId == userId).Include(m => m.Sender).Include(m => m.Receiver)
            .OrderByDescending(m => m.SentAt).Select(m => new MessageResponse(m.Id, m.SenderId, m.Sender!.Email, m.ReceiverId, m.Receiver!.Email, m.Subject, m.Body, m.IsRead, m.SentAt)).ToListAsync();

    public async Task<IReadOnlyList<MessageResponse>> GetSentAsync(Guid userId)
        => await _context.Messages.Where(m => m.SenderId == userId).Include(m => m.Sender).Include(m => m.Receiver)
            .OrderByDescending(m => m.SentAt).Select(m => new MessageResponse(m.Id, m.SenderId, m.Sender!.Email, m.ReceiverId, m.Receiver!.Email, m.Subject, m.Body, m.IsRead, m.SentAt)).ToListAsync();

    public async Task MarkMessageAsReadAsync(Guid messageId)
    {
        var msg = await _context.Messages.FindAsync(messageId); if (msg != null) { msg.IsRead = true; await _context.SaveChangesAsync(); }
    }

    public async Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId)
        => await _context.Notifications.Where(n => n.UserId == userId).OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponse(n.Id, n.Title, n.Body, n.IsRead, n.Type, n.ReferenceId, n.CreatedAt)).ToListAsync();

    public async Task MarkNotificationAsReadAsync(Guid notificationId)
    {
        var n = await _context.Notifications.FindAsync(notificationId); if (n != null) { n.IsRead = true; await _context.SaveChangesAsync(); }
    }

    public async Task CreateNotificationAsync(Guid schoolId, Guid userId, string title, string body, string? type, string? referenceId)
    {
        var notification = new Notification { SchoolId = schoolId, UserId = userId, Title = title, Body = body, Type = type, ReferenceId = referenceId };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Broadcast via SignalR
        await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new {
            id = notification.Id,
            title = notification.Title,
            body = notification.Body,
            type = notification.Type,
            referenceId = notification.ReferenceId,
            createdAt = notification.CreatedAt
        });
    }
}

// ===== DashboardService =====
public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    public DashboardService(AppDbContext context) => _context = context;

    public async Task<AdminDashboardResponse> GetAdminDashboardAsync(Guid schoolId)
    {
        var students = await _context.Students.Where(s => s.SchoolId == schoolId).ToListAsync();
        var payments = await _context.Payments.Where(p => p.SchoolId == schoolId).ToListAsync();
        var attendances = await _context.Attendances.Where(a => a.SchoolId == schoolId).ToListAsync();
        var groups = await _context.Groups.Where(g => g.SchoolId == schoolId).Include(g => g.Students).ToListAsync();
        var teachers = await _context.Teachers.Where(t => t.SchoolId == schoolId).CountAsync();
        var exams = await _context.Exams.Where(e => e.SchoolId == schoolId).ToListAsync();
        var completedExams = exams.Where(e => e.FinalStatus == ExamStatus.Completed).ToList();

        var now = DateTime.UtcNow;
        var paidPayments = payments.Where(p => p.Status == PaymentStatus.Paid);
        var totalPresent = attendances.Count(a => a.Status == AttendanceStatus.Present);
        var totalAttendance = attendances.Count;

        return new AdminDashboardResponse(
            students.Count,
            students.Count(s => s.IsActive),
            teachers,
            groups.Count,
            paidPayments.Where(p => p.PaidDate?.Month == now.Month && p.PaidDate?.Year == now.Year).Sum(p => p.Amount),
            paidPayments.Sum(p => p.Amount),
            0, // Average progress — requires progress query
            completedExams.Count > 0 ? Math.Round((double)completedExams.Count(e => e.FinalScore >= 50) / completedExams.Count * 100, 1) : 0,
            totalAttendance > 0 ? Math.Round((double)totalPresent / totalAttendance * 100, 1) : 0,
            payments.Count(p => p.Status == PaymentStatus.Overdue),
            exams.Count(e => e.ExamDate.Month == now.Month && e.ExamDate.Year == now.Year),
            Enumerable.Range(0, 6).Select(i => {
                var month = now.AddMonths(-i);
                return new MonthlyRevenueItem(month.ToString("MMM yyyy"), paidPayments.Where(p => p.PaidDate?.Month == month.Month && p.PaidDate?.Year == month.Year).Sum(p => p.Amount));
            }).Reverse().ToList(),
            groups.Select(g => new GroupProgressItem(g.Name, 0, g.Students.Count)).ToList()
        );
    }

    public async Task<TeacherDashboardResponse> GetTeacherDashboardAsync(Guid teacherUserId, Guid schoolId)
    {
        var user = await _context.Users.FindAsync(teacherUserId);
        var teacherId = user?.LinkedProfileType == ProfileType.Teacher ? user.LinkedProfileId : teacherUserId;

        var groups = await _context.Groups.Where(g => g.TeacherId == teacherId).Include(g => g.Students).ToListAsync();
        var studentIds = groups.SelectMany(g => g.Students).Select(s => s.Id).ToList();
        
        var upcomingExams = await _context.Exams
            .Where(e => e.SchoolId == schoolId && e.ExamDate >= DateTime.UtcNow && groups.Select(g => g.Id).Contains(e.GroupId ?? Guid.Empty))
            .Include(e => e.Group)
            .OrderBy(e => e.ExamDate).Take(5).ToListAsync();
            
        var assignments = await _context.Homeworks
            .Where(h => h.TeacherId == teacherId)
            .Include(h => h.Assignments).ThenInclude(a => a.Student)
            .Include(h => h.Group)
            .OrderByDescending(h => h.DueDate)
            .ToListAsync();

        var assignmentsToGrade = assignments
            .SelectMany(h => h.Assignments.Where(a => a.Status == HomeworkStatus.Submitted))
            .Select(a => new PendingHomeworkItem(a.Id, a.HomeworkId, a.Homework?.Title ?? "", a.Homework?.DueDate ?? DateTime.MaxValue, "Submitted", a.Homework?.Group?.Name))
            .Take(5)
            .ToList();

        return new TeacherDashboardResponse(
            studentIds.Count,
            groups.Count,
            0,
            new List<StudentProgressItem>(),
            upcomingExams.Select(e => new UpcomingExamItem(e.Id, e.Title, e.ExamDate, e.Group?.Name ?? "")).ToList(),
            assignmentsToGrade
        );
    }

    public async Task<ParentDashboardResponse> GetParentDashboardAsync(Guid parentUserId, Guid schoolId)
    {
        var user = await _context.Users.FindAsync(parentUserId);
        var parentId = user?.LinkedProfileType == ProfileType.Parent ? user.LinkedProfileId : parentUserId;

        var parent = await _context.Parents.Include(p => p.Children).ThenInclude(c => c.Group).FirstOrDefaultAsync(p => p.Id == parentId);
        if (parent == null) return new ParentDashboardResponse(new());

        var childrenData = new List<ChildDashboardItem>();

        foreach (var child in parent.Children)
        {
            var summary = await GetStudentSummaryInternalAsync(child.Id);
            
            var upcomingExams = await _context.Exams
                .Where(e => e.GroupId == child.GroupId && e.ExamDate >= DateTime.UtcNow)
                .OrderBy(e => e.ExamDate).Take(3)
                .Select(e => new UpcomingExamItem(e.Id, e.Title, e.ExamDate, e.Group != null ? e.Group.Name : ""))
                .ToListAsync();

            var pendingHomeworks = await _context.HomeworkAssignments
                .Where(a => a.StudentId == child.Id && a.Status != HomeworkStatus.Graded && a.Status != HomeworkStatus.Submitted)
                .Include(a => a.Homework)
                .OrderBy(a => a.Homework!.DueDate)
                .Take(5)
                .Select(a => new PendingHomeworkItem(a.Id, a.HomeworkId, a.Homework!.Title, a.Homework.DueDate, a.Status.ToString(), null))
                .ToListAsync();

             var recentResults = await _context.Exams
                .Where(e => e.StudentId == child.Id && e.FinalStatus == ExamStatus.Completed)
                .OrderByDescending(e => e.ExamDate)
                .Take(5)
                .Select(e => new RecentResultItem(e.Title, e.Type.ToString(), (int)e.FinalScore, e.GlobalComment ?? "", e.ExamDate))
                .ToListAsync();

            var todayDate = DateTime.UtcNow.Date;
            var schedules = (await _context.Schedules
                .Where(s => s.GroupId == child.GroupId)
                .ToListAsync())
                .Select(s => new UpcomingClassItem("Quran Class", todayDate.Add(s.StartTime.ToTimeSpan()), todayDate.Add(s.EndTime.ToTimeSpan()), s.RoomName ?? ""))
                .ToList();

            var attendanceRate = await GetAttendanceRateInternalAsync(child.Id);

            childrenData.Add(new ChildDashboardItem(
                child.Id,
                $"{child.FirstName} {child.LastName}".Trim(),
                child.Group?.Name ?? "No Group",
                attendanceRate,
                summary,
                upcomingExams,
                pendingHomeworks,
                recentResults,
                schedules
            ));
        }

        return new ParentDashboardResponse(childrenData);
    }

    public async Task<StudentDashboardResponse> GetStudentDashboardAsync(Guid studentId, Guid schoolId)
    {
        var student = await _context.Students.Include(s => s.Group).FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new KeyNotFoundException("Student not found");

        var summary = await GetStudentSummaryInternalAsync(student.Id);
        var attendanceRate = await GetAttendanceRateInternalAsync(student.Id);

        var upcomingExams = await _context.Exams
            .Where(e => e.GroupId == student.GroupId && e.ExamDate >= DateTime.UtcNow)
            .OrderBy(e => e.ExamDate).Take(3)
            .Select(e => new UpcomingExamItem(e.Id, e.Title, e.ExamDate, e.Group != null ? e.Group.Name : ""))
            .ToListAsync();

        var homeworks = await _context.HomeworkAssignments
            .Where(a => a.StudentId == student.Id && a.Status != HomeworkStatus.Graded)
            .Include(a => a.Homework)
            .OrderBy(a => a.Homework!.DueDate)
            .Take(5)
            .Select(a => new PendingHomeworkItem(a.Id, a.HomeworkId, a.Homework!.Title, a.Homework.DueDate, a.Status.ToString(), null))
            .ToListAsync();

        var todayDateStudent = DateTime.UtcNow.Date;
        var schedules = (await _context.Schedules
            .Where(s => s.GroupId == student.GroupId)
            .ToListAsync())
            .Select(s => new UpcomingClassItem("Quran Class", todayDateStudent.Add(s.StartTime.ToTimeSpan()), todayDateStudent.Add(s.EndTime.ToTimeSpan()), s.RoomName ?? ""))
            .ToList();

        return new StudentDashboardResponse(
            $"{student.FirstName} {student.LastName}".Trim(),
            student.Group?.Name ?? "No Group",
            attendanceRate,
            0, // Points - to be implemented
            schedules,
            homeworks,
            upcomingExams,
            summary
        );
    }

    private async Task<StudentProgressSummaryItem> GetStudentSummaryInternalAsync(Guid studentId)
    {
        var records = await _context.ProgressRecords.Where(p => p.StudentId == studentId).ToListAsync();
        var lastRecord = records.OrderByDescending(r => r.RecordDate).FirstOrDefault();

        return new StudentProgressSummaryItem(
            records.Where(r => r.JuzNumber.HasValue && r.Status == ProgressStatus.Memorized).Select(r => r.JuzNumber!.Value).Distinct().Count(),
            records.Where(r => r.SurahNumber.HasValue && r.Status == ProgressStatus.Memorized).Select(r => r.SurahNumber!.Value).Distinct().Count(),
            lastRecord?.JuzNumber ?? 0,
            lastRecord?.SurahName ?? "None"
        );
    }

    private async Task<double> GetAttendanceRateInternalAsync(Guid studentId)
    {
        var total = await _context.Attendances.CountAsync(a => a.StudentId == studentId);
        if (total == 0) return 100;
        var present = await _context.Attendances.CountAsync(a => a.StudentId == studentId && a.Status == AttendanceStatus.Present);
        return Math.Round((double)present / total * 100, 1);
    }
}

// ===== ParentService =====
public class ParentService : IParentService
{
    private readonly AppDbContext _context;
    public ParentService(AppDbContext context) => _context = context;

    public async Task<IReadOnlyList<ParentResponse>> GetAllAsync(Guid schoolId)
        => await _context.Parents.Where(p => p.SchoolId == schoolId).Include(p => p.Children)
            .Select(p => new ParentResponse(p.Id, $"{p.FirstName} {p.LastName}".Trim(), p.Phone, p.Address, p.Occupation, p.Children.Count, p.CreatedAt)).ToListAsync();

    public async Task<ParentResponse> GetByIdAsync(Guid id)
    {
        var p = await _context.Parents.Include(p => p.Children).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Parent not found.");
        return new ParentResponse(p.Id, $"{p.FirstName} {p.LastName}".Trim(), p.Phone, p.Address, p.Occupation, p.Children.Count, p.CreatedAt);
    }

    public async Task<ParentResponse> CreateAsync(Guid schoolId, CreateParentRequest request)
    {
        var parent = new Parent
        {
            SchoolId = schoolId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            Occupation = request.Occupation
        };
        _context.Parents.Add(parent);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(parent.Id);
    }

    public async Task<ParentResponse> UpdateAsync(Guid id, UpdateParentRequest request)
    {
        var parent = await _context.Parents.FindAsync(id) ?? throw new KeyNotFoundException("Parent not found.");
        parent.FirstName = request.FirstName;
        parent.LastName = request.LastName;
        parent.Email = request.Email;
        parent.Phone = request.Phone;
        parent.Address = request.Address;
        parent.Occupation = request.Occupation;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(parent.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var parent = await _context.Parents.FindAsync(id) ?? throw new KeyNotFoundException("Parent not found.");
        parent.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}

// ===== LevelService =====
public class LevelService : ILevelService
{
    private readonly AppDbContext _context;
    public LevelService(AppDbContext context) => _context = context;

    public async Task<LevelResponse> GetByIdAsync(Guid id)
    {
        var l = await _context.Levels.Include(l => l.Groups).FirstOrDefaultAsync(l => l.Id == id)
            ?? throw new KeyNotFoundException("Level not found.");
        return MapLevel(l);
    }

    public async Task<IReadOnlyList<LevelResponse>> GetAllAsync(Guid schoolId)
        => await _context.Levels.Where(l => l.SchoolId == schoolId).Include(l => l.Groups)
            .OrderBy(l => l.Order)
            .Select(l => MapLevel(l)).ToListAsync();

    public async Task<LevelResponse> CreateAsync(Guid schoolId, CreateLevelRequest request)
    {
        var level = new Level { SchoolId = schoolId, Name = request.Name, Description = request.Description, Order = request.Order, StartSurah = request.StartSurah, EndSurah = request.EndSurah };
        _context.Levels.Add(level);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(level.Id);
    }

    public async Task<LevelResponse> UpdateAsync(Guid id, UpdateLevelRequest request)
    {
        var level = await _context.Levels.FindAsync(id) ?? throw new KeyNotFoundException("Level not found.");
        level.Name = request.Name; level.Description = request.Description; level.Order = request.Order; level.IsActive = request.IsActive; level.StartSurah = request.StartSurah; level.EndSurah = request.EndSurah;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(level.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var level = await _context.Levels.FindAsync(id) ?? throw new KeyNotFoundException("Level not found.");
        level.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    private static LevelResponse MapLevel(Level l) => new(
        l.Id, l.Name, l.Description, l.Order, l.IsActive, l.StartSurah, l.EndSurah, l.Groups.Count, l.CreatedAt
    );
}
// ===== ReportService =====
public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    public ReportService(AppDbContext context) => _context = context;

    public async Task<byte[]> GenerateStudentProgressPdfAsync(Guid studentId)
    {
        var student = await _context.Students.Include(s => s.Group).FirstOrDefaultAsync(s => s.Id == studentId) 
            ?? throw new KeyNotFoundException("Student not found.");
        
        var records = await _context.ProgressRecords.Where(p => p.StudentId == studentId).OrderByDescending(p => p.RecordDate).ToListAsync();

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(QuestPDF.Helpers.PageSizes.A4);
                page.Margin(1.5f, QuestPDF.Infrastructure.Unit.Centimetre);
                page.PageColor(QuestPDF.Helpers.Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Helvetica"));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("RAPPORT DE PROGRESSION").FontSize(24).ExtraBold().FontColor(QuestPDF.Helpers.Colors.Teal.Medium);
                        col.Item().Text("QURAN SCHOOL SAAS").FontSize(10).SemiBold().FontColor(QuestPDF.Helpers.Colors.Grey.Medium);
                        col.Item().PaddingTop(5).Text($"{student.FirstName} {student.LastName}").FontSize(14).Medium();
                        col.Item().Text($"Groupe : {student.Group?.Name ?? "N/A"}").FontSize(10).FontColor(QuestPDF.Helpers.Colors.Grey.Darken2);
                    });

                    row.ConstantItem(80).Height(80).Placeholder(); // School Logo
                });

                page.Content().PaddingVertical(1, QuestPDF.Infrastructure.Unit.Centimetre).Column(x =>
                {
                    x.Spacing(15);

                    // Stats Summary Box
                    x.Item().Background(QuestPDF.Helpers.Colors.Grey.Lighten4).Padding(15).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Juz Complétés").FontSize(9).FontColor(QuestPDF.Helpers.Colors.Grey.Medium).AlignCenter();
                            c.Item().Text(records.Where(r => r.Status == ProgressStatus.Memorized).Select(r => r.JuzNumber).Distinct().Count().ToString()).FontSize(18).ExtraBold().AlignCenter();
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Sourates Apprises").FontSize(9).FontColor(QuestPDF.Helpers.Colors.Grey.Medium).AlignCenter();
                            c.Item().Text(records.Where(r => r.Status == ProgressStatus.Memorized).Select(r => r.SurahNumber).Distinct().Count().ToString()).FontSize(18).ExtraBold().AlignCenter();
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Note Moyenne").FontSize(9).FontColor(QuestPDF.Helpers.Colors.Grey.Medium).AlignCenter();
                            var avg = records.Any(r => r.QualityScore.HasValue) ? records.Average(r => r.QualityScore!.Value) : 0;
                            c.Item().Text($"{avg:F1}/10").FontSize(18).ExtraBold().FontColor(avg >= 8 ? QuestPDF.Helpers.Colors.Green.Medium : QuestPDF.Helpers.Colors.Orange.Medium).AlignCenter();
                        });
                    });

                    x.Item().Text("HISTORIQUE RÉCENT").FontSize(12).SemiBold().FontColor(QuestPDF.Helpers.Colors.Teal.Darken2);

                    x.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            columns.RelativeColumn();
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(60);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Date");
                            header.Cell().Element(CellStyle).Text("Contenu (Sourate / Versets)");
                            header.Cell().Element(CellStyle).Text("Statut");
                            header.Cell().Element(CellStyle).Text("Note");

                            static QuestPDF.Infrastructure.IContainer CellStyle(QuestPDF.Infrastructure.IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold().FontSize(10)).PaddingVertical(8).BorderBottom(1.5f).BorderColor(QuestPDF.Helpers.Colors.Teal.Medium);
                            }
                        });

                        foreach (var record in records.Take(15))
                        {
                            table.Cell().Element(ContentStyle).Text(record.RecordDate.ToString("dd/MM/yyyy"));
                            table.Cell().Element(ContentStyle).Text($"{record.SurahName} (v. {record.StartVerse}-{record.EndVerse})");
                            table.Cell().Element(ContentStyle).Text(record.Status.ToString()).FontSize(9);
                            table.Cell().Element(ContentStyle).AlignCenter().Text(record.QualityScore?.ToString() ?? "-");

                            static QuestPDF.Infrastructure.IContainer ContentStyle(QuestPDF.Infrastructure.IContainer container)
                            {
                                return container.PaddingVertical(6).BorderBottom(1).BorderColor(QuestPDF.Helpers.Colors.Grey.Lighten3);
                            }
                        }
                    });
                });

                page.Footer().Column(f =>
                {
                    f.Item().PaddingTop(10).BorderTop(1).BorderColor(QuestPDF.Helpers.Colors.Grey.Lighten2).Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span("Généré le ").FontSize(8);
                            t.Span(DateTime.Now.ToString("dd/MM/yyyy HH:mm")).FontSize(8);
                        });
                        row.RelativeItem().AlignCenter().Text(x =>
                        {
                            x.Span("Page ");
                            x.CurrentPageNumber();
                        });
                        row.RelativeItem().AlignRight().Text("Quran School SaaS - Excellence en Hifdh").FontSize(8).Italic();
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
