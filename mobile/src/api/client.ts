import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://fuzzy-carrots-kiss.loca.lt/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    config.headers = config.headers || {};
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        }
        return Promise.reject(error);
    }
);

export default api;

export const authApi = {
    login: (email: string, password: string) => api.post('/Auth/login', { email, password }),
};

export const dashboardApi = {
    getAdmin: () => api.get('/Dashboard/admin'),
};

export const studentApi = {
    getAll: () => api.get('/Student'),
    getById: (id: string) => api.get(`/Student/${id}`),
    getStats: (id: string) => api.get(`/Student/${id}/stats`), // New: For Gamification (XP, Streak)
};

export const cmsApi = {
    getPublishedPages: () => api.get('/Cms/pages?published=true'),
    getPageBySlug: (slug: string) => api.get(`/Cms/pages/${slug}`),
};

export const progressApi = {
    getByStudent: (id: string) => api.get(`/Progress/student/${id}`),
    getSummary: (id: string) => api.get(`/Progress/student/${id}/summary`),
};

export const sessionApi = {
    getAll: () => api.get('/Session'),
    getById: (id: string) => api.get(`/Session/${id}`),
    getCockpit: (id: string) => api.get(`/Session/${id}/cockpit`),
    markAttendance: (id: string, data: { studentId: string; status: number; notes?: string }) =>
        api.post(`/Session/${id}/attendance`, data),
    startRecitation: (id: string, data: { studentId: string }) =>
        api.post(`/Session/${id}/recitation`, data),
    complete: (id: string, pedagogicalSummary?: string) =>
        api.post(`/Session/${id}/complete`, pedagogicalSummary),
};

export const examApi = {
    getAll: () => api.get('/Exam'),
    getById: (id: string) => api.get(`/Exam/${id}`),
    start: (data: { studentId: string; examinerId: string; level: number; surahId?: number }) =>
        api.post('/Exam/start', data),
    markInProgress: (id: string) => api.post(`/Exam/${id}/progress`),
    annotateVerse: (id: string, data: { verseNumber: number; surahId: number; errorType: string; comment?: string }) =>
        api.post(`/Exam/${id}/annotate-verse`, data),
    complete: (id: string, finalGrade: number, teacherFeedback?: string) =>
        api.post(`/Exam/${id}/complete`, { finalGrade, teacherFeedback }),
    getReport: (id: string) => api.get(`/Exam/${id}/report`),
};

export const mushafApi = {
    getSurahs: () => api.get('/Mushaf/surahs'),
    getSurahById: (id: number) => api.get(`/Mushaf/surahs/${id}`),
    getVerses: (surahId: number) => api.get(`/Mushaf/verses?surahId=${surahId}`),
};
