using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Homework;

public record HomeworkResponse(
    Guid Id,
    string Title,
    string Description,
    HomeworkType Type,
    DateTime DueDate,
    string? AttachmentUrl,
    Guid? GroupId,
    string? GroupName,
    Guid TeacherId,
    string TeacherName,
    int AssignmentsCount,
    int SubmittedCount,
    DateTime CreatedAt
);

public record HomeworkAssignmentResponse(
    Guid Id,
    Guid HomeworkId,
    string HomeworkTitle,
    Guid StudentId,
    string StudentName,
    HomeworkStatus Status,
    DateTime? SubmittedAt,
    string? StudentNotes,
    string? TeacherFeedback,
    int? Grade,
    DateTime? DueDate
);

public record CreateHomeworkRequest(
    string Title,
    string Description,
    HomeworkType Type,
    DateTime DueDate,
    Guid? GroupId,
    List<Guid>? StudentIds,
    string? AttachmentUrl
);

public record UpdateHomeworkRequest(
    string Title,
    string Description,
    HomeworkType Type,
    DateTime DueDate,
    string? AttachmentUrl
);

public record SubmitHomeworkRequest(
    string? Notes
);

public record GradeHomeworkRequest(
    Guid AssignmentId,
    string? Feedback,
    int Grade
);
