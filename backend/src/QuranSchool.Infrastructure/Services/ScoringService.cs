using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.Interfaces;
using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.Infrastructure.Services;

public class ScoringService : IScoringService
{
    // Penalty weights
    private const decimal BLOCK_PENALTY = 2.0m;
    private const decimal FORGOTTEN_PENALTY = 5.0m;
    private const decimal TAJWID_PENALTY = 1.0m;
    private const decimal ASSISTANCE_PENALTY = 1.5m;

    public decimal CalculateScore(Exam exam)
    {
        decimal totalPenalty = 0;
        
        foreach (var verseEval in exam.VerseEvaluations)
        {
            if (verseEval.Status == VerseEvaluationStatus.Blocked) totalPenalty += BLOCK_PENALTY;
            if (verseEval.Status == VerseEvaluationStatus.Forgotten) totalPenalty += FORGOTTEN_PENALTY;
            if (verseEval.AssistanceGiven) totalPenalty += ASSISTANCE_PENALTY;

            foreach (var wordAnnot in verseEval.WordAnnotations)
            {
                if (wordAnnot.AnnotationType == WordAnnotationType.Blocked) totalPenalty += BLOCK_PENALTY;
                if (wordAnnot.AnnotationType == WordAnnotationType.Forgotten) totalPenalty += FORGOTTEN_PENALTY;
                if (wordAnnot.AnnotationType == WordAnnotationType.TajwidError) totalPenalty += TAJWID_PENALTY;
            }
        }

        var score = 100 - totalPenalty;
        return score < 0 ? 0 : score;
    }
}
