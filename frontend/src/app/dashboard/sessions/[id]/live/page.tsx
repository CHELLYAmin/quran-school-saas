'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveSessionStore } from '@/lib/store/useLiveSessionStore';
import { FiArrowLeft, FiUsers, FiVideo, FiMic, FiMicOff, FiVideoOff, FiSettings, FiMaximize, FiMinimize, FiBookOpen } from 'react-icons/fi';
import CockpitSidebar from '@/components/sessions/CockpitSidebar';
import CockpitMushaf from '@/components/sessions/CockpitMushaf';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export function generateStaticParams() {
    return [{ id: '1' }];
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
    
    // Responsive State
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const [activeTab, setActiveTab] = useState<'mushaf' | 'queue' | 'chat'>('mushaf');

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsLandscape(window.innerWidth > window.innerHeight && mobile);
            
            // Auto-close sidebar on mobile/landscape to give space to video
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

        const startConnection = async () => {
            try {
                await connection.start();
                await connection.invoke('JoinSessionGroup', id);
                setHubConnection(connection);
                console.log('Session SignalR Connected');
            } catch (err) {
                console.error('SignalR Session Error', err);
            }
        };

        startConnection();

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
                displayName: user?.fullName || 'Enseignant'
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

    // Render for Mobile Portrait
    if (isMobile && !isLandscape) {
        return (
            <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
                {/* Status Bar Overlay */}
                <div className="bg-primary-950 px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/5">
                    <button onClick={() => router.push(`/dashboard/sessions/${id}`)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-dark-400 hover:text-white transition-colors">
                        <FiArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cockpit.groupName}</span>
                    </div>
                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-accent-gold">
                        <FiVideo size={14} />
                    </div>
                </div>

                {/* Video Area (YouTube Style - Fixed Top) */}
                <div className="aspect-video bg-dark-950 relative shadow-2xl z-20">
                    <div ref={jitsiContainerRef} className="absolute inset-0" />
                    {/* Minimalist Overlay if loading */}
                    {!jitsiApi && (
                        <div className="flex items-center justify-center h-full bg-dark-900">
                             <div className="spinner-border animate-spin inline-block w-6 h-6 border-2 border-primary-500 rounded-full border-t-white" />
                        </div>
                    )}
                </div>

                {/* Interaction Tabs (Premium Styled) */}
                <div className="flex bg-dark-900 border-b border-white/5 shrink-0 px-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'mushaf', label: 'Récitation', icon: <FiVideo className="text-sm" /> },
                        { id: 'queue', label: `File (${cockpit.smartQueue?.length || 0})`, icon: <FiUsers className="text-sm" /> },
                        { id: 'chat', label: 'Chat', icon: <FiSettings className="text-sm" /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative ${activeTab === tab.id ? 'text-accent-gold' : 'text-dark-500'}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-gold rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Scrollable Feature Area */}
                <div className="flex-1 overflow-y-auto bg-dark-950/50 relative">
                    <div className="absolute inset-0 zellige-pattern opacity-5 pointer-events-none" />
                    
                    <div className="relative z-10 h-full">
                        {activeTab === 'mushaf' && (
                            <div className="p-4 h-full animate-fade-in">
                                {activeStudentId ? (
                                    <div className="rounded-[2.5rem] bg-white dark:bg-dark-900 border border-dark-800 h-full overflow-hidden shadow-2xl">
                                        <CockpitMushaf />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-dark-500 text-center space-y-6">
                                        <div className="size-24 rounded-[2rem] bg-dark-900 border border-dark-800 flex items-center justify-center text-primary-500/20">
                                            <FiVideo size={48} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold text-white uppercase tracking-widest">En attente de récitation</p>
                                            <p className="text-[10px] uppercase font-medium max-w-xs opacity-40">Sélectionnez un élève dans la file pour suivre sa lecture en direct.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'queue' && (
                            <div className="h-full animate-slide-in-up">
                                <CockpitSidebar />
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6 bg-dark-900/50">
                                <div className="size-20 rounded-full bg-primary-950/50 flex items-center justify-center text-accent-gold">
                                    <FiSettings size={32} />
                                </div>
                                <h3 className="text-lg font-black tracking-tight text-white cinzel-title uppercase">Communication</h3>
                                <p className="text-xs text-dark-400 font-medium leading-relaxed">
                                    Les outils de communication directe sont intégrés à l&apos;interface vidéo en haut de l&apos;écran ou via les profils élèves dans la file.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render for Mobile Landscape (Immersive / Optimized Split)
    if (isLandscape) {
        return (
            <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
                {/* Horizontal Tool Bar (Left) */}
                <div className="w-16 bg-primary-950 flex flex-col items-center py-6 gap-6 border-r border-white/5 shrink-0">
                    <button onClick={() => router.push(`/dashboard/sessions/${id}`)} className="size-10 rounded-2xl bg-white/5 flex items-center justify-center text-dark-400 hover:text-white transition-all">
                        <FiArrowLeft size={18} />
                    </button>
                    <div className="h-px w-6 bg-white/10" />
                    <button 
                        onClick={() => setActiveTab('mushaf')}
                        className={`size-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'mushaf' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:bg-white/5'}`}
                        title="Mushaf"
                    >
                        <FiVideo size={20} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('queue')}
                        className={`size-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'queue' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:bg-white/5'}`}
                        title="File"
                    >
                        <FiUsers size={20} />
                    </button>
                    <div className="mt-auto">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`size-12 rounded-2xl flex items-center justify-center transition-all ${sidebarOpen ? 'bg-accent-gold text-primary-950' : 'text-dark-400 hover:bg-white/5'}`}
                        >
                            {sidebarOpen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                        </button>
                    </div>
                </div>

                {/* Large Video Area */}
                <div className={`relative flex-grow bg-dark-950 transition-all duration-500 overflow-hidden ${sidebarOpen ? 'flex-[1.5]' : 'flex-[3]'}`}>
                    <div ref={jitsiContainerRef} className="absolute inset-0" />
                    
                    {/* Immersive Tag */}
                    {!sidebarOpen && (
                        <div className="absolute bottom-6 left-6 pointer-events-none opacity-50">
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                                <span className="size-1.5 rounded-full bg-accent-gold animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{cockpit.groupName}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Split Contextual Tool */}
                {sidebarOpen && (
                    <div className="flex-1 bg-dark-900 border-l border-white/10 shadow-2xl relative animate-slide-in-right">
                        <div className="absolute inset-0 zellige-pattern opacity-5 pointer-events-none" />
                        <div className="h-full flex flex-col relative z-10">
                            <div className="p-4 bg-dark-950/80 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">
                                    {activeTab === 'mushaf' ? 'Suivi Récitation' : 'File d\'attente'}
                                </h3>
                                <button onClick={() => setSidebarOpen(false)} className="text-dark-500 hover:text-white">
                                    <FiMinimize size={14} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {activeTab === 'mushaf' ? (
                                    activeStudentId ? <CockpitMushaf /> : (
                                        <div className="h-full flex flex-col items-center justify-center p-10 opacity-30">
                                            <FiVideo size={40} className="mb-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">Sélectionnez un élève</p>
                                        </div>
                                    )
                                ) : <CockpitSidebar />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default Desktop Render (Fine-tuned for High-End Dashboard)
    return (
        <div className="flex bg-[#0A0B0E] h-screen overflow-hidden text-white font-sans">
            {/* Control Column (Left) */}
            <div className="w-20 bg-primary-950 flex flex-col items-center py-8 gap-10 border-r border-white/5 shrink-0">
                <button onClick={() => router.push(`/dashboard/sessions/${id}`)} className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-dark-400 hover:text-white hover:bg-accent-gold/20 transition-all group">
                    <FiArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="h-[2px] w-8 bg-white/5" />
                <button className="size-14 rounded-2xl bg-accent-gold text-primary-950 shadow-[0_15px_30px_rgba(234,179,8,0.3)] flex items-center justify-center">
                    <FiVideo size={28} />
                </button>
                <button className="size-14 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center">
                    <FiSettings size={28} />
                </button>
                <div className="mt-auto pb-4">
                    <div className="size-12 rounded-full border-2 border-primary-800 p-0.5">
                        <div className="size-full rounded-full bg-accent-gold flex items-center justify-center text-primary-950 font-black text-xs">
                            {user?.fullName?.charAt(0) || 'E'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Visual Motif */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] -z-10" />

                <header className="h-20 bg-dark-950/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-10 shrink-0 relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-red-600 rounded-full animate-ping opacity-75" />
                            <h1 className="text-xl font-serif font-black tracking-tighter cinzel-title uppercase">
                                Session In Live <span className="text-accent-gold mx-2">/</span> {cockpit.groupName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="size-6 rounded-full bg-dark-800 border-2 border-primary-950" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">
                                {cockpit.smartQueue?.length || 0} Élèves Connectés
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`size-12 rounded-xl transition-all flex items-center justify-center border ${sidebarOpen ? 'bg-primary-900 border-primary-700 text-white' : 'bg-white/5 border-white/10 text-dark-400 hover:text-white'}`}
                        >
                            <FiUsers size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Primary Split: Video & Tracking */}
                    <div className={`flex-[1.2] min-w-0 relative border-r border-white/5 transition-all duration-700 ${sidebarOpen ? 'm-8 mr-4' : 'm-0'}`}>
                        <div className={`size-full bg-black relative overflow-hidden ${sidebarOpen ? 'rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5' : ''}`}>
                             <div ref={jitsiContainerRef} className="absolute inset-0" />
                        </div>
                    </div>

                    {/* Secondary Split: Quran / Follow-up */}
                    <div className={`flex-1 overflow-y-auto no-scrollbar transition-all duration-700 ${sidebarOpen ? 'm-8 ml-4 mr-0' : 'm-0'} bg-dark-900/20 backdrop-blur-md rounded-[3rem] border border-white/5 overflow-hidden`}>
                        {activeStudentId ? (
                             <div className="h-full animate-fade-in">
                                <CockpitMushaf />
                             </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-20 text-center space-y-8">
                                <div className="size-32 rounded-[2.5rem] bg-primary-950/40 border border-white/5 flex items-center justify-center text-primary-500/20">
                                    <FiBookOpen size={64} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif font-black cinzel-title uppercase tracking-tighter">Prêt pour la récitation</h3>
                                    <p className="text-sm font-medium text-white/40 max-w-sm mx-auto leading-relaxed">
                                        Sélectionnez un étudiant dans la file d&apos;attente active pour synchroniser son Mushaf et commencer le suivi personnalisé.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Smart Sidebar - Right */}
            <aside className={`
                ${sidebarOpen ? 'w-[420px]' : 'w-0'} 
                transition-all duration-500 ease-in-out border-l border-white/5 bg-primary-950/30 backdrop-blur-3xl flex flex-col h-full z-30 shrink-0 overflow-hidden relative
            `}>
                <div className="w-[420px] flex flex-col h-full relative z-10">
                    <div className="absolute inset-0 zellige-pattern opacity-5" />
                    <div className="p-8 border-b border-white/5 flex items-center justify-between relative bg-black/20">
                        <div>
                            <h2 className="text-[11px] font-black tracking-[0.4em] text-accent-gold uppercase mb-1">Queue Management</h2>
                            <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">Priorité Optimisée / API-Q</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar relative">
                        <CockpitSidebar />
                    </div>
                </div>
            </aside>
        </div>
    );
}
