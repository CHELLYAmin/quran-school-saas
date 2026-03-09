namespace QuranSchool.Domain.Enums;

public enum SessionStatus
{
    Planned,
    InProgress,
    Completed,
    Cancelled
}

public enum SessionAttendanceStatus
{
    Present,
    Absent,
    Late,
    Excused
}

public enum SessionVerseEvaluationStatus
{
    Correct,
    Blocked,
    Forgotten,
    TajwidError
}

public enum SessionWordAnnotationType
{
    Blocked,
    Forgotten,
    TajwidError
}
