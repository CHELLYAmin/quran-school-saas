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

    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAuditService _auditService;

        public StaffService(AppDbContext context, ICurrentUserService currentUserService, IAuditService auditService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _auditService = auditService;
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Staff.StaffMemberDto>> GetStaffMembersAsync()
        {
            var schoolId = _currentUserService.SchoolId;
            return await _context.Users
                .Where(u => u.SchoolId == schoolId)
                .Select(u => new global::QuranSchool.Application.DTOs.Staff.StaffMemberDto
                {
                    UserId = u.Id,
                    FullName = $"{u.FirstName} {u.LastName}",
                    Email = u.Email,
                    Status = _context.StaffContracts
                        .Where(c => c.UserId == u.Id && c.Status == StaffContractStatus.Active)
                        .Any() ? StaffContractStatus.Active : StaffContractStatus.Terminated
                })
                .ToListAsync();
        }

        public async Task<global::QuranSchool.Application.DTOs.Staff.StaffContractDto?> GetContractAsync(Guid userId)
        {
            var contract = await _context.StaffContracts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == StaffContractStatus.Active);

            if (contract == null) return null;

            return new global::QuranSchool.Application.DTOs.Staff.StaffContractDto
            {
                Id = contract.Id,
                UserId = contract.UserId,
                Type = contract.Type,
                Status = contract.Status,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                Salary = contract.Salary
            };
        }

        public async Task<IEnumerable<global::QuranSchool.Application.DTOs.Staff.StaffAbsenceDto>> GetAbsencesAsync(bool? validated = null)
        {
            var schoolId = _currentUserService.SchoolId;
            var query = _context.StaffAbsences
                .Include(a => a.User)
                .Where(a => a.SchoolId == schoolId);

            if (validated.HasValue)
            {
                query = query.Where(a => a.IsValidated == validated.Value);
            }

            return await query
                .OrderByDescending(a => a.StartDate)
                .Select(a => new global::QuranSchool.Application.DTOs.Staff.StaffAbsenceDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    StaffName = $"{a.User.FirstName} {a.User.LastName}",
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Type = a.Type,
                    Reason = a.Reason,
                    IsValidated = a.IsValidated
                })
                .ToListAsync();
        }

        public async Task<global::QuranSchool.Application.DTOs.Staff.StaffAbsenceDto> RequestAbsenceAsync(Guid userId, global::QuranSchool.Application.DTOs.Staff.CreateStaffAbsenceDto dto)
        {
            var schoolId = _currentUserService.SchoolId;
            var absence = new StaffAbsence
            {
                SchoolId = (Guid)schoolId!,
                UserId = userId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Type = dto.Type,
                Reason = dto.Reason,
                IsValidated = false
            };

            _context.StaffAbsences.Add(absence);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync("RH", "RequestAbsence", $"Requested absence for user {userId} from {dto.StartDate} to {dto.EndDate}");

            return (await GetAbsencesAsync()).First(a => a.Id == absence.Id);
        }

        public async Task ValidateAbsenceAsync(Guid absenceId)
        {
            var absence = await _context.StaffAbsences.FindAsync(absenceId);
            if (absence != null)
            {
                absence.IsValidated = true;
                await _context.SaveChangesAsync();
                await _auditService.LogAsync("RH", "ValidateAbsence", $"Validated absence {absenceId}");
            }
        }
    }
}
