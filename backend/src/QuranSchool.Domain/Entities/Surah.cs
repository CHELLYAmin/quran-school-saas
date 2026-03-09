using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Surah : BaseEntity
{
    public string NameArabic { get; set; } = string.Empty;
    public string NameEnglish { get; set; } = string.Empty;
    public int Number { get; set; }
    public string RevelationType { get; set; } = string.Empty; // Meccan or Medinan

    public ICollection<Verse> Verses { get; set; } = new List<Verse>();
}
