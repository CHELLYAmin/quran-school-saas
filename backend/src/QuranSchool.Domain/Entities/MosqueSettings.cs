using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class MosqueSettings : BaseEntity
{
    public double Latitude { get; set; } = 45.5019; // Default to existing value
    public double Longitude { get; set; } = -73.5674;
    public string Address { get; set; } = string.Empty;
    public int CalculationMethod { get; set; } = 2; // ISNA by default
    public string PrayersJson { get; set; } = string.Empty; // Stored JSON array of prayers and offsets
    
    // Nouveaux champs pour le Bandeau Annonce Live dynamique
    public bool IsLiveAnnouncementActive { get; set; } = false;
    public string? LiveAnnouncementText { get; set; }
    public DateTime? LiveAnnouncementStartDate { get; set; }
    public DateTime? LiveAnnouncementEndDate { get; set; }

    // Using a 1:1 or linking to School if multi-tenant exists
    // For now we'll store a single global setting or attach it to School if MultiSchool is enabled.
    public Guid? SchoolId { get; set; }
    public School? School { get; set; }
}
