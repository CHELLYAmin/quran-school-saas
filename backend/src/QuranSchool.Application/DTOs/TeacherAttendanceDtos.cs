using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Attendance;

public record MarkTeacherAttendanceRequest(
    Guid TeacherId,
    DateTime Date,
    AttendanceStatus Status,
    string? Notes
);

public record BulkTeacherAttendanceRequest(
    DateTime Date,
    List<MarkTeacherAttendanceRequest> Records
);

public record TeacherAttendanceResponse(
    Guid Id,
    Guid TeacherId,
    string TeacherName,
    DateTime Date,
    AttendanceStatus Status,
    string? Notes,
    TimeOnly? CheckInTime
);
