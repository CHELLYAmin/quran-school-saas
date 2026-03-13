'use client';
import axios from 'axios';
import { 
    LoginRequest, RegisterRequest, UserResponse, SchoolResponse, 
    StudentResponse, StudentListResponse, GroupResponse, LevelResponse,
    MessageResponse, NotificationResponse, ExamResponse, PaymentApiResponse,
    ProgressResponse, ScheduleResponse, StudentMissionResponse,
    SurahResponse, SessionResponse, HomeworkResponse, HomeworkAssignmentResponse,
    CreateManualMissionRequest, ProvideMissionFeedbackRequest
} from '@/types';
import { RoleResponse } from '@/types/role';
import { ParentResponse, CreateParentRequest, UpdateParentRequest } from '@/types/parent';

const getBaseUrl = () => {
    // Priorité à la variable d'environnement (configurée dans Amplify)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Si on est en production (pas localhost), on utilise la nouvelle URL par défaut
        if (hostname !== 'localhost' && !hostname.includes('127.0.0.1')) {
            return 'https://grgvcjsiap.us-east-1.awsapprunner.com';
        }
    }
    
    // Fallback par défaut (utile pour le build local si .env absent)
    return 'https://grgvcjsiap.us-east-1.awsapprunner.com';
};

const ROOT_URL = getBaseUrl();

