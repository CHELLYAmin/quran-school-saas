namespace QuranSchool.Application.DTOs.Communication;

public record SendMessageRequest(
    Guid ReceiverId,
    string Subject,
    string Body
);

public record MessageResponse(
    Guid Id,
    Guid SenderId,
    string SenderName,
    Guid ReceiverId,
    string ReceiverName,
    string Subject,
    string Body,
    bool IsRead,
    DateTime SentAt
);

public record NotificationResponse(
    Guid Id,
    string Title,
    string Body,
    bool IsRead,
    string? Type,
    string? ReferenceId,
    DateTime CreatedAt
);
