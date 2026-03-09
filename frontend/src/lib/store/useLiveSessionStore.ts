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
    // Surah suggestion fields (from API-Q algorithm)
    suggestedSurahNumber?: number;
    lastRecitedSurahNumber?: number;
    suggestedSurahName?: string;

    // Server-provided count, incremented optimistically locally
    recitationsInSessionCount: number;

    // Local session state
    lastRecitedTimeInSession?: number;
}

export interface LevelSurah {
    number: number;
    nameEnglish: string;
    nameArabic: string;
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
    isOnline: boolean;
    meetingUrl?: string;
    smartQueue: SmartQueueStudent[];
    attendances: any[];
    recentRecitations: any[];
    // Surahs in the group's level objective (for grouped dropdown)
    levelSurahs?: LevelSurah[];
}

interface LiveSessionState {
    cockpit: SessionCockpitData | null;
    activeStudentId: string | null;
    isLoading: boolean;
    error: string | null;

    // Evaluation buffer for debounced saving
    pendingEvaluations: Record<string, any>;

    // Queue Toggle
    queueMode: 'smart' | 'roundrobin';

    // SignalR
    hubConnection: any | null;

    // Actions
    fetchCockpit: (sessionId: string) => Promise<void>;
    setActiveStudent: (studentId: string | null) => void;
    updateAttendanceOptimistic: (studentId: string, status: string) => void;
    addPendingEvaluation: (verseId: string, evaluation: any) => void;
    clearPendingEvaluations: () => void;
    setQueueMode: (mode: 'smart' | 'roundrobin') => void;
    markStudentRecited: (studentId: string) => void;

    // Real-time Sync
    remoteMushafState: any | null;
    setHubConnection: (connection: any) => void;
    syncMushafState: (sessionId: string, state: any) => void;
    updateMushafStateLocally: (state: any) => void;
}

export const useLiveSessionStore = create<LiveSessionState>((set, get) => ({
    cockpit: null,
    activeStudentId: null,
    isLoading: false,
    error: null,
    pendingEvaluations: {},
    queueMode: 'smart',
    hubConnection: null,
    remoteMushafState: null,

    setHubConnection: (connection) => set({ hubConnection: connection }),

    syncMushafState: (sessionId, state) => {
        const { hubConnection } = get();
        if (hubConnection) {
            hubConnection.invoke('SyncMushafState', sessionId, state);
        }
    },

    updateMushafStateLocally: (state) => {
        set({ remoteMushafState: state });
        // If the student is the active one in the synced state, we might want to trigger something
        if (state.studentId) {
            set({ activeStudentId: state.studentId });
        }
    },

    fetchCockpit: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionApi.getCockpit(sessionId);
            const data = response.data;

            // Merge attendance into smart queue (default to Present)
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

    addPendingEvaluation: (verseId, evaluation) => {
        const { pendingEvaluations } = get();
        set({
            pendingEvaluations: {
                ...pendingEvaluations,
                [verseId]: evaluation
            }
        });
    },

    clearPendingEvaluations: () => set({ pendingEvaluations: {} }),

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
