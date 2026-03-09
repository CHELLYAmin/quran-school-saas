using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class VolunteerMission : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public int RequiredVolunteers { get; set; }
    public int CurrentVolunteers { get; set; } = 0;
    public bool IsPublished { get; set; } = false;
    public string? SkillsRequired { get; set; } // Comma separated or JSON
    
    // Relationships
    public Guid? SchoolId { get; set; }
    public School? School { get; set; }
    
    public ICollection<VolunteerSignup> Signups { get; set; } = new List<VolunteerSignup>();
}
