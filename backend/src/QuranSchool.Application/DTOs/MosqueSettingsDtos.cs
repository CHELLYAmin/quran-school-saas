namespace QuranSchool.Application.DTOs;

public class MosqueSettingsDto
{
    public Guid Id { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public int CalculationMethod { get; set; }
    public string PrayersJson { get; set; } = string.Empty;
}

public class UpdateMosqueSettingsDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public int CalculationMethod { get; set; }
    public string PrayersJson { get; set; } = string.Empty;
}
