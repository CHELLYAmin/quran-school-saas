import api from '@/lib/api/client';
import {
    StudentMissionResponse,
    CreateManualMissionRequest
} from '@/types';

class MissionsService {
    async getStudentMissions(studentId: string): Promise<StudentMissionResponse[]> {
        const response = await api.get<StudentMissionResponse[]>(`/api/missions/student/${studentId}`);
        return response.data;
    }

    async createManualMission(data: CreateManualMissionRequest): Promise<StudentMissionResponse> {
        const response = await api.post<StudentMissionResponse>('/api/missions', data);
        return response.data;
    }

    async createGroupMission(groupId: string, data: CreateManualMissionRequest): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(`/api/missions/group/${groupId}`, data);
        return response.data;
    }

    async completeMission(missionId: string, qualityScore?: number): Promise<void> {
        await api.put(`/api/missions/${missionId}/complete`, { qualityScore });
    }

    async getPendingEvaluations(): Promise<StudentMissionResponse[]> {
        const response = await api.get<StudentMissionResponse[]>('/api/missions/evaluations/pending');
        return response.data;
    }

    async submitAudio(missionId: string, audioUrl: string): Promise<void> {
        await api.post(`/api/missions/${missionId}/submit-audio`, { audioUrl });
    }

    async provideFeedback(missionId: string, data: { qualityScore: number, feedback?: string }): Promise<void> {
        await api.post(`/api/missions/${missionId}/feedback`, data);
    }
}

export const missionsService = new MissionsService();
