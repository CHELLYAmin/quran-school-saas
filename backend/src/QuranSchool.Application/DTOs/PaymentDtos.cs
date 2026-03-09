using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Payment;

public record CreatePaymentRequest(
    Guid StudentId,
    decimal Amount,
    DateTime DueDate,
    string? Description,
    decimal? Discount,
    string? DiscountReason
);

public record UpdatePaymentStatusRequest(
    PaymentStatus Status,
    DateTime? PaidDate,
    string? TransactionReference
);

public record PaymentResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    decimal Amount,
    DateTime DueDate,
    DateTime? PaidDate,
    PaymentStatus Status,
    string? Description,
    string? TransactionReference,
    decimal? Discount,
    string? DiscountReason,
    DateTime CreatedAt
);

public record RevenueStatsResponse(
    decimal TotalRevenue,
    decimal MonthlyRevenue,
    int TotalPayments,
    int PaidCount,
    int OverdueCount,
    int PendingCount
);
