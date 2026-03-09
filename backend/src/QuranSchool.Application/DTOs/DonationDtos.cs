namespace QuranSchool.Application.DTOs;

public class DonationCampaignDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPublished { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDonationCampaignDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPublished { get; set; }
    public string? ImageUrl { get; set; }
}

public class DonationRecordDto
{
    public Guid Id { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CampaignTitle { get; set; } = string.Empty;
}

public class CreateDonationRecordDto
{
    public string DonorName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Interac";
    public bool IsAnonymous { get; set; }
    public string? Note { get; set; }
    public Guid CampaignId { get; set; }
}
