using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Student;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _context;

    public StudentService(AppDbContext context) => _context = context;

    public async Task<StudentResponse> GetByIdAsync(Guid id)
    {
        var s = await _context.Students
            .Include(s => s.Group)
            .Include(s => s.Parent)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException($"Student {id} not found.");

        return MapToResponse(s);
    }

    public async Task<IReadOnlyList<StudentListResponse>> GetAllAsync(Guid schoolId)
    {
        return await _context.Students
            .Where(s => s.SchoolId == schoolId)
            .Include(s => s.Group)
            .OrderBy(s => s.LastName)
            .Select(s => new StudentListResponse(s.Id, s.FullName, s.GroupId, s.Group != null ? s.Group.Name : null, s.IsActive, s.EnrollmentDate, s.CurrentLevel, s.TotalXP, s.CurrentStreak, s.Badges))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<StudentListResponse>> GetByGroupAsync(Guid groupId)
    {
        return await _context.Students
            .Where(s => s.GroupId == groupId)
            .OrderBy(s => s.LastName)
            .Select(s => new StudentListResponse(s.Id, s.FullName, s.GroupId, s.Group != null ? s.Group.Name : null, s.IsActive, s.EnrollmentDate, s.CurrentLevel, s.TotalXP, s.CurrentStreak, s.Badges))
            .ToListAsync();
    }

    public async Task<StudentResponse> CreateAsync(Guid schoolId, CreateStudentRequest request)
    {
        var student = new Student
        {
            SchoolId = schoolId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Phone = request.Phone,
            Address = request.Address,
            GroupId = request.GroupId,
            ParentId = request.ParentId,
            CurrentLevel = request.CurrentLevel
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(student.Id);
    }

    public async Task<StudentResponse> UpdateAsync(Guid id, UpdateStudentRequest request)
    {
        var student = await _context.Students.FindAsync(id)
            ?? throw new KeyNotFoundException($"Student {id} not found.");

        student.FirstName = request.FirstName;
        student.LastName = request.LastName;
        student.DateOfBirth = request.DateOfBirth;
        student.Phone = request.Phone;
        student.Address = request.Address;
        student.GroupId = request.GroupId;
        student.ParentId = request.ParentId;
        student.IsActive = request.IsActive;
        student.CurrentLevel = request.CurrentLevel;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(student.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var student = await _context.Students.FindAsync(id)
            ?? throw new KeyNotFoundException($"Student {id} not found.");
        student.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    private static StudentResponse MapToResponse(Student s) => new(
        s.Id, s.FirstName, s.LastName, $"{s.FirstName} {s.LastName}".Trim(), s.DateOfBirth,
        s.Phone, s.Address, s.PhotoUrl, s.IsActive, s.EnrollmentDate,
        s.GroupId, s.Group?.Name, s.ParentId,
        s.Parent != null ? $"{s.Parent.FirstName} {s.Parent.LastName}".Trim() : null,
        s.CurrentLevel,
        s.TotalXP,
        s.CurrentStreak,
        s.LongestStreak,
        s.Badges,
        s.CreatedAt
    );
}