const api = axios.create({
    baseURL: ROOT_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authApi = {
    login: (data: LoginRequest) => api.post('/api/auth/login', data),
    register: (data: RegisterRequest) => api.post('/api/auth/register', data),
    me: () => api.get<UserResponse>('/api/auth/me'),
};

export const userApi = {
    getAll: () => api.get<UserResponse[]>('/api/user'),
    getTeachers: () => api.get<UserResponse[]>('/api/user/teachers'),
    getByRoles: (roles: string[]) => api.post<UserResponse[]>('/api/user/by-roles', { roles }),
    getById: (id: string) => api.get<UserResponse>(`/api/user/${id}`),
    create: (data: any) => api.post<UserResponse>('/api/user', data),
    update: (id: string, data: any) => api.put(`/api/user/${id}`, data),
    updateRoles: (id: string, roleNames: string[]) => api.put(`/api/user/${id}/roles`, { roleNames }),
    delete: (id: string) => api.delete(`/api/user/${id}`),
};

export const schoolApi = {
    get: () => api.get<SchoolResponse>('/api/school'),
    update: (data: any) => api.put('/api/school', data),
};

export const roleApi = {
    getAll: () => api.get<RoleResponse[]>('/api/role'),
    getById: (id: string) => api.get<RoleResponse>(`/api/role/${id}`),
    getAllPermissions: () => api.get('/api/role/permissions'),
    create: (data: any) => api.post('/api/role', data),
    update: (id: string, data: any) => api.put(`/api/role/${id}`, data),
    assignPermissions: (id: string, data: any) => api.put(`/api/role/${id}/permissions`, data),
    delete: (id: string) => api.delete(`/api/role/${id}`),
};

export const mosqueApi = {
    getSettings: () => api.get('/api/MosqueSettings'),
    updateSettings: (data: any) => api.put('/api/MosqueSettings', data),
};

export const parentApi = {
    getAll: () => api.get<ParentResponse[]>('/api/parent'),
    getById: (id: string) => api.get<ParentResponse>(`/api/parent/${id}`),
    create: (data: CreateParentRequest) => api.post('/api/parent', data),
    update: (id: string, data: UpdateParentRequest) => api.put(`/api/parent/${id}`, data),
    delete: (id: string) => api.delete(`/api/parent/${id}`),
};

export const studentApi = {
    getAll: () => api.get<StudentListResponse[]>('/api/student'),
    getById: (id: string) => api.get<StudentResponse>(`/api/student/${id}`),
    getByGroup: (groupId: string) => api.get<StudentListResponse[]>(`/api/student/group/${groupId}`),
    create: (data: any) => api.post('/api/student', data),
    update: (id: string, data: any) => api.put(`/api/student/${id}`, data),
    delete: (id: string) => api.delete(`/api/student/${id}`),
};

export const groupApi = {
    getAll: () => api.get<GroupResponse[]>('/api/group'),
    getById: (id: string) => api.get<GroupResponse>(`/api/group/${id}`),
    create: (data: any) => api.post('/api/group', data),
    update: (id: string, data: any) => api.put(`/api/group/${id}`, data),
    delete: (id: string) => api.delete(`/api/group/${id}`),
};

export const levelApi = {
    getAll: () => api.get<LevelResponse[]>('/api/level'),
    getById: (id: string) => api.get<LevelResponse>(`/api/level/${id}`),
    create: (data: any) => api.post('/api/level', data),
    update: (id: string, data: any) => api.put(`/api/level/${id}`, data),
    delete: (id: string) => api.delete(`/api/level/${id}`),
};

export const messagingApi = {
    getConversations: () => api.get('/api/messaging/conversations'),
    getMessages: (userId: string) => api.get<MessageResponse[]>(`/api/messaging/messages/${userId}`),
    sendMessage: (data: any) => api.post('/api/messaging/send', data),
};

export const notificationApi = {
    getAll: () => api.get<NotificationResponse[]>('/api/notification'),
    markAsRead: (id: string) => api.put(`/api/notification/${id}/read`),
};

export const dashboardApi = {
    getAdmin: () => api.get('/api/dashboard/admin'),
    getTeacher: (teacherId: string) => api.get(`/api/dashboard/teacher/${teacherId}`),
    getParent: (parentId: string) => api.get(`/api/dashboard/parent/${parentId}`),
    getStudent: (studentId: string) => api.get(`/api/dashboard/student/${studentId}`),
};

export const mushafApi = {
    getSurahs: () => api.get<SurahResponse[]>('/api/mushaf/surahs'),
    getSurah: (id: string) => api.get<SurahResponse>(`/api/mushaf/surahs/${id}`),
    getVerses: (surahId: string, from?: number, to?: number) => api.get<any[]>(`/api/mushaf/surahs/${surahId}/verses`, { params: { from, to } }),
    getSettings: () => api.get('/api/mushaf/settings'),
};

export const onlineSessionApi = {
    getById: (id: string) => api.get(`/api/online-sessions/${id}`),
    create: (data: any) => api.post('/api/online-sessions', data),
    updateStatus: (id: string, status: string) => api.patch(`/api/online-sessions/${id}/status`, { status }),
};

export const examApi = {
    getAll: () => api.get<ExamResponse[]>('/api/exam'),
    getById: (id: string) => api.get<ExamResponse>(`/api/exam/${id}`),
    getByStudent: (studentId: string) => api.get<ExamResponse[]>(`/api/exam/student/${studentId}`),
    create: (data: any) => api.post('/api/exam', data),
    start: (data: any) => api.post('/api/exam/start', data),
    markInProgress: (id: string) => api.post(`/api/exam/${id}/in-progress`),
    getReport: (id: string) => api.get(`/api/exam/${id}/report`),
    annotateVerse: (examId: string, data: any) => api.post(`/api/exam/${examId}/annotate-verse`, data),
    complete: (examId: string, comment: string) => api.post(`/api/exam/${examId}/complete`, { comment }),
    cancel: (id: string) => api.post(`/api/exam/${id}/cancel`),
    delete: (id: string) => api.delete(`/api/exam/${id}`),
};

export const certificateApi = {
    getAll: () => api.get('/api/certificate'),
    getById: (id: string) => api.get(`/api/certificate/${id}`),
};

export const teacherAttendanceApi = {
    getAll: () => api.get('/api/teacherattendance'),
    getByDate: (date: string) => api.get(`/api/teacherattendance/date/${date}`),
    mark: (data: any) => api.post('/api/teacherattendance', data),
    bulkMark: (data: any) => api.post('/api/teacherattendance/bulk', data),
};

export const attendanceApi = {
    getAll: () => api.get('/api/attendance'),
    getById: (id: string) => api.get(`/api/attendance/${id}`),
    getByDate: (date: string) => api.get<any>(`/api/attendance/date/${date}`),
    bulkMark: (data: any) => api.post('/api/attendance/bulk', data),
};

export const teacherPaymentApi = {
    getAll: () => api.get('/api/teacher-payment'),
    getById: (id: string) => api.get(`/api/teacher-payment/${id}`),
};

export const analyticsApi = {
    getAdmin: () => api.get('/api/analytics/admin'),
    getTeacher: (teacherId: string) => api.get(`/api/analytics/teacher/${teacherId}`),
    getStudent: (studentId: string) => api.get(`/api/analytics/student/${studentId}`),
    getParent: (parentId: string) => api.get(`/api/analytics/parent/${parentId}`),
};

export const progressApi = {
    getAll: () => api.get('/api/progress'),
    getById: (id: string) => api.get(`/api/progress/${id}`),
    getByStudent: (studentId: string) => api.get(`/api/progress/student/${studentId}`),
    create: (data: any) => api.post('/api/progress', data),
    update: (id: string, data: any) => api.put(`/api/progress/${id}`, data),
    delete: (id: string) => api.delete(`/api/progress/${id}`),
};

export const scheduleApi = {
    getAll: () => api.get<ScheduleResponse[]>('/api/schedule'),
    getById: (id: string) => api.get<ScheduleResponse>(`/api/schedule/${id}`),
    create: (data: any) => api.post('/api/schedule', data),
    update: (id: string, data: any) => api.put(`/api/schedule/${id}`, data),
    delete: (id: string) => api.delete(`/api/schedule/${id}`),
};

export const sessionApi = {
    getAll: () => api.get('/api/session'),
    getById: (id: string) => api.get(`/api/session/${id}`),
    getByGroup: (groupId: string) => api.get(`/api/session/group/${groupId}`),
    getCockpit: (id: string) => api.get(`/api/session/${id}/cockpit`),
    create: (data: any) => api.post('/api/session', data),
    updateStatus: (id: string, status: string) => api.put(`/api/session/${id}/status`, status, { headers: { 'Content-Type': 'application/json' } }),
    assignGroup: (id: string, groupId: string) => api.put(`/api/session/${id}/assign-group/${groupId}`),
    markAttendance: (id: string, data: any) => api.post(`/api/session/${id}/attendance`, data),
    complete: (id: string, pedagogicalSummary?: string) => api.post(`/api/session/${id}/complete`, pedagogicalSummary ? `"${pedagogicalSummary}"` : null, { headers: { 'Content-Type': 'application/json' } }),
    sendReports: (id: string) => api.post(`/api/session/${id}/send-reports`),
    startRecitation: (sessionId: string, data: any) => api.post(`/api/session/${sessionId}/recitation`, data),
    getReport: (id: string) => api.get(`/api/session/${id}/report`),
    batchEvaluate: (id: string, data: any) => api.post(`/api/session/${id}/evaluations/batch`, data),
};


export const missionApi = {
    getStudentMissions: (studentId: string) => api.get<StudentMissionResponse[]>(`/api/missions/student/${studentId}`),
    getGroupMissions: (groupId: string) => api.get<StudentMissionResponse[]>(`/api/missions/group/${groupId}`),
    create: (data: CreateManualMissionRequest) => api.post('/api/missions', data),
    createGroupMission: (groupId: string, data: any) => api.post(`/api/missions/group/${groupId}`, data),
    complete: (id: string, data: any) => api.put(`/api/missions/${id}/complete`, data),
    submitAudio: (id: string, data: any) => api.post(`/api/missions/${id}/submit-audio`, data),
    provideFeedback: (id: string, data: ProvideMissionFeedbackRequest) => api.post(`/api/missions/${id}/feedback`, data),
    getPendingEvaluations: () => api.get<StudentMissionResponse[]>('/api/missions/evaluations/pending'),
};


export const homeworkApi = {
    getAll: () => api.get('/api/homework'),
    getById: (id: string) => api.get(`/api/homework/${id}`),
    getByTeacher: () => api.get('/api/homework/teacher'),
    getMyAssignments: () => api.get('/api/homework/my-assignments'),
    getAssignmentById: (id: string) => api.get<HomeworkAssignmentResponse>(`/api/homework/assignment/${id}`),
    getAssignments: (homeworkId: string) => api.get<HomeworkAssignmentResponse[]>(`/api/homework/${homeworkId}/assignments`),
    submitAssignment: (assignmentId: string, data: any) => api.post(`/api/homework/assignment/${assignmentId}/submit`, data),
    gradeAssignment: (assignmentId: string, data: any) => api.post(`/api/homework/assignment/${assignmentId}/grade`, data),
    create: (data: any) => api.post('/api/homework', data),
    update: (id: string, data: any) => api.put(`/api/homework/${id}`, data),
    delete: (id: string) => api.delete(`/api/homework/${id}`),
};

export const volunteerApi = {
    getMissions: () => api.get('/api/volunteer/missions'),
    getMissionById: (id: string) => api.get(`/api/volunteer/missions/${id}`),
    getSignups: () => api.get('/api/volunteer/signups'),
    createSignup: (data: any) => api.post('/api/volunteer/signup', data),
};

export const donationApi = {
    getCampaigns: (published?: boolean) => api.get('/api/donation/campaigns', { params: { published } }),
    getCampaignById: (id: string) => api.get(`/api/donation/campaign/${id}`),
    getRecords: () => api.get<any[]>('/api/donation/records'),
    createCheckoutSession: (campaignId: string, amount: number, isAnonymous: boolean) => 
        api.post(`/api/donation/checkout`, { campaignId, amount, isAnonymous }),
};

export const financeApi = {
    getSummary: () => api.get('/api/finance/summary'),
    getTransactions: (params?: any) => api.get('/api/finance/transactions', { params }),
    getProjects: () => api.get('/api/finance/projects'),
    getDonors: () => api.get('/api/finance/donors'),
    createTransaction: (data: any) => api.post('/api/finance/transactions', data),
};

export const staffApi = {
    getAll: () => api.get('/api/staff'),
    getContracts: () => api.get('/api/staff/contracts'),
    getAbsences: () => api.get('/api/staff/absences'),
    createAbsence: (data: any) => api.post('/api/staff/absences', data),
};

export const paymentApi = {
    getAll: () => api.get<PaymentApiResponse[]>(`/api/payment`),
    getById: (id: string) => api.get<PaymentApiResponse>(`/api/payment/${id}`),
    getPayments: () => api.get<PaymentApiResponse[]>('/api/payment'),
    getParentPayments: (parentId: string) => api.get<PaymentApiResponse[]>(`/api/payment/parent/${parentId}`),
    createCheckoutSession: (paymentId: string, successUrl: string, cancelUrl: string) =>
        api.post(`/api/payment/${paymentId}/checkout`, { successUrl, cancelUrl }),
    markAsPaid: (id: string) => api.post(`/api/payment/${id}/mark-paid`),
};

export const reportApi = {
    downloadStudentPdf: (studentId: string) => api.get(`/api/report/student/${studentId}/progress-pdf`, { responseType: 'blob' }),
};

export default api;
