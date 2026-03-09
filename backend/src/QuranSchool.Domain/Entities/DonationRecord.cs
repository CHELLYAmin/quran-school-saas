using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class DonationRecord : BaseEntity
{
    public string DonorName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public decimal Amount { get; set; }
    public DonationPaymentType PaymentType { get; set; }
    public DonationRecordStatus Status { get; set; } = DonationRecordStatus.Pending;
    public bool IsAnonymous { get; set; } = false;
    public string? Note { get; set; }
    
    // Relationships
    public Guid CampaignId { get; set; }
    public DonationCampaign Campaign { get; set; } = null!;
}
