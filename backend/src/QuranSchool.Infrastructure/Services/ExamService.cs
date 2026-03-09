using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class ExamService : IExamService
{
    private readonly AppDbContext _context;
    private readonly IScoringService _scoringService;
    private readonly IExamReportService _reportService;
    private readonly ICommunicationService _communicationService;

    public ExamService(AppDbContext context, IScoringService scoringService, IExamReportService reportService, ICommunicationService communicationService)
    {
        _context = context;
        _scoringService = scoringService;
        _reportService = reportService;
        _communicationService = communicationService;
    }

    public async Task<ExamResponse> GetByIdAsync(Guid id)
    {
        var e = await _context.Exams
            .Include(e => e.Student)
            .Include(e => e.Examiner)
            .Include(e => e.Surah)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new KeyNotFoundException("Exam not found.");
        return MapExam(e);
    }

    public async Task<IReadOnlyList<ExamResponse>> GetAllAsync(Guid schoolId)
        => await _context.Exams
            .Where(e => e.SchoolId == schoolId)
            .Include(e => e.Student)
            .Include(e => e.Examiner)
            .Include(e => e.Surah)
            .OrderByDescending(e => e.ExamDate)
            .Select(e => MapExam(e))
            .ToListAsync();

    public async Task<ExamResponse> StartExamAsync(Guid schoolId, Guid examinerId, StartExamRequest request)
    {
        var exam = new Exam
        {
            SchoolId = schoolId,
            Title = request.Title,
            Type = ExamType.Hifdh, // Default to Hifdh for this flow
            ExamDate = DateTime.UtcNow,
            StudentId = request.StudentId,
            ExaminerId = examinerId,
            SurahId = request.SurahId,
            ExamLevel = request.ExamLevel,
            StartVerse = request.StartVerse,
            EndVerse = request.EndVerse,
            FinalStatus = ExamStatus.Planned,
            FinalScore = 100, // Starts with 100
            IsLevelProgressionExam = request.IsLevelProgressionExam,
            TargetLevel = request.TargetLevel
        };

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        // Create Notifications
        if (request.StudentId != Guid.Empty)
        {
            await _communicationService.CreateNotificationAsync(schoolId, request.StudentId, "Examen Planifié", $"Un nouvel examen a été planifié pour vous : {request.Title}", "Exam", exam.Id.ToString());
        }
        if (examinerId != Guid.Empty)
        {
            await _communicationService.CreateNotificationAsync(schoolId, examinerId, "Nouvel Examen", $"Vous avez été assigné pour évaluer un examen : {request.Title}", "Exam", exam.Id.ToString());
        }

        return await GetByIdAsync(exam.Id);
    }

    public async Task MarkInProgressAsync(Guid examId)
    {
        var exam = await _context.Exams.FindAsync(examId) ?? throw new KeyNotFoundException("Exam not found.");
        exam.FinalStatus = ExamStatus.InProgress;
        await _context.SaveChangesAsync();
    }

    public async Task AnnotateVerseAsync(Guid examId, AnnotateVerseRequest request)
    {
        var eval = await _context.ExamVerseEvaluations
            .FirstOrDefaultAsync(ve => ve.ExamId == examId && ve.VerseId == request.VerseId);

        if (eval == null)
        {
            eval = new ExamVerseEvaluation
            {
                ExamId = examId,
                VerseId = request.VerseId,
                Status = request.Status,
                AssistanceGiven = request.AssistanceGiven,
                Comment = request.Comment,
                SchoolId = (await _context.Exams.FindAsync(examId))!.SchoolId
            };
            _context.ExamVerseEvaluations.Add(eval);
        }
        else
        {
            eval.Status = request.Status;
            eval.AssistanceGiven = request.AssistanceGiven;
            eval.Comment = request.Comment;
        }

        await _context.SaveChangesAsync();
    }

    public async Task AnnotateWordAsync(Guid examId, AnnotateWordRequest request)
    {
        var annotation = new ExamWordAnnotation
        {
            VerseEvaluationId = request.VerseEvaluationId,
            WordId = request.WordId,
            AnnotationType = request.AnnotationType,
            Comment = request.Comment,
            SchoolId = (await _context.Exams.FindAsync(examId))!.SchoolId
        };

        _context.ExamWordAnnotations.Add(annotation);
        await _context.SaveChangesAsync();
    }

    public async Task CompleteExamAsync(Guid examId, string? globalComment)
    {
        var exam = await _context.Exams
            .Include(e => e.VerseEvaluations)
                .ThenInclude(ve => ve.WordAnnotations)
            .FirstOrDefaultAsync(e => e.Id == examId)
            ?? throw new KeyNotFoundException("Exam not found.");

        exam.FinalStatus = ExamStatus.Completed;
        exam.GlobalComment = globalComment;
        exam.FinalScore = _scoringService.CalculateScore(exam);

        // If this is a level progression exam and the student passed, update their level
        if (exam.IsLevelProgressionExam && exam.FinalScore >= 60 && !string.IsNullOrEmpty(exam.TargetLevel))
        {
            var student = await _context.Students.FindAsync(exam.StudentId);
            if (student != null)
            {
                student.CurrentLevel = exam.TargetLevel;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<ExamReportResponse> GetReportAsync(Guid examId)
    {
        return await _reportService.GenerateReportAsync(examId);
    }

    private static ExamResponse MapExam(Exam e) => new(
        e.Id, e.Title, e.Type, e.ExamDate, 
        e.StudentId, e.Student != null ? $"{e.Student.FirstName} {e.Student.LastName}".Trim() : "Unknown",
        e.ExaminerId, e.Examiner?.Email ?? "Unknown",
        e.SurahId, e.Surah?.NameEnglish ?? "Unknown",
        e.ExamLevel,
        e.StartVerse, e.EndVerse, e.FinalStatus, e.FinalScore, 
        e.IsLevelProgressionExam, e.TargetLevel, e.CreatedAt
    );
}
