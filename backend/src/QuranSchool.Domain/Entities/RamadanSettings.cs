using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class RamadanSettings : BaseEntity
{
    public int Year { get; set; }
    public DateTime FirstDay { get; set; }
    public bool IsVisible { get; set; } = true;
    public string CalendarJson { get; set; } = string.Empty; // Stored JSON array of daily times
    public virtual School? School { get; set; }
}
