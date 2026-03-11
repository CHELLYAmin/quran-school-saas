using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuranSchool.Application.Interfaces;
using QuranSchool.API.Attributes;
using QuranSchool.Domain.Constants;
using QuranSchool.Application.DTOs.Finance;

namespace QuranSchool.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly IFinancialService _financialService;

    public FinanceController(IFinancialService financialService)
    {
        _financialService = financialService;
    }

    [HttpGet("summary")]
    [RequirePermission(Permissions.FinanceView)]
    public async Task<ActionResult<FinancialSummaryDto>> GetSummary()
    {
        return Ok(await _financialService.GetSummaryAsync());
    }

    [HttpGet("transactions")]
    [RequirePermission(Permissions.FinanceView)]
    public async Task<ActionResult<IEnumerable<FinancialTransactionDto>>> GetTransactions([FromQuery] System.DateTime? from, [FromQuery] System.DateTime? to)
    {
        return Ok(await _financialService.GetTransactionsAsync(from, to));
    }

    [HttpPost("transactions")]
    [RequirePermission(Permissions.FinanceManage)]
    public async Task<ActionResult<FinancialTransactionDto>> CreateTransaction(CreateFinancialTransactionDto dto)
    {
        var result = await _financialService.CreateTransactionAsync(dto);
        return Ok(result);
    }

    [HttpGet("categories")]
    [RequirePermission(Permissions.FinanceView)]
    public async Task<ActionResult<IEnumerable<TransactionCategoryDto>>> GetCategories()
    {
        return Ok(await _financialService.GetCategoriesAsync());
    }

    [HttpGet("donors")]
    public async Task<ActionResult<IEnumerable<DonorProfileDto>>> GetDonors()
    {
        return Ok(await _financialService.GetDonorsAsync());
    }

    [HttpGet("projects")]
    [RequirePermission(Permissions.FinanceView)]
    public async Task<ActionResult<IEnumerable<FinancialProjectDto>>> GetProjects()
    {
        return Ok(await _financialService.GetProjectsAsync());
    }
}
