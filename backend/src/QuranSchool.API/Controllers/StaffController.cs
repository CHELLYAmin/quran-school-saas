using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuranSchool.Application.Interfaces;
using QuranSchool.API.Attributes;
using QuranSchool.Domain.Constants;
using QuranSchool.Domain.Interfaces;
using QuranSchool.Application.DTOs.Staff;

namespace QuranSchool.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;
    private readonly ICurrentUserService _currentUserService;

    public StaffController(IStaffService staffService, ICurrentUserService currentUserService)
    {
        _staffService = staffService;
        _currentUserService = currentUserService;
    }

    [HttpGet("members")]
    [RequirePermission(Permissions.StaffView)]
    public async Task<ActionResult<IEnumerable<StaffMemberDto>>> GetStaffMembers()
    {
        return Ok(await _staffService.GetStaffMembersAsync());
    }

    [HttpGet("contract/{userId}")]
    [RequirePermission(Permissions.StaffView)]
    public async Task<ActionResult<StaffContractDto>> GetContract(System.Guid userId)
    {
        var contract = await _staffService.GetContractAsync(userId);
        if (contract == null) return NotFound();
        return Ok(contract);
    }

    [HttpGet("absences")]
    [RequirePermission(Permissions.StaffView)]
    public async Task<ActionResult<IEnumerable<StaffAbsenceDto>>> GetAbsences([FromQuery] bool? validated)
    {
        return Ok(await _staffService.GetAbsencesAsync(validated));
    }

    [HttpPost("absences")]
    [RequirePermission(Permissions.StaffManage)]
    public async Task<ActionResult<StaffAbsenceDto>> RequestAbsence(CreateStaffAbsenceDto dto)
    {
        var userId = _currentUserService.UserId ?? System.Guid.Empty;
        var result = await _staffService.RequestAbsenceAsync(userId, dto);
        return Ok(result);
    }

    [HttpPost("absences/{id}/validate")]
    [RequirePermission(Permissions.StaffManage)]
    public async Task<IActionResult> ValidateAbsence(System.Guid id)
    {
        await _staffService.ValidateAbsenceAsync(id);
        return NoContent();
    }
}
