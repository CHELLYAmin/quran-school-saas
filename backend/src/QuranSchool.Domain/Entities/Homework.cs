using QuranSchool.Domain.Enums;
using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Homework : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public HomeworkType Type { get; set; }
    public DateTime DueDate { get; set; }

    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }

    public Guid TeacherId { get; set; }
    public Teacher? Teacher { get; set; }

    public string? AttachmentUrl { get; set; }

    public ICollection<HomeworkAssignment> Assignments { get; set; } = new List<HomeworkAssignment>();
}
