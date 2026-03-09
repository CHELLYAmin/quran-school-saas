namespace QuranSchool.Application.DTOs.Dashboard;

public record AdminDashboardResponse(
    int TotalStudents,
    int ActiveStudents,
    int TotalTeachers,
    int TotalGroups,
    decimal MonthlyRevenue,
    decimal TotalRevenue,
    double AverageProgress,
    double ExamPassRate,
    double AttendanceRate,
    int OverduePaymentsCount, // New
    int ExamsThisMonthCount, // New
    List<MonthlyRevenueItem> RevenueHistory,
    List<GroupProgressItem> GroupProgress
);

public record TeacherDashboardResponse(
    int TotalStudents,
    int GroupCount,
    double AverageProgress,
    List<StudentProgressItem> StudentsNeedingAttention,
    List<UpcomingExamItem> UpcomingExams,
    List<PendingHomeworkItem> AssignmentsToGrade // New
);

public record ParentDashboardResponse(
    List<ChildDashboardItem> Children // Refactored to list of detailed child views
);

public record StudentDashboardResponse( // New
    string StudentName,
    string GroupName,
    double AttendanceRate,
    int Points,
    List<UpcomingClassItem> UpcomingClasses,
    List<PendingHomeworkItem> Homeworks,
    List<UpcomingExamItem> Exams,
    StudentProgressSummaryItem Progress
);

// Helper DTOs
public record MonthlyRevenueItem(string Month, decimal Amount);
public record GroupProgressItem(string GroupName, double AverageProgress, int StudentCount);
public record StudentProgressItem(Guid StudentId, string StudentName, double Progress, string Status, string? AlertMessage); // Added AlertMessage
public record UpcomingExamItem(Guid ExamId, string Title, DateTime ExamDate, string GroupName);
public record PendingHomeworkItem(Guid Id, Guid? HomeworkId, string Title, DateTime DueDate, string Status, string? GroupName); // New

public record ChildDashboardItem(
    Guid StudentId,
    string FullName,
    string GroupName,
    double AttendanceRate,
    StudentProgressSummaryItem Progress,
    List<UpcomingExamItem> UpcomingExams,
    List<PendingHomeworkItem> PendingHomeworks,
    List<RecentResultItem> RecentResults, // New
    List<UpcomingClassItem> Schedule // New
);

public record StudentProgressSummaryItem(
    int JuzCompleted,
    int SurahsMemorized,
    int CurrentJuz,
    string LastSurah
);

public record RecentResultItem(string Title, string Type, int? Grade, string Feedback, DateTime Date);
public record UpcomingClassItem(string Subject, DateTime StartTime, DateTime EndTime, string Room);

// Removed: PaymentSummaryItem from ParentDashboard (as per V2 requirement)
