import api from '@/lib/api/client';

export interface NotificationResponse {
    id: string;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

class NotificationsService {
    async getMyNotifications(): Promise<NotificationResponse[]> {
        const response = await api.get<NotificationResponse[]>('/api/notifications');
        return response.data;
    }

    async getUnreadCount(): Promise<number> {
        const response = await api.get<number>('/api/notifications/unread-count');
        return response.data;
    }

    async markAsRead(id: string): Promise<void> {
        await api.put(`/api/notifications/${id}/read`);
    }

    async markAllAsRead(): Promise<void> {
        await api.put('/api/notifications/read-all');
    }
}

export const notificationsService = new NotificationsService();
