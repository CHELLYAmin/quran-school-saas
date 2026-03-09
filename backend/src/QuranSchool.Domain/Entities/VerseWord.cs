using QuranSchool.Domain.Common;

namespace QuranSchool.Domain.Entities;

public class VerseWord : BaseEntity
{
    public Guid VerseId { get; set; }
    public int WordIndex { get; set; } // 0-based index within the verse
    public string WordText { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;

    public Verse? Verse { get; set; }
}
