using QuranSchool.Application.DTOs.Finance;
using QuranSchool.Application.DTOs.Staff;

namespace QuranSchool.Application.Interfaces;

public interface IFinancialService
{
    Task<FinancialSummaryDto> GetSummaryAsync();
    Task<IEnumerable<FinancialTransactionDto>> GetTransactionsAsync(DateTime? from = null, DateTime? to = null);
    Task<FinancialTransactionDto> CreateTransactionAsync(CreateFinancialTransactionDto dto);
    Task<IEnumerable<TransactionCategoryDto>> GetCategoriesAsync();
    Task<IEnumerable<DonorProfileDto>> GetDonorsAsync();
    Task<IEnumerable<FinancialProjectDto>> GetProjectsAsync();
}

public interface IStaffService
{
    Task<IEnumerable<StaffMemberDto>> GetStaffMembersAsync();
    Task<StaffContractDto?> GetContractAsync(Guid userId);
    Task<IEnumerable<StaffAbsenceDto>> GetAbsencesAsync(bool? validated = null);
    Task<StaffAbsenceDto> RequestAbsenceAsync(Guid userId, CreateStaffAbsenceDto dto);
    Task ValidateAbsenceAsync(Guid absenceId);
}
