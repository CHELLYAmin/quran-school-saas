namespace QuranSchool.Application.DTOs;

public class VolunteerMissionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public int RequiredVolunteers { get; set; }
    public int CurrentVolunteers { get; set; }
    public bool IsPublished { get; set; }
    public string? SkillsRequired { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVolunteerMissionDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Location { get; set; } = string.Empty;
    public int RequiredVolunteers { get; set; }
    public bool IsPublished { get; set; }
    public string? SkillsRequired { get; set; }
}

public class VolunteerSignupDto
{
    public Guid Id { get; set; }
    public Guid MissionId { get; set; }
    public string MissionTitle { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime SignupDate { get; set; }
}

public class CreateVolunteerSignupDto
{
    public Guid MissionId { get; set; }
    public string? Notes { get; set; }
}
