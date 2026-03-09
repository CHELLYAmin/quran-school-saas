using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class ExamReportService : IExamReportService
{
    private readonly AppDbContext _context;
    private readonly IScoringService _scoringService;

    public ExamReportService(AppDbContext context, IScoringService scoringService)
    {
        _context = context;
        _scoringService = scoringService;
    }

    public async Task<ExamReportResponse> GenerateReportAsync(Guid examId)
    {
        var exam = await _context.Exams
            .Include(e => e.Student)
            .Include(e => e.Surah)
            .Include(e => e.VerseEvaluations)
                .ThenInclude(ve => ve.Verse)
            .Include(e => e.VerseEvaluations)
                .ThenInclude(ve => ve.WordAnnotations)
                    .ThenInclude(wa => wa.Word)
            .FirstOrDefaultAsync(e => e.Id == examId)
            ?? throw new KeyNotFoundException("Exam not found.");

        var blockedCount = exam.VerseEvaluations.Count(ve => ve.Status == VerseEvaluationStatus.Blocked) +
                           exam.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(wa => wa.AnnotationType == WordAnnotationType.Blocked);
        
        var forgottenCount = exam.VerseEvaluations.Count(ve => ve.Status == VerseEvaluationStatus.Forgotten) +
                             exam.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(wa => wa.AnnotationType == WordAnnotationType.Forgotten);

        var tajwidCount = exam.VerseEvaluations.SelectMany(ve => ve.WordAnnotations).Count(wa => wa.AnnotationType == WordAnnotationType.TajwidError);

        return new ExamReportResponse(
            exam.Id,
            exam.Student?.FullName ?? "Unknown",
            exam.Surah?.NameArabic ?? "Unknown",
            exam.StartVerse,
            exam.EndVerse,
            exam.VerseEvaluations.Count,
            blockedCount,
            forgottenCount,
            tajwidCount,
            exam.FinalScore,
            exam.GlobalComment,
            exam.VerseEvaluations.OrderBy(ve => ve.Verse?.VerseNumber).Select(ve => new VerseEvaluationDetail(
                ve.Verse?.VerseNumber ?? 0,
                ve.Verse?.TextArabic ?? "",
                ve.Status,
                ve.AssistanceGiven,
                ve.Comment,
                ve.WordAnnotations.OrderBy(wa => wa.Word?.WordIndex).Select(wa => new WordAnnotationDetail(
                    wa.Word?.WordIndex ?? 0,
                    wa.Word?.WordText ?? "",
                    wa.AnnotationType,
                    wa.Comment
                )).ToList()
            )).ToList()
        );
    }

    public async Task<byte[]> GeneratePdfReportAsync(Guid examId)
    {
        // Placeholder for PDF generation using QuestPDF or similar
        // For now, we return a dummy byte array or throw a NotImplementedException if not critical
        // In a real scenario, this would generate a professional PDF.
        return await Task.FromResult(new byte[0]);
    }
}
