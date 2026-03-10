import axios from 'axios';
import { 
    LoginRequest, RegisterRequest, UserResponse, SchoolResponse, 
    StudentResponse, StudentListResponse, GroupResponse, LevelResponse,
    MessageResponse, NotificationResponse, ExamResponse, PaymentResponse,
    ProgressResponse, ScheduleResponse, StudentMissionResponse,
    CreateManualMissionRequest, ProvideMissionFeedbackRequest
} from '@/types';

const ROOT_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: ROOT_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post(`${ROOT_URL}/api/auth/refresh`, { token, refreshToken });
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
    register: (data: RegisterRequest) => api.post('/api/auth/register', data),
    logout: () => api.post('/api/auth/logout'),
};

export const dashboardApi = {
    getStudent: (id: string) => api.get(`/api/dashboard/student/${id}`),
    getParent: (id: string) => api.get(`/api/dashboard/parent/${id}`),
    getAdmin: () => api.get('/api/dashboard/admin'),
    getTeacher: (id: string) => api.get(`/api/dashboard/teacher/${id}`),
};

export const teacherApi = {
    getAll: () => api.get<UserResponse[]>('/api/teacher'),
    getById: (id: string) => api.get<UserResponse>(`/api/teacher/${id}`),
    create: (data: any) => api.post('/api/teacher', data),
    update: (id: string, data: any) => api.put(`/api/teacher/${id}`, data),
    delete: (id: string) => api.delete(`/api/teacher/${id}`),
};

export const adminApi = {
    getStats: () => api.get('/api/admin/stats'),
};

export const userApi = {
    getAll: () => api.get<UserResponse[]>('/api/user'),
    getById: (id: string) => api.get<UserResponse>(`/api/user/${id}`),
    getByRoles: (roles: string[]) => api.get<UserResponse[]>(`/api/user/roles?roles=${roles.join(',')}`),
    create: (data: any) => api.post('/api/user', data),
    update: (id: string, data: any) => api.put(`/api/user/${id}`, data),
    updateRoles: (id: string, roles: string[]) => api.put(`/api/user/${id}/role`, roles),
    delete: (id: string) => api.delete(`/api/user/${id}`),
};

export const roleApi = {
    getAll: () => api.get('/api/role'),
    getAllPermissions: () => api.get('/api/role/permissions'),
    create: (data: any) => api.post('/api/role', data),
    update: (id: string, data: any) => api.put(`/api/role/${id}`, data),
    delete: (id: string) => api.delete(`/api/role/${id}`),
    assignPermissions: (id: string, data: any) => api.post(`/api/role/${id}/permissions`, data),
};

export const studentApi = {
    getAll: () => api.get<StudentListResponse[]>('/api/student'),
    getById: (id: string) => api.get<StudentResponse>(`/api/student/${id}`),
    getByGroup: (groupId: string) => api.get<StudentListResponse[]>(`/api/student/group/${groupId}`),
    create: (data: any) => api.post('/api/student', data),
    update: (id: string, data: any) => api.put(`/api/student/${id}`, data),
    delete: (id: string) => api.delete(`/api/student/${id}`),
};

export const parentApi = {
    getAll: () => api.get<UserResponse[]>('/api/parent'),
    getById: (id: string) => api.get<UserResponse>(`/api/parent/${id}`),
    create: (data: any) => api.post('/api/parent', data),
    update: (id: string, data: any) => api.put(`/api/parent/${id}`, data),
    delete: (id: string) => api.delete(`/api/parent/${id}`),
};

export const groupApi = {
    getAll: () => api.get<GroupResponse[]>('/api/group'),
    getById: (id: string) => api.get<GroupResponse>(`/api/group/${id}`),
    create: (data: any) => api.post('/api/group', data),
    update: (id: string, data: any) => api.put(`/api/group/${id}`, data),
    delete: (id: string) => api.delete(`/api/group/${id}`),
};

export const scheduleApi = {
    getAll: () => api.get<ScheduleResponse[]>('/api/schedule'),
    create: (data: any) => api.post('/api/schedule', data),
};

export const attendanceApi = {
    getBySession: (sessionId: string) => api.get<any[]>(`/api/attendance/session/${sessionId}`),
    getByDate: (date: string) => api.get<any[]>(`/api/attendance/date/${date}`),
    submit: (data: any) => api.post('/api/attendance', data),
    bulkMark: (data: any) => api.post('/api/attendance/bulk', data),
};

export const progressApi = {
    getAll: () => api.get<ProgressResponse[]>('/api/progress'),
    getStudentProgress: (studentId: string) => api.get<ProgressResponse[]>(`/api/progress/student/${studentId}`),
    getGroupProgress: (groupId: string) => api.get<ProgressResponse[]>(`/api/progress/group/${groupId}`),
    create: (data: any) => api.post('/api/progress', data),
    update: (id: string, data: any) => api.put(`/api/progress/${id}`, data),
    delete: (id: string) => api.delete(`/api/progress/${id}`),
};

