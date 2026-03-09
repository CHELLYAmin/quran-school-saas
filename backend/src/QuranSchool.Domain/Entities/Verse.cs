using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class Verse : BaseEntity
{
    public Guid SurahId { get; set; }
    public int VerseNumber { get; set; }
    public string TextArabic { get; set; } = string.Empty;
    public int WordsCount { get; set; }

    public Surah? Surah { get; set; }
    public ICollection<VerseWord> Words { get; set; } = new List<VerseWord>();
}
