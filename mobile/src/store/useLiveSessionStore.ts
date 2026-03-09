import { create } from 'zustand';
import { sessionApi } from '../api/client';

export interface SmartQueueStudent {
    studentId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    priorityIndex: number;
    daysSinceLastRecitation: number;
    recentErrorsCount: number;
    recommendedAction: string;
    attendanceStatus?: string; // 'Present', 'Absent', 'Late', 'Excused'
    lastRecitationScore?: number;
    suggestedSurahNumber?: number;
    lastRecitedSurahNumber?: number;
    suggestedSurahName?: string;
    recitationsInSessionCount: number;
    lastRecitedTimeInSession?: number;
}

export interface SessionCockpitData {
    sessionId: string;
    groupId?: string;
    groupName: string;
    levelName?: string;
    levelStartSurah?: number;
    levelEndSurah?: number;
    status: string; // 'Planned' | 'InProgress' | 'Completed' | 'Cancelled'
    sessionObjective?: string;
    smartQueue: SmartQueueStudent[];
    attendances: any[];
    recentRecitations: any[];
}

interface LiveSessionState {
    cockpit: SessionCockpitData | null;
    activeStudentId: string | null;
    isLoading: boolean;
    error: string | null;
    queueMode: 'smart' | 'roundrobin';

    fetchCockpit: (sessionId: string) => Promise<void>;
    setActiveStudent: (studentId: string | null) => void;
    updateAttendanceOptimistic: (studentId: string, status: string) => void;
    setQueueMode: (mode: 'smart' | 'roundrobin') => void;
    markStudentRecited: (studentId: string) => void;
}

export const useLiveSessionStore = create<LiveSessionState>((set, get) => ({
    cockpit: null,
    activeStudentId: null,
    isLoading: false,
    error: null,
    queueMode: 'smart',

    fetchCockpit: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionApi.getCockpit(sessionId);
            const data = response.data;

            if (data && data.smartQueue) {
                data.smartQueue = data.smartQueue.map((student: any) => {
                    const att = data.attendances?.find((a: any) => a.studentId === student.studentId);
                    return { ...student, attendanceStatus: att?.status || 'Present' };
                });
            }

            set({ cockpit: data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur de chargement du cockpit', isLoading: false });
        }
    },

    setActiveStudent: (studentId) => set({ activeStudentId: studentId }),

    updateAttendanceOptimistic: (studentId, status) => {
        const { cockpit } = get();
        if (!cockpit) return;

        const updatedQueue = cockpit.smartQueue.map(s =>
            s.studentId === studentId ? { ...s, attendanceStatus: status } : s
        );

        set({ cockpit: { ...cockpit, smartQueue: updatedQueue } });
    },

    setQueueMode: (mode) => set({ queueMode: mode }),

    markStudentRecited: (studentId) => {
        const { cockpit } = get();
        if (!cockpit) return;

        const updatedQueue = cockpit.smartQueue.map(s =>
            s.studentId === studentId
                ? { ...s, recitationsInSessionCount: (s.recitationsInSessionCount || 0) + 1, lastRecitedTimeInSession: Date.now() }
                : s
        );

        set({ cockpit: { ...cockpit, smartQueue: updatedQueue } });
    }
}));