export const mushafApi = {
    getSurahs: () => api.get('/api/mushaf/surahs'),
    getAyahsBySurah: (surahNumber: number) => api.get(`/api/mushaf/surah/${surahNumber}`),
    getVerses: (surahId: string, start: number, end: number) => api.get(`/api/mushaf/surah/${surahId}/verses?start=${start}&end=${end}`),
};

export const levelApi = {
    getAll: () => api.get<LevelResponse[]>('/api/level'),
    getById: (id: string) => api.get<LevelResponse>(`/api/level/${id}`),
    create: (data: any) => api.post('/api/level', data),
    update: (id: string, data: any) => api.put(`/api/level/${id}`, data),
    delete: (id: string) => api.delete(`/api/level/${id}`),
};

export const messageApi = {
    getThreads: () => api.get('/api/messages/threads'),
    getMessages: (threadId: string) => api.get<MessageResponse[]>(`/api/messages/thread/${threadId}`),
    send: (data: any) => api.post('/api/messages', data),
};

export const homeworkApi = {
    getAll: () => api.get('/api/homework'),
    getById: (id: string) => api.get(`/api/homework/${id}`),
    create: (data: any) => api.post('/api/homework', data),
    update: (id: string, data: any) => api.put(`/api/homework/${id}`, data),
    delete: (id: string) => api.delete(`/api/homework/${id}`),
    getByTeacher: () => api.get('/api/homework/teacher'),
    getMyAssignments: () => api.get('/api/homework/student/my-assignments'),
    getAssignments: (id: string) => api.get(`/api/homework/${id}/assignments`),
    getAssignmentsByStudent: (studentId: string) => api.get(`/api/homework/student/${studentId}`),
    getAssignmentById: (id: string) => api.get(`/api/homework/assignment/${id}`),
    submitAssignment: (id: string, data: any) => api.post(`/api/homework/${id}/submit`, data),
    gradeAssignment: (id: string, data: any) => api.post(`/api/homework/assignment/${id}/grade`, data),
};

export const onlineSessionApi = {
    getById: (id: string) => api.get(`/api/online-sessions/${id}`),
    create: (data: any) => api.post('/api/online-sessions', data),
    updateStatus: (id: string, status: string) => api.patch(`/api/online-sessions/${id}/status`, { status }),
};

export const examApi = {
    getAll: () => api.get<ExamResponse[]>('/api/exam'),
    getById: (id: string) => api.get<ExamResponse>(`/api/exam/${id}`),
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

export const teacherPaymentApi = {
    getAll: () => api.get('/api/teacher-payment'),
    getById: (id: string) => api.get(`/api/teacher-payment/${id}`),
};

export const analyticsApi = {
    getParent: (id: string) => api.get(`/api/analytics/parent/${id}`),
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


export const paymentApi = {
    getAll: () => api.get<PaymentResponse[]>(`/api/payment`),
    getById: (id: string) => api.get<PaymentResponse>(`/api/payment/${id}`),
    getPayments: () => api.get<PaymentResponse[]>('/api/payment'),
    getParentPayments: (parentId: string) => api.get<PaymentResponse[]>(`/api/payment/parent/${parentId}`),
    createCheckoutSession: (paymentId: string, successUrl: string, cancelUrl: string) =>
        api.post(`/api/payment/${paymentId}/checkout`, { successUrl, cancelUrl }),
    markAsPaid: (id: string) => api.post(`/api/payment/${id}/mark-paid`),
};

export const reportApi = {
    downloadStudentPdf: (studentId: string) => api.get(`/api/report/student/${studentId}/progress-pdf`, { responseType: 'blob' }),
};

export const donationApi = {
    getCampaigns: (published?: boolean) => api.get(`/api/donation/campaigns${published !== undefined ? `?published=${published}` : ''}`),
    createCampaign: (data: any) => api.post('/api/donation/campaigns', data),
    getRecords: () => api.get('/api/donation/records'),
    createRecord: (data: any) => api.post('/api/donation/records', data),
    validateDonation: (id: string) => api.patch(`/api/donation/records/${id}/validate`),
};

export const volunteerApi = {
    getMissions: (published?: boolean) => api.get(`/api/volunteer/missions${published !== undefined ? `?published=${published}` : ''}`),
    createMission: (data: any) => api.post('/api/volunteer/missions', data),
    getSignups: () => api.get('/api/volunteer/signups'),
    signup: (data: any) => api.post('/api/volunteer/signups', data),
};
