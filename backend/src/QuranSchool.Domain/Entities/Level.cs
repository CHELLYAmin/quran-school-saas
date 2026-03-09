using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Level : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;

    // Quranic Range Definition
    public int? StartSurah { get; set; } 
    public int? EndSurah { get; set; }

    // Navigation
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}
