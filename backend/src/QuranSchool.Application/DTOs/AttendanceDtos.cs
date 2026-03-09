using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Attendance;

public record MarkAttendanceRequest(
    Guid StudentId,
    DateTime Date,
    AttendanceStatus Status,
    string? Notes
);

public record BulkAttendanceRequest(
    DateTime Date,
    List<MarkAttendanceRequest> Records
);

public record AttendanceResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    DateTime Date,
    AttendanceStatus Status,
    string? Notes,
    TimeOnly? CheckInTime
);
