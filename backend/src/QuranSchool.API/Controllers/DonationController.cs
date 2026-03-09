using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonationController : ControllerBase
{
    private readonly AppDbContext _context;

    public DonationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("campaigns")]
    [AllowAnonymous]
    public async Task<ActionResult<List<DonationCampaignDto>>> GetCampaigns([FromQuery] bool? published)
    {
        var query = _context.DonationCampaigns.AsQueryable();

        if (published.HasValue)
            query = query.Where(c => c.IsPublished == published.Value);

        var campaigns = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

        return Ok(campaigns.Select(c => new DonationCampaignDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            TargetAmount = c.TargetAmount,
            CurrentAmount = c.CurrentAmount,
            EndDate = c.EndDate,
            IsPublished = c.IsPublished,
            ImageUrl = c.ImageUrl,
            CreatedAt = c.CreatedAt
        }).ToList());
    }

    [HttpPost("campaigns")]
    public async Task<ActionResult<DonationCampaignDto>> CreateCampaign([FromBody] CreateDonationCampaignDto dto)
    {
        var campaign = new DonationCampaign
        {
            Title = dto.Title,
            Description = dto.Description,
            TargetAmount = dto.TargetAmount,
            EndDate = dto.EndDate,
            IsPublished = dto.IsPublished,
            ImageUrl = dto.ImageUrl
        };

        _context.DonationCampaigns.Add(campaign);
        await _context.SaveChangesAsync();

        return Ok(new DonationCampaignDto { Id = campaign.Id, Title = campaign.Title, TargetAmount = campaign.TargetAmount });
    }

    [HttpGet("records")]
    public async Task<ActionResult<List<DonationRecordDto>>> GetRecords()
    {
        var records = await _context.DonationRecords
            .Include(r => r.Campaign)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(records.Select(r => new DonationRecordDto
        {
            Id = r.Id,
            DonorName = r.DonorName,
            Amount = r.Amount,
            Status = r.Status.ToString(),
            PaymentType = r.PaymentType.ToString(),
            CreatedAt = r.CreatedAt,
            CampaignTitle = r.Campaign.Title
        }).ToList());
    }

    [HttpPost("records")]
    [AllowAnonymous]
    public async Task<ActionResult<DonationRecordDto>> CreateRecord([FromBody] CreateDonationRecordDto dto)
    {
        var campaign = await _context.DonationCampaigns.FindAsync(dto.CampaignId);
        if (campaign == null) return NotFound("Campaign not found");

        var record = new DonationRecord
        {
            DonorName = dto.DonorName,
            Email = dto.Email,
            Amount = dto.Amount,
            PaymentType = Enum.Parse<DonationPaymentType>(dto.PaymentType),
            IsAnonymous = dto.IsAnonymous,
            Note = dto.Note,
            CampaignId = dto.CampaignId,
            Status = DonationRecordStatus.Pending
        };

        _context.DonationRecords.Add(record);
        
        // If validated (simplified for now, usually happens after payment webhook)
        if (record.Status == DonationRecordStatus.Validated)
        {
            campaign.CurrentAmount += record.Amount;
        }

        await _context.SaveChangesAsync();

        return Ok(new DonationRecordDto { Id = record.Id, DonorName = record.DonorName, Amount = record.Amount });
    }

    [HttpPatch("records/{id}/validate")]
    public async Task<ActionResult> ValidateDonation(Guid id)
    {
        var record = await _context.DonationRecords.Include(r => r.Campaign).FirstOrDefaultAsync(r => r.Id == id);
        if (record == null) return NotFound();

        if (record.Status == DonationRecordStatus.Pending)
        {
            record.Status = DonationRecordStatus.Validated;
            record.Campaign.CurrentAmount += record.Amount;
            await _context.SaveChangesAsync();
        }

        return Ok();
    }
}
