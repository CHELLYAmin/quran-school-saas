using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Schedule;

public record CreateScheduleRequest(
    Guid GroupId,
    DayOfWeekEnum DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? RoomName,
    string? Notes
);

public record UpdateScheduleRequest(
    Guid GroupId,
    DayOfWeekEnum DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? RoomName,
    string? Notes,
    bool IsActive
);

public record ScheduleResponse(
    Guid Id,
    Guid GroupId,
    string GroupName,
    DayOfWeekEnum DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? RoomName,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt
);
