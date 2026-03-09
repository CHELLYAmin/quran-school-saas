'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveSessionStore } from '@/lib/store/useLiveSessionStore';
import { FiArrowLeft, FiUsers, FiVideo, FiMic, FiMicOff, FiVideoOff, FiSettings, FiMaximize, FiMinimize } from 'react-icons/fi';
import CockpitSidebar from '@/components/sessions/CockpitSidebar';
import CockpitMushaf from '@/components/sessions/CockpitMushaf';
import { sessionApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function VirtualClassroomPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { cockpit, fetchCockpit, isLoading, error, activeStudentId, setHubConnection, updateMushafStateLocally } = useLiveSessionStore();
    const isTeacher = user?.roles.includes(UserRole.Teacher) || user?.roles.includes(UserRole.Admin);
    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // SignalR Connection
    useEffect(() => {
        if (!id || !user) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/notificationHub`, {
                accessTokenFactory: () => user.token || '',
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.on('MushafStateUpdated', (state) => {
            console.log('Mushaf state synced:', state);
            updateMushafStateLocally(state);
        });

        const start = async () => {
            try {
                await connection.start();
                await connection.invoke('JoinSessionGroup', id);
                setHubConnection(connection);
                console.log('Session SignalR Connected');
            } catch (err) {
                console.error('SignalR Session Error', err);
            }
        };

        start();

        return () => {
            connection.stop();
            setHubConnection(null);
        };
    }, [id, user, setHubConnection, updateMushafStateLocally]);

    useEffect(() => {
        if (id) {
            fetchCockpit(id as string);
        }
    }, [id, fetchCockpit]);

    // Load Jitsi script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi();
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                document.body.removeChild(script);
            }
            if (jitsiApi) {
                jitsiApi.dispose();
            }
        };
    }, [cockpit]);

    const initJitsi = () => {
        if (!cockpit || !jitsiContainerRef.current || window.JitsiMeetExternalAPI === undefined) return;

        // Extract room name from MeetingUrl or use a fallback
        const roomName = cockpit.meetingUrl
            ? cockpit.meetingUrl.split('/').pop()
            : `QuranSchool-${id?.toString().substring(0, 8)}`;

        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
                startWithAudioMuted: false,
                disableDeepLinking: true,
                prejoinPageEnabled: false
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
            userInfo: {
                displayName: 'Enseignant' // This should come from auth store ideally
            }
        };

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
        setJitsiApi(api);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-dark-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-dark-400">Préparation de la classe virtuelle...</p>
                </div>
            </div>
        );
    }

    if (error || !cockpit) {
        return (
            <div className="flex h-screen items-center justify-center bg-dark-950">
                <div className="bg-dark-900 p-8 rounded-2xl border border-red-900/30 text-center max-w-md">
                    <h2 className="text-lg font-bold text-white mb-2">Erreur</h2>
                    <p className="text-dark-400 mb-6">{error || "Séance introuvable."}</p>
                    <button onClick={() => router.push('/dashboard/sessions')} className="btn btn-primary w-full">Retour</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-black h-screen overflow-hidden text-white">
            {/* Main Video Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300`}>
                <header className="h-14 bg-dark-900/80 backdrop-blur border-b border-dark-800 flex items-center justify-between px-4 shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/dashboard/sessions/${id}`)} className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400">
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                LIVE : {cockpit.groupName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isTeacher && (
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-primary-600 text-white' : 'hover:bg-dark-800 text-dark-400'}`}
                                title="Outils de suivi"
                            >
                                <FiUsers size={18} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden bg-dark-950">
                    {/* Video Split */}
                    <div className="flex-1 relative border-r border-dark-800 shadow-2xl">
                        <div ref={jitsiContainerRef} className="absolute inset-0" />
                    </div>

                    {/* Mushaf Split */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-900/50">
                        {activeStudentId ? (
                            <CockpitMushaf />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-dark-500 p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6 border border-dark-700">
                                    <FiVideo size={40} className="opacity-20 text-primary-500" />
                                </div>
                                <h3 className="text-white font-bold mb-2">Prêt pour la récitation</h3>
                                <p className="text-sm max-w-xs mx-auto">Sélectionnez un élève dans la file d'attente à droite pour commencer le suivi en direct.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tracking Sidebar (Queue Only) */}
            <aside className={`
                ${sidebarOpen ? 'w-[380px]' : 'w-0'} 
                transition-all duration-300 border-l border-dark-800 bg-dark-900 flex flex-col h-full z-30 shrink-0 overflow-hidden
            `}>
                <div className="w-[380px] flex flex-col h-full">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-950">
                        <h2 className="font-bold text-xs tracking-widest uppercase text-primary-500 flex items-center gap-2">
                            <FiUsers /> File d'attente
                        </h2>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-dark-800 rounded text-dark-400">
                            <FiMinimize size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <CockpitSidebar />
                    </div>
                </div>
            </aside>
        </div>
    );
}
