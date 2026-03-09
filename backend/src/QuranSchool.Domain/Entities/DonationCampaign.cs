using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class DonationCampaign : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; } = 0;
    public DateTime? EndDate { get; set; }
    public bool IsPublished { get; set; } = false;
    public string? ImageUrl { get; set; }
    
    // Relationships
    public Guid? SchoolId { get; set; }
    public School? School { get; set; }
    
    public ICollection<DonationRecord> Donations { get; set; } = new List<DonationRecord>();
}
