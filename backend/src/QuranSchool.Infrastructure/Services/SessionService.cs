using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Session;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly AppDbContext _context;
    private readonly ISmartQueueService _smartQueueService;
    private readonly IGamificationService _gamificationService;

    public SessionService(AppDbContext context, ISmartQueueService smartQueueService, IGamificationService gamificationService)
    {
        _context = context;
        _smartQueueService = smartQueueService;
        _gamificationService = gamificationService;
    }

    public async Task<SessionResponse> GetByIdAsync(Guid id)
    {
        var session = await _context.Sessions
            .Include(s => s.Group)
            .Include(s => s.Teacher)
            .Include(s => s.Attendances).ThenInclude(a => a.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Surah)
            .Include(s => s.Recitations).ThenInclude(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        return MapToResponse(session);
    }

    public async Task<IReadOnlyList<SessionResponse>> GetAllAsync(Guid schoolId)
    {
        var sessions = await _context.Sessions
            .Where(s => s.SchoolId == schoolId)
            .Include(s => s.Group)
            .Include(s => s.Teacher)
            .Include(s => s.Attendances).ThenInclude(a => a.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Surah)
            .Include(s => s.Recitations).ThenInclude(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .OrderByDescending(s => s.Date)
            .ToListAsync();

        return sessions.Select(MapToResponse).ToList();
    }

    public async Task<IReadOnlyList<SessionResponse>> GetByGroupAsync(Guid groupId)
    {
        var sessions = await _context.Sessions
            .Where(s => s.GroupId == groupId)
            .Include(s => s.Group)
            .Include(s => s.Teacher)
            .Include(s => s.Attendances).ThenInclude(a => a.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Surah)
            .Include(s => s.Recitations).ThenInclude(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .OrderByDescending(s => s.Date)
            .ToListAsync();

        return sessions.Select(MapToResponse).ToList();
    }

    public async Task<SessionResponse> CreateAsync(Guid schoolId, Guid userId, CreateSessionRequest request)
    {
        // Resolve the actual Teacher.Id from the User's linked profile
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        Guid teacherId = Guid.Empty;

        // 1. If user is a teacher, use their ID
        if (user != null && user.LinkedProfileType == Domain.Enums.ProfileType.Teacher && user.LinkedProfileId != Guid.Empty)
        {
            teacherId = user.LinkedProfileId;
        }
        // 2. Otherwise, if there's a group, use the group's teacher
        else if (request.GroupId.HasValue)
        {
            var group = await _context.Groups.FindAsync(request.GroupId.Value);
            if (group != null)
            {
                teacherId = group.TeacherId ?? Guid.Empty;
            }
        }

        // 3. Last fallback: pick any teacher from the school to satisfy the foreign key constraint
        if (teacherId == Guid.Empty)
        {
            var fallbackTeacher = await _context.Teachers.FirstOrDefaultAsync(t => t.SchoolId == schoolId);
            if (fallbackTeacher != null)
            {
                teacherId = fallbackTeacher.Id;
            }
            else
            {
                // If NO teachers exist, we still have a problem, but seeding should have provided some.
                // For now, use userId only if it's really necessary, but it'll likely fail the FK check if not a teacher.
                teacherId = (user != null && user.LinkedProfileId != Guid.Empty)
                    ? user.LinkedProfileId
                    : userId;
            }
        }

        var session = new Session
        {
            Id = Guid.NewGuid(),
            SchoolId = schoolId,
            TeacherId = teacherId,
            GroupId = request.GroupId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            SessionObjective = request.SessionObjective,
            SurahId = request.SurahId,
            StartVerse = request.StartVerse,
            EndVerse = request.EndVerse,
            IsOnline = request.IsOnline,
            MeetingUrl = request.IsOnline && string.IsNullOrEmpty(request.MeetingUrl) 
                ? $"https://meet.jit.si/QuranSchool-{Guid.NewGuid().ToString().Substring(0, 8)}"
                : request.MeetingUrl,
            Status = SessionStatus.Planned
        };

        _context.Sessions.Add(session);

        // Pre-create attendance records for all students in group, IF a group was assigned
        if (request.GroupId.HasValue)
        {
            var students = await _context.Students
                .Where(s => s.GroupId == request.GroupId.Value)
                .ToListAsync();

            foreach (var student in students)
            {
                _context.SessionAttendances.Add(new SessionAttendance
                {
                    Id = Guid.NewGuid(),
                    SessionId = session.Id,
                    StudentId = student.Id,
                    Status = SessionAttendanceStatus.Present // Default to present
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(session.Id);
    }

    public async Task<SessionResponse> AssignGroupAsync(Guid sessionId, Guid groupId)
    {
        var session = await _context.Sessions.FindAsync(sessionId);
        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        if (session.GroupId != null) throw new InvalidOperationException("Cette séance est déjà assignée à un groupe.");

        var group = await _context.Groups.FindAsync(groupId);
        if (group == null) throw new KeyNotFoundException("Groupe non trouvé");

        session.GroupId = groupId;

        // Create attendance records for all students in group
        var students = await _context.Students
            .Where(s => s.GroupId == groupId)
            .ToListAsync();

        foreach (var student in students)
        {
            _context.SessionAttendances.Add(new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                StudentId = student.Id,
                Status = SessionAttendanceStatus.Present // Default to present
            });
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(sessionId);
    }

    public async Task<SessionResponse> UpdateStatusAsync(Guid id, SessionStatus status)
    {
        var session = await _context.Sessions.FindAsync(id);
        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        session.Status = status;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task MarkAttendanceAsync(Guid sessionId, MarkSessionAttendanceRequest request)
    {
        foreach (var item in request.Attendances)
        {
            var attendance = await _context.SessionAttendances.FindAsync(item.Id);
            if (attendance != null)
            {
                var wasAbsent = attendance.Status == SessionAttendanceStatus.Absent;
                attendance.Status = item.Status;
                attendance.Comment = item.Comment;

                // Award XP if changing from Absent to Present/Late
                if (wasAbsent && (item.Status == SessionAttendanceStatus.Present || item.Status == SessionAttendanceStatus.Late))
                {
                    await _gamificationService.AwardXPAsync(attendance.StudentId, 5, $"Présence à la séance : {sessionId}");
                    await _gamificationService.UpdateStreakAsync(attendance.StudentId);
                }
            }
        }
        await _context.SaveChangesAsync();
    }

    public async Task<SessionRecitationResponse> StartRecitationAsync(Guid sessionId, StartSessionRecitationRequest request)
    {
        var session = await _context.Sessions.FindAsync(sessionId);
        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        var maxOrder = await _context.SessionRecitations
            .Where(r => r.SessionId == sessionId)
            .Select(r => (int?)r.RecitationOrder)
            .MaxAsync() ?? 0;

        var student = await _context.Students.FindAsync(request.StudentId);
        var surah = await _context.Surahs.FirstOrDefaultAsync(s => s.Number == request.SurahNumber);

        if (surah == null) throw new KeyNotFoundException("Sourate non trouvée");

        var recitation = new SessionRecitation
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            StudentId = request.StudentId,
            SurahId = surah.Id,
            StartVerse = request.StartVerse,
            EndVerse = request.EndVerse,
            RecitationOrder = maxOrder + 1,
            CreatedAt = DateTime.UtcNow
        };

        _context.SessionRecitations.Add(recitation);
        await _context.SaveChangesAsync();

        return new SessionRecitationResponse(
            recitation.Id,
            recitation.StudentId,
            $"{student?.FirstName} {student?.LastName}",
            recitation.SurahId,
            surah.NameEnglish,
            recitation.StartVerse,
            recitation.EndVerse,
            recitation.RecitationOrder,
            null,
            recitation.CreatedAt,
            new List<SessionVerseEvaluationDto>() // Added the required missing parameter
        );
    }

    public async Task AnnotateVerseAsync(Guid recitationId, AnnotateSessionVerseRequest request)
    {
        var evaluation = await _context.SessionVerseEvaluations
            .FirstOrDefaultAsync(v => v.SessionRecitationId == recitationId && v.VerseId == request.VerseId);

        if (evaluation != null)
        {
            evaluation.Status = request.Status;
            evaluation.AssistanceGiven = request.AssistanceGiven;
            evaluation.Comment = request.Comment;
        }
        else
        {
            _context.SessionVerseEvaluations.Add(new SessionVerseEvaluation
            {
                Id = Guid.NewGuid(),
                SessionRecitationId = recitationId,
                VerseId = request.VerseId,
                Status = request.Status,
                AssistanceGiven = request.AssistanceGiven,
                Comment = request.Comment
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task AnnotateWordAsync(Guid recitationId, AnnotateSessionWordRequest request)
    {
        // Actually, this needs to ensure we have a VerseEvaluation first
        // In the flow, we usually click a word, which targets a specific verse.
        // The frontend should have the VerseEvaluationId if already created, or we derive it.
        
        var evaluation = await _context.SessionVerseEvaluations.FindAsync(request.VerseEvaluationId);
        if (evaluation == null) throw new Exception("Veuillez d'abord évaluer le verset");

        var annotation = await _context.SessionWordAnnotations
            .FirstOrDefaultAsync(w => w.SessionVerseEvaluationId == request.VerseEvaluationId && w.WordId == request.WordId);

        if (annotation != null)
        {
            annotation.AnnotationType = request.AnnotationType;
            annotation.Comment = request.Comment;
        }
        else
        {
            _context.SessionWordAnnotations.Add(new SessionWordAnnotation
            {
                Id = Guid.NewGuid(),
                SessionVerseEvaluationId = request.VerseEvaluationId,
                WordId = request.WordId,
                AnnotationType = request.AnnotationType,
                Comment = request.Comment
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task CompleteSessionAsync(Guid sessionId, string? pedagogicalSummary)
    {
        var session = await _context.Sessions.FindAsync(sessionId);
        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        session.Status = SessionStatus.Completed;
        session.SessionObjective = (session.SessionObjective ?? "") + "\n\nRésumé Pédagogique:\n" + pedagogicalSummary;
        
        await _context.SaveChangesAsync();

        // Trigger progress snapshots for all students who participated
        var participants = await _context.SessionRecitations
            .Where(r => r.SessionId == sessionId)
            .Select(r => r.StudentId)
            .Distinct()
            .ToListAsync();

        // In a real app, this might be a background job.
        // For now, it's handled by IProgressCalculationService later.
    }

    public async Task<SessionReportSummary> GetSessionReportAsync(Guid sessionId)
    {
        var session = await _context.Sessions
            .Include(s => s.Group).ThenInclude(g => g.Students)
            .Include(s => s.Attendances)
            .Include(s => s.Recitations).ThenInclude(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        int present = session.Attendances.Count(a => a.Status == SessionAttendanceStatus.Present || a.Status == SessionAttendanceStatus.Late);
        int totalRecitations = session.Recitations.Count;
        
        int blocked = 0;
        int forgotten = 0;
        int tajwidErrors = 0;

        foreach (var r in session.Recitations)
        {
            foreach (var ve in r.VerseEvaluations)
            {
                if (ve.Status == SessionVerseEvaluationStatus.Blocked) blocked++;
                if (ve.Status == SessionVerseEvaluationStatus.Forgotten) forgotten++;
                if (ve.Status == SessionVerseEvaluationStatus.TajwidError) tajwidErrors++;
                
                // Also count word level ones
                blocked += ve.WordAnnotations.Count(a => a.AnnotationType == SessionWordAnnotationType.Blocked);
                forgotten += ve.WordAnnotations.Count(a => a.AnnotationType == SessionWordAnnotationType.Forgotten);
                tajwidErrors += ve.WordAnnotations.Count(a => a.AnnotationType == SessionWordAnnotationType.TajwidError);
            }
        }

        int totalStudents = session.Group?.Students.Count ?? session.Attendances.Count;

        return new SessionReportSummary(
            session.Date,
            totalStudents,
            present,
            totalStudents - present, // Absents are simply total - present
            totalRecitations,
            blocked,
            forgotten,
            tajwidErrors,
            session.SessionObjective
        );
    }

    public async Task SendParentReportsAsync(Guid sessionId)
    {
        var session = await _context.Sessions
            .Include(s => s.Recitations)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) throw new KeyNotFoundException("Session non trouvée");
        if (session.Status != SessionStatus.Completed) 
            throw new InvalidOperationException("La séance doit être terminée pour envoyer les rapports.");

        // NOTE: Emulating external SMTP/Email behavior with a delay.
        // In a real implementation this would fetch Parent emails from User/Student entities 
        // and dispatch an email template containing their child's specific recitation metrics.
        await Task.Delay(1500); // Simulate network dispatch
    }

    private SessionResponse MapToResponse(Session session)
    {
        return new SessionResponse(
            session.Id,
            session.GroupId,
            session.Group?.Name ?? "",
            session.TeacherId,
            $"{session.Teacher?.FirstName} {session.Teacher?.LastName}".Trim(),
            session.Date,
            session.StartTime ?? "",
            session.EndTime ?? "",
            session.Status,
            session.SessionObjective,
            session.SurahId,
            session.StartVerse,
            session.EndVerse,
            session.IsOnline,
            session.MeetingUrl,
            session.Attendances.Select(a => new SessionAttendanceDto(
                a.Id,
                a.StudentId,
                $"{a.Student?.FirstName} {a.Student?.LastName}",
                a.Status,
                a.Comment
            )).ToList(),
            session.Recitations.Select(r => new SessionRecitationResponse(
                r.Id,
                r.StudentId,
                $"{r.Student?.FirstName} {r.Student?.LastName}",
                r.SurahId,
                r.Surah?.NameEnglish ?? "",
                r.StartVerse,
                r.EndVerse,
                r.RecitationOrder,
                r.GlobalComment,
                r.CreatedAt,
                r.VerseEvaluations.Select(ve => new SessionVerseEvaluationDto(
                    ve.Id,
                    ve.VerseId,
                    ve.Status,
                    ve.AssistanceGiven,
                    ve.Comment,
                    ve.WordAnnotations.Select(wa => new SessionWordAnnotationDto(
                        wa.Id,
                        wa.WordId,
                        wa.AnnotationType,
                        wa.Comment
                    )).ToList()
                )).ToList()
            )).ToList()
        );
    }

    public async Task<SessionCockpitResponse> GetCockpitDataAsync(Guid sessionId)
    {
        var session = await _context.Sessions
            .Include(s => s.Group).ThenInclude(g => g.Level)
            .Include(s => s.Teacher)
            .Include(s => s.Attendances).ThenInclude(a => a.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Student)
            .Include(s => s.Recitations).ThenInclude(r => r.Surah)
            .Include(s => s.Recitations).ThenInclude(r => r.VerseEvaluations).ThenInclude(ve => ve.WordAnnotations)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) throw new KeyNotFoundException("Session non trouvée");

        // Load surahs that belong to the group's level range
        var level = session.Group?.Level;
        var levelSurahs = new List<LevelSurahDto>();
        if (level?.StartSurah != null && level?.EndSurah != null)
        {
            int minSurah = Math.Min(level.StartSurah.Value, level.EndSurah.Value);
            int maxSurah = Math.Max(level.StartSurah.Value, level.EndSurah.Value);
            var surahs = await _context.Surahs
                .Where(s => s.Number >= minSurah && s.Number <= maxSurah)
                .OrderBy(s => s.Number)
                .ToListAsync();
            levelSurahs = surahs.Select(s => new LevelSurahDto(s.Number, s.NameEnglish, s.NameArabic)).ToList();
        }

        var smartQueue = new List<SmartQueueStudentDto>();
        if (session.GroupId.HasValue)
        {
            var queue = await _smartQueueService.GenerateQueueForGroupAsync(session.GroupId.Value, session.Id);
            smartQueue = queue.ToList();
        }

        return new SessionCockpitResponse(
            session.Id,
            session.GroupId,
            session.Group?.Name ?? "",
            session.Group?.Level?.Name ?? "Non défini",
            session.Group?.Level?.StartSurah,
            session.Group?.Level?.EndSurah,
            session.Status,
            session.SessionObjective,
            smartQueue,
            session.Attendances.Select(a => new SessionAttendanceDto(
                a.Id,
                a.StudentId,
                $"{a.Student?.FirstName} {a.Student?.LastName}",
                a.Status,
                a.Comment
            )).ToList(),
            session.Recitations.OrderByDescending(r => r.RecitationOrder).Take(5).Select(r => new SessionRecitationResponse(
                r.Id,
                r.StudentId,
                $"{r.Student?.FirstName} {r.Student?.LastName}",
                r.SurahId,
                r.Surah?.NameEnglish ?? "",
                r.StartVerse,
                r.EndVerse,
                r.RecitationOrder,
                r.GlobalComment,
                r.CreatedAt,
                r.VerseEvaluations.Select(ve => new SessionVerseEvaluationDto(
                    ve.Id,
                    ve.VerseId,
                    ve.Status,
                    ve.AssistanceGiven,
                    ve.Comment,
                    ve.WordAnnotations.Select(wa => new SessionWordAnnotationDto(
                        wa.Id,
                        wa.WordId,
                        wa.AnnotationType,
                        wa.Comment
                    )).ToList()
                )).ToList()
            )).ToList(),
            levelSurahs,
            session.IsOnline,
            session.MeetingUrl
        );
    }

    public async Task BatchEvaluateAsync(Guid sessionId, BatchSessionEvaluationRequest request)
    {
        var recitation = await _context.SessionRecitations
            .Include(r => r.VerseEvaluations)
            .FirstOrDefaultAsync(r => r.Id == request.RecitationId && r.SessionId == sessionId);
            
        if (recitation == null) throw new KeyNotFoundException("Récitation non trouvée");

        foreach (var reqEval in request.VerseEvaluations)
        {
            var existing = recitation.VerseEvaluations.FirstOrDefault(v => v.VerseId == reqEval.VerseId);
            if (existing != null)
            {
                existing.Status = reqEval.Status;
                existing.AssistanceGiven = reqEval.AssistanceGiven;
                existing.Comment = reqEval.Comment;
            }
            else
            {
                _context.SessionVerseEvaluations.Add(new SessionVerseEvaluation
                {
                    Id = Guid.NewGuid(),
                    SessionRecitationId = request.RecitationId,
                    VerseId = reqEval.VerseId,
                    Status = reqEval.Status,
                    AssistanceGiven = reqEval.AssistanceGiven,
                    Comment = reqEval.Comment
                });
            }
        }

        // Award XP for participating in the recitation evaluation
        await _gamificationService.AwardXPAsync(recitation.StudentId, 15, $"Récitation évaluée dans la séance : {sessionId}");
        await _gamificationService.UpdateStreakAsync(recitation.StudentId);

        await _context.SaveChangesAsync();
    }
}
