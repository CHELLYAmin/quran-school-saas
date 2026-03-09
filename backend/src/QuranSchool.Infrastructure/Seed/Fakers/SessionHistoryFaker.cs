using Bogus;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;

namespace QuranSchool.Infrastructure.Seed.Fakers;

public class SessionHistoryFaker
{
    private readonly Guid _schoolId;
    private readonly Faker _faker;

    public SessionHistoryFaker(Guid schoolId)
    {
        _schoolId = schoolId;
        _faker = new Faker();
        Randomizer.Seed = new Random(8675309);
    }

    public List<Session> GenerateHistoricalSessions(
        Group group, 
        List<Student> studentsInGroup, 
        List<Surah> allSurahs,
        int monthsBack = 1)
    {
        var sessions = new List<Session>();
        var currentDate = DateTime.UtcNow;
        var startDate = currentDate.AddMonths(-monthsBack);

        // Determine Surah constraints based on the Level
        var minSurah = group.Level?.StartSurah ?? 1;
        var maxSurah = group.Level?.EndSurah ?? 114;
        
        // Ensure boundaries are ordered
        var validStart = Math.Min(minSurah, maxSurah);
        var validEnd = Math.Max(minSurah, maxSurah);

        var validSurahsForGroup = allSurahs
            .Where(s => s.Number >= validStart && s.Number <= validEnd)
            .OrderBy(s => s.Number)
            .ToList();

        if (validSurahsForGroup.Count == 0)
        {
            // Fallback if level rules are broken
            validSurahsForGroup = allSurahs;
        }

        // Simulate sessions every Wednesday and Saturday (for example)
        for (var date = startDate; date <= currentDate; date = date.AddDays(1))
        {
            if (date.DayOfWeek == DayOfWeek.Wednesday || date.DayOfWeek == DayOfWeek.Saturday)
            {
                var sessionSurah = _faker.PickRandom(validSurahsForGroup);
                
                // Safety check: skip if Surah has no verses loaded in memory for seeding
                if (sessionSurah.Verses == null || !sessionSurah.Verses.Any()) continue;

                var totalVerses = sessionSurah.Verses.Count;
                var startVerse = _faker.Random.Int(1, Math.Max(1, totalVerses - 5));
                var endVerse = Math.Min(totalVerses, startVerse + _faker.Random.Int(2, 6));

                var session = new Session
                {
                    Id = Guid.NewGuid(),
                    SchoolId = _schoolId,
                    GroupId = group.Id,
                    TeacherId = group.TeacherId ?? Guid.Empty,
                    Date = date,
                    StartTime = "14:00",
                    EndTime = "16:00",
                    Status = SessionStatus.Completed,
                    SessionObjective = $"Récitation Sourate {sessionSurah.NameEnglish} (Versets {startVerse}-{endVerse})",
                    SurahId = sessionSurah.Id,
                    StartVerse = startVerse,
                    EndVerse = endVerse,
                    CreatedAt = date.AddHours(-1),
                    UpdatedAt = date.AddHours(2)
                };

                // Generate Attendances (mostly present)
                var attendances = new List<SessionAttendance>();
                var recitations = new List<SessionRecitation>();

                foreach (var student in studentsInGroup)
                {
                    var isPresent = _faker.Random.Bool(0.85f); // 85% attendance
                    var attendance = new SessionAttendance
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        StudentId = student.Id,
                        Status = isPresent ? SessionAttendanceStatus.Present : SessionAttendanceStatus.Absent,
                        Comment = isPresent ? "" : _faker.PickRandom(new[] { "Maladie", "Motif personnel", "Inconnu" })
                    };
                    attendances.Add(attendance);

                    if (isPresent)
                    {
                        var recitation = GenerateRecitation(session, student, sessionSurah, startVerse, endVerse);
                        recitations.Add(recitation);
                    }
                }

                session.Attendances = attendances;
                session.Recitations = recitations;
                
                sessions.Add(session);
            }
        }

        return sessions;
    }

    private SessionRecitation GenerateRecitation(Session session, Student student, Surah surah, int startV, int endV)
    {
        var recitation = new SessionRecitation
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            StudentId = student.Id,
            SurahId = surah.Id,
            StartVerse = startV,
            EndVerse = endV,
            RecitationOrder = _faker.Random.Int(1, 20),
            GlobalComment = _faker.Random.Bool(0.7f) ? "Masha'Allah, bonne lecture globale." : "Des erreurs récurrentes, il faut réviser la prononciation."
        };

        var verseEvaluations = new List<SessionVerseEvaluation>();
        
        // Safety bounds
        var recitedVerses = surah.Verses!
            .Where(v => v.VerseNumber >= startV && v.VerseNumber <= endV)
            .ToList();

        foreach (var verse in recitedVerses)
        {
            // 70% Correct, 15% Tajwid Error, 10% Blocked, 5% Forgotten
            var statusChoice = _faker.Random.Double();
            var status = SessionVerseEvaluationStatus.Correct;
            
            if (statusChoice > 0.95) status = SessionVerseEvaluationStatus.Forgotten;
            else if (statusChoice > 0.85) status = SessionVerseEvaluationStatus.Blocked;
            else if (statusChoice > 0.70) status = SessionVerseEvaluationStatus.TajwidError;

            var evaluation = new SessionVerseEvaluation
            {
                Id = Guid.NewGuid(),
                SessionRecitationId = recitation.Id,
                VerseId = verse.Id,
                Status = status,
                AssistanceGiven = status == SessionVerseEvaluationStatus.Blocked || status == SessionVerseEvaluationStatus.Forgotten,
                Comment = status == SessionVerseEvaluationStatus.Correct ? "" : "Nécessite de l'attention"
            };

            // If there's an error, mark a random word in the verse (if words exist)
            if (status != SessionVerseEvaluationStatus.Correct && verse.Words != null && verse.Words.Any())
            {
                var randomWord = _faker.PickRandom(verse.Words);
                var wordAnnotation = new SessionWordAnnotation
                {
                    Id = Guid.NewGuid(),
                    SessionVerseEvaluationId = evaluation.Id,
                    WordId = randomWord.Id,
                    AnnotationType = status == SessionVerseEvaluationStatus.TajwidError ? SessionWordAnnotationType.TajwidError 
                                   : (status == SessionVerseEvaluationStatus.Blocked ? SessionWordAnnotationType.Blocked : SessionWordAnnotationType.Forgotten)
                };
                evaluation.WordAnnotations = new List<SessionWordAnnotation> { wordAnnotation };
            }

            verseEvaluations.Add(evaluation);
        }

        recitation.VerseEvaluations = verseEvaluations;
        return recitation;
    }
}
