using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs.Staff;

public class StaffMemberDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public StaffContractStatus Status { get; set; }
    public string? RoleName { get; set; }
}

public class StaffContractDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public StaffContractType Type { get; set; }
    public decimal? Salary { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public StaffContractStatus Status { get; set; }
    public string? DocumentUrl { get; set; }
}

public class StaffAbsenceDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public StaffAbsenceType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsValidated { get; set; }
}

public class CreateStaffAbsenceDto
{
    public StaffAbsenceType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}
