using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuranSchool.Infrastructure.Services
{
    using global::QuranSchool.Application.Interfaces;
    using global::QuranSchool.Domain.Interfaces;
    using global::QuranSchool.Domain.Entities;
    using global::QuranSchool.Domain.Enums;
    using global::QuranSchool.Infrastructure.Data;

    public class FinancialService : IFinancialService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditService _auditService;

        public FinancialService(AppDbContext context, ICurrentUserService currentUserService, IAuditService auditService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _auditService = auditService;
        }

        public async Task<global::QuranSchool.Application.DTOs.Finance.FinancialSummaryDto> GetSummaryAsync()
        {
            var schoolId = _currentUserService.SchoolId;
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var transactions = await _context.FinancialTransactions
                .Where(t => t.SchoolId == schoolId)
                .ToListAsync();

            var balance = transactions.Sum(t => t.Type == FinancialTransactionType.Income ? t.Amount : -t.Amount);
            
            var monthlyIncome = transactions
                .Where(t => t.Type == FinancialTransactionType.Income && t.Date >= startOfMonth)
                .Sum(t => t.Amount);

            var monthlyExpense = transactions
                .Where(t => t.Type == FinancialTransactionType.Expense && t.Date >= startOfMonth)
                .Sum(t => t.Amount);

            var totalDonations = transactions
                .Where(t => t.DonorId != null)
                .Sum(t => t.Amount);

            return new global::QuranSchool.Application.DTOs.Finance.FinancialSummaryDto
            {
                Balance = balance,
                MonthlyIncome = monthlyIncome,
                MonthlyExpense = monthlyExpense,
                TotalDonations = totalDonations
            };
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Finance.FinancialTransactionDto>> GetTransactionsAsync(DateTime? from = null, DateTime? to = null)
        {
            var schoolId = _currentUserService.SchoolId;
            var query = _context.FinancialTransactions
                .Include(t => t.Category)
                .Include(t => t.Project)
                .Include(t => t.Donor)
                .Where(t => t.SchoolId == schoolId);

            if (from.HasValue) query = query.Where(t => t.Date >= from.Value);
            if (to.HasValue) query = query.Where(t => t.Date <= to.Value);

            return await query
                .OrderByDescending(t => t.Date)
                .Select(t => new global::QuranSchool.Application.DTOs.Finance.FinancialTransactionDto
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Date = t.Date,
                    Type = t.Type,
                    PaymentMethod = t.PaymentMethod,
                    Reference = t.Reference,
                    Note = t.Note,
                    AttachmentUrl = t.AttachmentUrl,
                    CategoryId = t.CategoryId,
                    CategoryName = t.Category.Name,
                    ProjectId = t.ProjectId,
                    ProjectName = t.Project != null ? t.Project.Name : null,
                    DonorId = t.DonorId,
                    DonorName = t.Donor != null ? t.Donor.FullName : null
                })
                .ToListAsync();
        }

        public async Task<global::QuranSchool.Application.DTOs.Finance.FinancialTransactionDto> CreateTransactionAsync(global::QuranSchool.Application.DTOs.Finance.CreateFinancialTransactionDto dto)
        {
            var schoolId = _currentUserService.SchoolId;
            var transaction = new FinancialTransaction
            {
                SchoolId = (Guid)schoolId!,
                Amount = dto.Amount,
                Date = dto.Date,
                Type = dto.Type,
                PaymentMethod = dto.PaymentMethod,
                Reference = dto.Reference,
                Note = dto.Note,
                AttachmentUrl = dto.AttachmentUrl,
                CategoryId = dto.CategoryId,
                ProjectId = dto.ProjectId,
                DonorId = dto.DonorId
            };

            _context.FinancialTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync("Finance", "CreateTransaction", $"Created {dto.Type} of {dto.Amount} {dto.Reference}");

            return (await GetTransactionsAsync()).First(t => t.Id == transaction.Id);
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Finance.TransactionCategoryDto>> GetCategoriesAsync()
        {
            var schoolId = _currentUserService.SchoolId;
            return await _context.TransactionCategories
                .Where(c => c.SchoolId == schoolId)
                .Select(c => new global::QuranSchool.Application.DTOs.Finance.TransactionCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Type = c.Type,
                    Icon = c.Icon,
                    Description = c.Description
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Finance.DonorProfileDto>> GetDonorsAsync()
        {
            var schoolId = _currentUserService.SchoolId;
            return await _context.DonorProfiles
                .Where(d => d.SchoolId == schoolId)
                .Select(d => new global::QuranSchool.Application.DTOs.Finance.DonorProfileDto
                {
                    Id = d.Id,
                    FullName = d.FullName,
                    Email = d.Email,
                    Phone = d.Phone,
                    Address = d.Address,
                    IsRecurring = d.IsRecurring,
                    TotalDonated = d.Donations.Sum(don => don.Amount)
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Finance.FinancialProjectDto>> GetProjectsAsync()
        {
            var schoolId = _currentUserService.SchoolId;
            return await _context.FinancialProjects
                .Where(p => p.SchoolId == schoolId)
                .Select(p => new global::QuranSchool.Application.DTOs.Finance.FinancialProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Budget = p.Budget,
                    IsActive = p.IsActive,
                    TotalSpent = p.Transactions.Where(t => t.Type == FinancialTransactionType.Expense).Sum(t => t.Amount),
                    TotalIncome = p.Transactions.Where(t => t.Type == FinancialTransactionType.Income).Sum(t => t.Amount)
                })
                .ToListAsync();
        }
    }
}
