using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Finance;

public class FinancialTransactionDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public FinancialTransactionType Type { get; set; }
    public TransactionPaymentMethod PaymentMethod { get; set; }
    public string? Reference { get; set; }
    public string? Note { get; set; }
    public string? AttachmentUrl { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public Guid? DonorId { get; set; }
    public string? DonorName { get; set; }
}

public class CreateFinancialTransactionDto
{
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public FinancialTransactionType Type { get; set; }
    public TransactionPaymentMethod PaymentMethod { get; set; }
    public string? Reference { get; set; }
    public string? Note { get; set; }
    public string? AttachmentUrl { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? DonorId { get; set; }
}

public class TransactionCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public FinancialTransactionType Type { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
}

public class DonorProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsRecurring { get; set; }
    public decimal TotalDonated { get; set; }
}

public class FinancialProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalIncome { get; set; }
    public bool IsActive { get; set; }
}

public class FinancialSummaryDto
{
    public decimal Balance { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpense { get; set; }
    public decimal TotalDonations { get; set; }
}
