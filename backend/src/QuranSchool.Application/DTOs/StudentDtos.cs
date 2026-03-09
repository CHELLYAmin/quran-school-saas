namespace QuranSchool.Application.DTOs.Student;

public record CreateStudentRequest(
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string? Phone,
    string? Address,
    Guid? GroupId,
    Guid? ParentId,
    string? CurrentLevel = null
);

public record UpdateStudentRequest(
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string? Phone,
    string? Address,
    Guid? GroupId,
    Guid? ParentId,
    bool IsActive,
    string? CurrentLevel = null
);

public record StudentResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    DateTime DateOfBirth,
    string? Phone,
    string? Address,
    string? PhotoUrl,
    bool IsActive,
    DateTime EnrollmentDate,
    Guid? GroupId,
    string? GroupName,
    Guid? ParentId,
    string? ParentName,
    string? CurrentLevel,
    int TotalXP,
    int CurrentStreak,
    int LongestStreak,
    List<string> Badges,
    DateTime CreatedAt
);

public record StudentListResponse(
    Guid Id,
    string FullName,
    Guid? GroupId,
    string? GroupName,
    bool IsActive,
    DateTime EnrollmentDate,
    string? CurrentLevel,
    int TotalXP,
    int CurrentStreak,
    List<string> Badges
);
