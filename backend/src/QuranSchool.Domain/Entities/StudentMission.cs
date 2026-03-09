using QuranSchool.Domain.Enums;

using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class StudentMission : BaseEntity
{
    // Core Links
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;
    
    public Guid? TeacherId { get; set; } // Null if it's a SmartRevision
    public Teacher? Teacher { get; set; }

    // Mission Definition
    public MissionType Type { get; set; }
    public MissionTargetType TargetType { get; set; }
    
    public int? TargetId { get; set; } // e.g., Surah Number or Hizb Number
    public string? CustomDescription { get; set; } // For CustomText targets
    
    // Tracking
    public DateTime DueDate { get; set; }
    public MissionStatus Status { get; set; } = MissionStatus.Pending;
    
    // Asynchronous Audio Tracking
    public string? AudioUrl { get; set; }
    public string? TeacherFeedback { get; set; }

    // Evaluation (1-5 scale) for Spaced Repetition calculation
    public int? QualityScore { get; set; }
    
    // Temporal data
    public DateTime? CompletedAt { get; set; }
}
