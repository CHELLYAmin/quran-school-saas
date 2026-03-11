namespace QuranSchool.Domain.Constants;

public static class Permissions
{
    // Dashboard
    public const string DashboardView = "DASHBOARD_VIEW";
    public const string AdminDashboardView = "ADMIN_DASHBOARD_VIEW";

    // Users & Roles
    public const string UsersManage = "USERS_MANAGE";
    public const string RolesManage = "ROLES_MANAGE";

    // Teachers
    public const string TeachersView = "TEACHERS_VIEW";
    public const string TeachersManage = "TEACHERS_MANAGE";

    // Students
    public const string StudentsView = "STUDENTS_VIEW";
    public const string StudentsManage = "STUDENTS_MANAGE";

    // Groups
    public const string GroupsView = "GROUPS_VIEW";
    public const string GroupsManage = "GROUPS_MANAGE";

    // Sessions & Scheduling
    public const string SessionsView = "SESSIONS_VIEW";
    public const string SessionsManage = "SESSIONS_MANAGE";
    public const string ScheduleView = "SCHEDULE_VIEW";
    public const string ScheduleManage = "SCHEDULE_MANAGE";

    // Attendance
    public const string AttendanceView = "ATTENDANCE_VIEW";
    public const string AttendanceManage = "ATTENDANCE_MANAGE";

    // Exams & Progress
    public const string ExamsView = "EXAMS_VIEW";
    public const string ExamsManage = "EXAMS_MANAGE";
    public const string ProgressView = "PROGRESS_VIEW";
    public const string ProgressManage = "PROGRESS_MANAGE";

    // Payments
    public const string PaymentsView = "PAYMENTS_VIEW";
    public const string PaymentsManage = "PAYMENTS_MANAGE";

    // Communication
    public const string MessagesView = "MESSAGES_VIEW";
    public const string MessagesSend = "MESSAGES_SEND";
    public const string HomeworkView = "HOMEWORK_VIEW";
    public const string HomeworkManage = "HOMEWORK_MANAGE";

    // Mushaf
    public const string MushafView = "MUSHAF_VIEW";

    // Settings
    public const string SettingsView = "SETTINGS_VIEW";
    public const string SettingsManage = "SETTINGS_MANAGE";

    // Finance & RH (SaaS V3)
    public const string FinanceView = "FINANCE_VIEW";
    public const string FinanceManage = "FINANCE_MANAGE";
    public const string StaffView = "STAFF_VIEW";
    public const string StaffManage = "STAFF_MANAGE";

    public static readonly IReadOnlyList<string> All = new[]
    {
        DashboardView, AdminDashboardView,
        UsersManage, RolesManage,
        TeachersView, TeachersManage,
        StudentsView, StudentsManage,
        GroupsView, GroupsManage,
        SessionsView, SessionsManage, ScheduleView, ScheduleManage,
        AttendanceView, AttendanceManage,
        ExamsView, ExamsManage, ProgressView, ProgressManage,
        PaymentsView, PaymentsManage,
        MessagesView, MessagesSend, HomeworkView, HomeworkManage,
        MushafView, SettingsView, SettingsManage,
        FinanceView, FinanceManage, StaffView, StaffManage
    };
}
