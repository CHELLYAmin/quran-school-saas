using QuranSchool.Domain.Common;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Domain.Entities;

public class VolunteerSignup : BaseEntity
{
    public Guid MissionId { get; set; }
    public VolunteerMission Mission { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public VolunteerSignupStatus Status { get; set; } = VolunteerSignupStatus.Pending;
    public string? Notes { get; set; }
    public DateTime SignupDate { get; set; } = DateTime.UtcNow;
}
