using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Quran;
using QuranSchool.Application.Interfaces;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class MushafService : IMushafService
{
    private readonly AppDbContext _context;

    public MushafService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SurahResponse>> GetSurahsAsync()
    {
        return await _context.Surahs
            .OrderBy(s => s.Number)
            .Select(s => new SurahResponse(s.Id, s.Number, s.NameArabic, s.NameEnglish, s.RevelationType, s.Verses.Count))
            .ToListAsync();
    }

    public async Task<SurahResponse> GetSurahByIdAsync(Guid id)
    {
        var s = await _context.Surahs.Include(s => s.Verses).FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new KeyNotFoundException("Surah not found.");
        return new SurahResponse(s.Id, s.Number, s.NameArabic, s.NameEnglish, s.RevelationType, s.Verses.Count);
    }

    public async Task<IReadOnlyList<VerseResponse>> GetVersesAsync(Guid surahId, int? start = null, int? end = null)
    {
        var query = _context.Verses
            .Where(v => v.SurahId == surahId)
            .Include(v => v.Words)
            .OrderBy(v => v.VerseNumber)
            .AsQueryable();

        if (start.HasValue) query = query.Where(v => v.VerseNumber >= start.Value);
        if (end.HasValue) query = query.Where(v => v.VerseNumber <= end.Value);

        return await query.Select(v => new VerseResponse(
            v.Id, 
            v.SurahId, 
            v.VerseNumber, 
            v.TextArabic, 
            v.WordsCount,
            v.Words.OrderBy(w => w.WordIndex).Select(w => new WordResponse(w.Id, w.VerseId, w.WordIndex, w.WordText, w.NormalizedText)).ToList()
        )).ToListAsync();
    }
}
