using System;

namespace QuranSchool.Application.DTOs;

public class RamadanSettingsDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public DateTime FirstDay { get; set; }
    public bool IsVisible { get; set; }
    public string CalendarJson { get; set; }
}

public class UpdateRamadanSettingsDto
{
    public int Year { get; set; }
    public DateTime FirstDay { get; set; }
    public bool IsVisible { get; set; }
    public string CalendarJson { get; set; }
}
