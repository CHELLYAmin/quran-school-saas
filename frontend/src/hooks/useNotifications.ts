import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export const useNotifications = () => {
    const { user, isAuthenticated } = useAuthStore();
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/notificationHub`, {
                accessTokenFactory: () => user.token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveNotification', (notification) => {
            console.log('Notification received:', notification);
            toast.success(notification.body || notification.title, {
                duration: 5000,
                position: 'top-right',
                icon: '🔔'
            });

            // Here you could also update a global notification store to show a red dot in the UI
        });

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('SignalR Connected.');

                // Join user-specific group
                if (user.userId) {
                    await connection.invoke('JoinUserGroup', user.userId);
                }
            } catch (err) {
                console.error('SignalR Connection Error: ', err);
            }
        };

        startConnection();
        connectionRef.current = connection;

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [isAuthenticated, user]);
};
