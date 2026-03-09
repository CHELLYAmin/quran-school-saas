using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Seed;

public class QuranDataSeeder
{
    private readonly AppDbContext _context;

    public QuranDataSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        if (await _context.Surahs.AnyAsync()) return;

        var surahs = new List<Surah>
        {
            new Surah 
            { 
                Id = Guid.NewGuid(),
                Number = 1, 
                NameArabic = "الفاتحة", 
                NameEnglish = "Al-Fatiha", 
                RevelationType = "Meccan",
                Verses = new List<Verse>
                {
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 1, TextArabic = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", WordsCount = 4,
                        Words = new List<VerseWord>
                        {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "بِسْمِ", NormalizedText = "بسم" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "اللَّهِ", NormalizedText = "الله" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "الرَّحْمَنِ", NormalizedText = "الرحمن" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "الرَّحِيمِ", NormalizedText = "الرحيم" }
                        }
                    },
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 2, TextArabic = "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", WordsCount = 4,
                        Words = new List<VerseWord>
                        {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "الْحَمْدُ", NormalizedText = "الحمد" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "لِلَّهِ", NormalizedText = "لله" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "رَبِّ", NormalizedText = "رب" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "الْعَالَمِينَ", NormalizedText = "العالمين" }
                        }
                    }
                }
            },
            new Surah 
            { 
                Id = Guid.NewGuid(),
                Number = 112, 
                NameArabic = "الإخلاص", 
                NameEnglish = "Al-Ikhlas", 
                RevelationType = "Meccan",
                Verses = new List<Verse>
                {
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 1, TextArabic = "قُلْ هُوَ اللَّهُ أَحَدٌ", WordsCount = 4,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "قُلْ", NormalizedText = "قل" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "هُوَ", NormalizedText = "هو" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "اللَّهُ", NormalizedText = "الله" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "أَحَدٌ", NormalizedText = "أحد" }
                        }
                    },
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 2, TextArabic = "اللَّهُ الصَّمَدُ", WordsCount = 2,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "اللَّهُ", NormalizedText = "الله" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "الصَّمَدُ", NormalizedText = "الصمد" }
                        }
                    },
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 3, TextArabic = "لَمْ يَلِدْ وَلَمْ يُولَدْ", WordsCount = 4,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "لَمْ", NormalizedText = "لم" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "يَلِدْ", NormalizedText = "يلد" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "وَلَمْ", NormalizedText = "ولm" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "يُولَدْ", NormalizedText = "يولد" }
                        }
                    },
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 4, TextArabic = "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", WordsCount = 5,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "وَلَمْ", NormalizedText = "ولم" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "يَكُن", NormalizedText = "يكن" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "لَّهُ", NormalizedText = "له" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "كُفُوًا", NormalizedText = "كفوا" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 4, WordText = "أَحَدٌ", NormalizedText = "أحد" }
                        }
                    }
                }
            },
            new Surah 
            { 
                Id = Guid.NewGuid(),
                Number = 113, 
                NameArabic = "الفلق", 
                NameEnglish = "Al-Falaq", 
                RevelationType = "Meccan",
                Verses = new List<Verse>
                {
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 1, TextArabic = "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", WordsCount = 4,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "قُلْ", NormalizedText = "قل" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "أَعُوذُ", NormalizedText = "أعوذ" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "بِرَبِّ", NormalizedText = "برب" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "الْفَلَقِ", NormalizedText = "الفلق" }
                        }
                    }
                }
            },
            new Surah 
            { 
                Id = Guid.NewGuid(),
                Number = 114, 
                NameArabic = "الناس", 
                NameEnglish = "An-Nas", 
                RevelationType = "Meccan",
                Verses = new List<Verse>
                {
                    new Verse
                    {
                        Id = Guid.NewGuid(), VerseNumber = 1, TextArabic = "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", WordsCount = 4,
                        Words = new List<VerseWord> {
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 0, WordText = "قُلْ", NormalizedText = "قل" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 1, WordText = "أَعُوذُ", NormalizedText = "أعوذ" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 2, WordText = "بِرَبِّ", NormalizedText = "برب" },
                            new VerseWord { Id = Guid.NewGuid(), WordIndex = 3, WordText = "النَّاسِ", NormalizedText = "الناس" }
                        }
                    }
                }
            }
        };

        _context.Surahs.AddRange(surahs);
        await _context.SaveChangesAsync();
    }
}
