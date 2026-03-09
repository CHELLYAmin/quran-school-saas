using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Homework;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class HomeworkService : IHomeworkService
{
    private readonly AppDbContext _context;

    public HomeworkService(AppDbContext context)
    {
        _context = context;
    }

    private async Task<Guid> ResolveTeacherIdAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null && user.LinkedProfileType == ProfileType.Teacher)
            return user.LinkedProfileId;
        return userId;
    }

    private async Task<Guid> ResolveStudentIdAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null && user.LinkedProfileType == ProfileType.Student)
            return user.LinkedProfileId;
        return userId;
    }

    public async Task<HomeworkResponse> GetByIdAsync(Guid id)
    {
        var h = await _context.Homeworks
            .Include(h => h.Teacher)
            .Include(h => h.Group)
            .Include(h => h.Assignments)
            .FirstOrDefaultAsync(h => h.Id == id)
            ?? throw new KeyNotFoundException("Homework not found");

        return MapHomework(h);
    }

    public async Task<HomeworkAssignmentResponse> GetAssignmentByIdAsync(Guid id)
    {
        var a = await _context.HomeworkAssignments
            .Include(a => a.Homework)
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new KeyNotFoundException("Assignment not found");
        return MapAssignment(a);
    }

    public async Task<IReadOnlyList<HomeworkResponse>> GetByTeacherAsync(Guid teacherUserId)
    {
        var teacherId = await ResolveTeacherIdAsync(teacherUserId);
        return await _context.Homeworks
            .Where(h => h.TeacherId == teacherId)
            .Include(h => h.Teacher)
            .Include(h => h.Group)
            .Include(h => h.Assignments)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => MapHomework(h))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<HomeworkResponse>> GetByGroupAsync(Guid groupId)
    {
        return await _context.Homeworks
            .Where(h => h.GroupId == groupId)
            .Include(h => h.Teacher)
            .Include(h => h.Group)
            .Include(h => h.Assignments)
            .OrderByDescending(h => h.DueDate)
            .Select(h => MapHomework(h))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<HomeworkAssignmentResponse>> GetStudentAssignmentsAsync(Guid studentUserId)
    {
        var studentId = await ResolveStudentIdAsync(studentUserId);
        return await _context.HomeworkAssignments
            .Where(a => a.StudentId == studentId)
            .Include(a => a.Homework)
            .Include(a => a.Student)
            .OrderByDescending(a => a.Homework!.DueDate)
            .Select(a => MapAssignment(a))
            .ToListAsync();
    }

    public async Task<HomeworkResponse> CreateAsync(Guid schoolId, Guid teacherUserId, CreateHomeworkRequest request)
    {
        var teacherId = await ResolveTeacherIdAsync(teacherUserId);
        var homework = new Homework
        {
            SchoolId = schoolId,
            TeacherId = teacherId,
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            DueDate = request.DueDate,
            GroupId = request.GroupId,
            AttachmentUrl = request.AttachmentUrl
        };

        _context.Homeworks.Add(homework);
        await _context.SaveChangesAsync();

        // Assign to students
        var studentIds = new List<Guid>();
        if (request.StudentIds != null && request.StudentIds.Any())
        {
            studentIds.AddRange(request.StudentIds);
        }
        else if (request.GroupId.HasValue)
        {
            studentIds = await _context.Students
                .Where(s => s.GroupId == request.GroupId.Value && s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();
        }

        if (studentIds.Any())
        {
            var assignments = studentIds.Distinct().Select(sid => new HomeworkAssignment
            {
                SchoolId = schoolId,
                HomeworkId = homework.Id,
                StudentId = sid,
                Status = HomeworkStatus.Pending
            });
            _context.HomeworkAssignments.AddRange(assignments);
            await _context.SaveChangesAsync();
        }

        return await GetByIdAsync(homework.Id);
    }

    public async Task<HomeworkResponse> UpdateAsync(Guid id, UpdateHomeworkRequest request)
    {
        var homework = await _context.Homeworks.FindAsync(id)
            ?? throw new KeyNotFoundException("Homework not found");

        homework.Title = request.Title;
        homework.Description = request.Description;
        homework.Type = request.Type;
        homework.DueDate = request.DueDate;
        homework.AttachmentUrl = request.AttachmentUrl;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var homework = await _context.Homeworks.FindAsync(id)
            ?? throw new KeyNotFoundException("Homework not found");

        homework.IsDeleted = true;
        // Also delete assignments? Or soft delete them via Cascade?
        // Soft delete logic usually handled by query filter, but explicitly marking can be safer if cascade isn't set up
        var assignments = await _context.HomeworkAssignments.Where(a => a.HomeworkId == id).ToListAsync();
        foreach (var a in assignments) a.IsDeleted = true;

        await _context.SaveChangesAsync();
    }

    public async Task SubmitAssignmentAsync(Guid assignmentId, SubmitHomeworkRequest request)
    {
        var assignment = await _context.HomeworkAssignments.FindAsync(assignmentId)
            ?? throw new KeyNotFoundException("Assignment not found");

        assignment.Status = HomeworkStatus.Submitted;
        assignment.SubmittedAt = DateTime.UtcNow;
        assignment.StudentNotes = request.Notes;

        await _context.SaveChangesAsync();
    }

    public async Task GradeAssignmentAsync(Guid assignmentId, GradeHomeworkRequest request)
    {
        var assignment = await _context.HomeworkAssignments.FindAsync(assignmentId)
            ?? throw new KeyNotFoundException("Assignment not found");

        assignment.Status = HomeworkStatus.Graded;
        assignment.Grade = request.Grade;
        assignment.TeacherFeedback = request.Feedback;

        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<HomeworkAssignmentResponse>> GetHomeworkAssignmentsAsync(Guid homeworkId)
    {
        return await _context.HomeworkAssignments
            .Where(a => a.HomeworkId == homeworkId)
            .Include(a => a.Student)
            .Include(a => a.Homework)
            .Select(a => MapAssignment(a))
            .ToListAsync();
    }

    private static HomeworkResponse MapHomework(Homework h) => new(
        h.Id,
        h.Title,
        h.Description,
        h.Type,
        h.DueDate,
        h.AttachmentUrl,
        h.GroupId,
        h.Group?.Name,
        h.TeacherId,
        $"{h.Teacher?.FirstName} {h.Teacher?.LastName}".Trim(),
        h.Assignments.Count,
        h.Assignments.Count(a => a.Status == HomeworkStatus.Submitted || a.Status == HomeworkStatus.Graded),
        h.CreatedAt
    );

    private static HomeworkAssignmentResponse MapAssignment(HomeworkAssignment a) => new(
        a.Id,
        a.HomeworkId,
        a.Homework?.Title ?? "",
        a.StudentId,
        $"{a.Student?.FirstName} {a.Student?.LastName}".Trim(),
        a.Status,
        a.SubmittedAt,
        a.StudentNotes,
        a.TeacherFeedback,
        a.Grade,
        a.Homework?.DueDate
    );
}
