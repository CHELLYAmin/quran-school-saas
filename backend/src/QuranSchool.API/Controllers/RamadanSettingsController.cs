using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RamadanSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RamadanSettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.RamadanSettings.FirstOrDefaultAsync();
        if (settings == null) return NotFound();

        return Ok(new RamadanSettingsDto
        {
            Id = settings.Id,
            Year = settings.Year,
            FirstDay = settings.FirstDay,
            IsVisible = settings.IsVisible,
            CalendarJson = settings.CalendarJson
        });
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] UpdateRamadanSettingsDto dto)
    {
        var settings = await _context.RamadanSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new RamadanSettings
            {
                Year = dto.Year,
                FirstDay = dto.FirstDay,
                IsVisible = dto.IsVisible,
                CalendarJson = dto.CalendarJson,
                SchoolId = Guid.Parse("11111111-1111-1111-1111-111111111111")
            };
            _context.RamadanSettings.Add(settings);
        }
        else
        {
            settings.Year = dto.Year;
            settings.FirstDay = dto.FirstDay;
            settings.IsVisible = dto.IsVisible;
            settings.CalendarJson = dto.CalendarJson;
            settings.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new RamadanSettingsDto
        {
            Id = settings.Id,
            Year = settings.Year,
            FirstDay = settings.FirstDay,
            IsVisible = settings.IsVisible,
            CalendarJson = settings.CalendarJson
        });
    }
}
