using QuranSchool.Domain.Enums;

namespace QuranSchool.Application.DTOs;

public class StudentMissionDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Guid? TeacherId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string? TeacherName { get; set; }
    
    public MissionType Type { get; set; }
    public MissionTargetType TargetType { get; set; }
    public int? TargetId { get; set; }
    public string? CustomDescription { get; set; }
    
    public DateTime DueDate { get; set; }
    public MissionStatus Status { get; set; }
    public int? QualityScore { get; set; }
    
    public string? AudioUrl { get; set; }
    public string? TeacherFeedback { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateManualMissionDto
{
    public Guid StudentId { get; set; }
    public MissionTargetType TargetType { get; set; }
    public int? TargetId { get; set; }
    public string? CustomDescription { get; set; }
    public DateTime DueDate { get; set; }
}

public class GenerateSmartRevisionDto
{
    public Guid StudentId { get; set; }
    // Add logic later for amount or specifics
}

public class SubmitMissionAudioDto
{
    public string AudioUrl { get; set; } = string.Empty;
}

public class ProvideMissionFeedbackDto
{
    public int QualityScore { get; set; } // 1 to 5
    public string? Feedback { get; set; }
}

public class CompleteMissionDto
{
    public int? QualityScore { get; set; } // 1 to 5
}
