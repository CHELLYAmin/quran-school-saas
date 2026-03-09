import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';

export const Permissions = {
    // Dashboard
    DashboardView: 'DASHBOARD_VIEW',
    AdminDashboardView: 'ADMIN_DASHBOARD_VIEW',
    ParentDashboardView: 'PARENT_DASHBOARD_VIEW',

    // Users & Roles
    UsersManage: 'USERS_MANAGE',
    UsersView: 'USERS_VIEW',
    RolesManage: 'ROLES_MANAGE',

    // Teachers
    TeachersView: 'TEACHERS_VIEW',
    TeachersManage: 'TEACHERS_MANAGE',

    // Students
    StudentsView: 'STUDENTS_VIEW',
    StudentsManage: 'STUDENTS_MANAGE',

    // Groups
    GroupsView: 'GROUPS_VIEW',
    GroupsManage: 'GROUPS_MANAGE',

    // Sessions & Scheduling
    SessionsView: 'SESSIONS_VIEW',
    SessionsManage: 'SESSIONS_MANAGE',
    ScheduleView: 'SCHEDULE_VIEW',
    ScheduleManage: 'SCHEDULE_MANAGE',

    // Attendance
    AttendanceView: 'ATTENDANCE_VIEW',
    AttendanceManage: 'ATTENDANCE_MANAGE',

    // Exams & Progress
    ExamsView: 'EXAMS_VIEW',
    ExamsManage: 'EXAMS_MANAGE',
    ProgressView: 'PROGRESS_VIEW',
    ProgressManage: 'PROGRESS_MANAGE',

    // Payments
    PaymentsView: 'PAYMENTS_VIEW',
    PaymentsManage: 'PAYMENTS_MANAGE',

    // Communication
    MessagesView: 'MESSAGES_VIEW',
    MessagesSend: 'MESSAGES_SEND',
    HomeworkView: 'HOMEWORK_VIEW',
    HomeworkManage: 'HOMEWORK_MANAGE',

    // Mushaf
    MushafView: 'MUSHAF_VIEW',

    // Settings
    SettingsManage: 'SETTINGS_MANAGE',
    SettingsView: 'SETTINGS_VIEW', // Added for consistency with layout.tsx
};

export function usePermission() {
    const { user } = useAuthStore();

    const isSuperAdmin = user?.roles?.includes(UserRole.SuperAdmin);

    const hasPermission = (permission: string) => {
        if (isSuperAdmin) return true;
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]) => {
        if (isSuperAdmin) return true;
        if (!user || !user.permissions) return false;
        return permissions.some((p) => user.permissions!.includes(p));
    };

    const hasAllPermissions = (permissions: string[]) => {
        if (isSuperAdmin) return true;
        if (!user || !user.permissions) return false;
        return permissions.every((p) => user.permissions!.includes(p));
    };

    return { hasPermission, hasAnyPermission, hasAllPermissions };
}
