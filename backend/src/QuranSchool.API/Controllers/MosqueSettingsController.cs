using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class MosqueSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MosqueSettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        // For simplicity grab the first available setting.
        // In a strictly multi-tenant app, we would filter by SchoolId from the user claims.
        var settings = await _context.MosqueSettings.FirstOrDefaultAsync();
        
        if (settings == null)
        {
            // Return defaults if none exist
            return Ok(new MosqueSettingsDto
            {
                Latitude = 45.5019,
                Longitude = -73.5674,
                Address = "Québec",
                CalculationMethod = 2,
                PrayersJson = "[]"
            });
        }

        return Ok(new MosqueSettingsDto
        {
            Id = settings.Id,
            Latitude = settings.Latitude,
            Longitude = settings.Longitude,
            Address = settings.Address,
            CalculationMethod = settings.CalculationMethod,
            PrayersJson = settings.PrayersJson,
            IsLiveAnnouncementActive = settings.IsLiveAnnouncementActive,
            LiveAnnouncementText = settings.LiveAnnouncementText,
            LiveAnnouncementStartDate = settings.LiveAnnouncementStartDate,
            LiveAnnouncementEndDate = settings.LiveAnnouncementEndDate
        });
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] UpdateMosqueSettingsDto dto)
    {
        var settings = await _context.MosqueSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new MosqueSettings
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Address = dto.Address,
                CalculationMethod = dto.CalculationMethod,
                PrayersJson = dto.PrayersJson,
                IsLiveAnnouncementActive = dto.IsLiveAnnouncementActive,
                LiveAnnouncementText = dto.LiveAnnouncementText,
                LiveAnnouncementStartDate = dto.LiveAnnouncementStartDate,
                LiveAnnouncementEndDate = dto.LiveAnnouncementEndDate
                // Assign to default SchoolId if required by your context setup, 
                // but SchoolId is marked nullable in the entity we created.
            };
            _context.MosqueSettings.Add(settings);
        }
        else
        {
            settings.Latitude = dto.Latitude;
            settings.Longitude = dto.Longitude;
            settings.Address = dto.Address;
            settings.CalculationMethod = dto.CalculationMethod;
            settings.PrayersJson = dto.PrayersJson;
            settings.IsLiveAnnouncementActive = dto.IsLiveAnnouncementActive;
            settings.LiveAnnouncementText = dto.LiveAnnouncementText;
            settings.LiveAnnouncementStartDate = dto.LiveAnnouncementStartDate;
            settings.LiveAnnouncementEndDate = dto.LiveAnnouncementEndDate;
        }

        await _context.SaveChangesAsync();

        return Ok(new MosqueSettingsDto
        {
            Id = settings.Id,
            Latitude = settings.Latitude,
            Longitude = settings.Longitude,
            Address = settings.Address,
            CalculationMethod = settings.CalculationMethod,
            PrayersJson = settings.PrayersJson,
            IsLiveAnnouncementActive = settings.IsLiveAnnouncementActive,
            LiveAnnouncementText = settings.LiveAnnouncementText,
            LiveAnnouncementStartDate = settings.LiveAnnouncementStartDate,
            LiveAnnouncementEndDate = settings.LiveAnnouncementEndDate
        });
    }
}
