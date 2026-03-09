using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Group : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? LevelId { get; set; }
    public Level? Level { get; set; }
    public int MaxCapacity { get; set; } = 30;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign Keys
    public Guid? TeacherId { get; set; }

    // Navigation
    public Teacher? Teacher { get; set; }
    public School? School { get; set; }
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
