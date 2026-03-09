using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class ProgressCalculationService : IProgressCalculationService
{
    private readonly AppDbContext _context;

    public ProgressCalculationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateProgressSnapshotAsync(Guid studentId, Guid sessionId)
    {
        var recitations = await _context.SessionRecitations
            .Where(r => r.StudentId == studentId && r.SessionId == sessionId)
            .Include(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .ToListAsync();

        if (!recitations.Any()) return;

        foreach (var recitation in recitations)
        {
            int blocked = recitation.VerseEvaluations.Count(ve => ve.Status == SessionVerseEvaluationStatus.Blocked) + 
                          recitation.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(a => a.AnnotationType == SessionWordAnnotationType.Blocked);
            
            int forgotten = recitation.VerseEvaluations.Count(ve => ve.Status == SessionVerseEvaluationStatus.Forgotten) +
                            recitation.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(a => a.AnnotationType == SessionWordAnnotationType.Forgotten);
            
            int tajwid = recitation.VerseEvaluations.Count(ve => ve.Status == SessionVerseEvaluationStatus.TajwidError) +
                         recitation.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(a => a.AnnotationType == SessionWordAnnotationType.TajwidError);

            // Scoring logic: 20 base, deduct for errors
            double score = 20.0 - (blocked * 1.0) - (forgotten * 0.5) - (tajwid * 0.25);
            if (score < 0) score = 0;

            var snapshot = new StudentProgressSnapshot
            {
                Id = Guid.NewGuid(),
                StudentId = studentId,
                SessionId = sessionId,
                SurahId = recitation.SurahId,
                VersesCovered = $"{recitation.StartVerse}-{recitation.EndVerse}",
                BlockedCount = blocked,
                ForgottenCount = forgotten,
                TajwidErrorsCount = tajwid,
                PerformanceScore = score,
                Date = DateTime.UtcNow
            };

            _context.StudentProgressSnapshots.Add(snapshot);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<StudentProgressSnapshot>> GetStudentHistoryAsync(Guid studentId)
    {
        return await _context.StudentProgressSnapshots
            .Where(s => s.StudentId == studentId)
            .OrderBy(s => s.Date)
            .ToListAsync();
    }
}
