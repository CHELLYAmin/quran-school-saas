'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import api, { dashboardApi, sessionApi, reportApi } from '@/lib/api/client';
import { missionsService } from '@/lib/services/missions';
import { StudentMissionResponse } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaBook, FaClipboardList, FaCalendarAlt, FaMicrophone, FaTimes } from 'react-icons/fa';
import { FiVideo, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import MissionRecordingCard from '@/components/missions/MissionRecordingCard';

interface StudentDashboardData {
    studentName: string;
    groupName: string;
    attendanceRate: number;
    points: number;
    schedule: any[];
    pendingHomeworks: any[];
    upcomingExams: any[];
    studentProgress: {
        juzCompleted: number;
        surahsMemorized: number;
        currentJuz: number;
        lastSurah: string;
    };
}

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [missions, setMissions] = useState<StudentMissionResponse[]>([]);
    const [selectedMission, setSelectedMission] = useState<StudentMissionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRecordModal, setShowRecordModal] = useState(false);

    const [todaySessions, setTodaySessions] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.userId) return;
        fetchDashboard();
        fetchTodaySessions();
        fetchMissions();
    }, [user?.userId]);

    const fetchMissions = async () => {
        try {
            const res = await missionsService.getStudentMissions(user!.userId);
            setMissions(res.filter(m => m.status === 'Pending' || m.status === 'Overdue'));
        } catch (e) {
            console.error('Failed to fetch missions', e);
        }
    };

    const fetchTodaySessions = async () => {
        try {
            const res = await sessionApi.getAll();
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const filtered = res.data.filter((s: any) =>
                s.date.split('T')[0] === todayStr &&
                s.isOnline &&
                (s.status === 'InProgress' || s.status === 'Planned')
            );
            setTodaySessions(filtered);
        } catch (e) {
            console.error('Failed to fetch today sessions', e);
        }
    };

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            // using the centralized api instance ensures correct baseURL/api and headers
            // The backend expects the Student ID, not the User ID.
            // We ensure we use the studentId if available in the user object.
            const studentId = user?.studentId || user?.userId;
            const response = await api.get(`/api/dashboard/student/${studentId}`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordClick = (mission: StudentMissionResponse) => {
        setSelectedMission(mission);
        setShowRecordModal(true);
    };

    const handleDownloadPdf = async () => {
        if (!user?.userId) return;
        try {
            const { data } = await reportApi.downloadStudentPdf(user.userId);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rapport_Progression.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download PDF', error);
        }
    };

    if (!data) return <div className="text-center py-12 text-dark-400">{t.homework.noRecords}</div>;

    const dateLocale = locale === 'fr' ? fr : undefined;

    if (loading) return <PageSkeleton variant="dashboard" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Recording Modal */}
            {showRecordModal && selectedMission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm" onClick={() => setShowRecordModal(false)}></div>
                    <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowRecordModal(false)}
                            className="absolute -top-12 right-0 text-white hover:text-dark-200 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                        <MissionRecordingCard
                            mission={selectedMission}
                            onSuccess={() => {
                                setShowRecordModal(false);
                                fetchMissions();
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.common.welcome}, <span className="text-primary-600 dark:text-primary-400">{data.studentName}</span></h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-dark-50 dark:bg-dark-800 text-dark-600 dark:text-dark-300 text-xs font-bold rounded-lg border border-dark-200 dark:border-dark-700 tracking-wider uppercase">
                            {data.groupName}
                        </span>
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-200 dark:border-primary-800/50 hover:bg-primary-200 transition-colors"
                        >
                            <FiDownload className="w-3 h-3" />
                            Mon Bulletin PDF
                        </button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
                    <div className="text-left md:text-right bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl border border-dark-100 dark:border-dark-700/50 min-w-[120px]">
                        <p className="text-xs text-dark-500 font-bold uppercase tracking-wider mb-1">Ma Série</p>
                        <p className="text-3xl font-black tracking-tight text-orange-500 flex items-center justify-end gap-2">
                            {data.points > 0 ? '🔥' : '❄️'} {data.points > 100 ? (data.points / 100).toFixed(0) : 0} j
                        </p>
                    </div>
                    <div className="text-left md:text-right bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl border border-dark-100 dark:border-dark-700/50 min-w-[120px]">
                        <p className="text-xs text-dark-500 font-bold uppercase tracking-wider mb-1">Total XP</p>
                        <p className="text-3xl font-black tracking-tight text-primary-600 dark:text-primary-400">
                            {data.points}
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Online Session Banner */}
            {todaySessions.filter(s => s.status === 'InProgress').map(s => (
                <div key={s.id} className="bg-primary-600 rounded-4xl p-8 text-white shadow-xl shadow-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary-400/30 overflow-hidden relative group transition-all hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl shadow-inner border border-white/20">
                            <FiVideo />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                <h2 className="text-xl font-black uppercase tracking-wider">Ma séance en direct</h2>
                            </div>
                            <p className="text-primary-100 font-bold text-lg">{s.startTime} : {s.sessionObjective || 'Récitation du jour'}</p>
                        </div>
                    </div>
                    <Link href={`/dashboard/sessions/${s.id}/live`} className="btn bg-white text-primary-600 hover:bg-blue-50 px-10 py-4 rounded-2xl font-black shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 relative z-10 whitespace-nowrap text-lg">
                        Rejoindre la classe
                    </Link>
                </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Progress */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                            <FaBook className="w-5 h-5" />
                        </div>
                        {t.progress.myProgress}
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                            <span className="text-dark-600 dark:text-dark-300 font-medium">{t.progress.juzCompleted}</span>
                            <span className="font-extrabold text-lg text-dark-900 dark:text-white">{data.studentProgress.juzCompleted}</span>
                        </div>
                        <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                            <span className="text-dark-600 dark:text-dark-300 font-medium">{t.progress.surahsMemorized}</span>
                            <span className="font-extrabold text-lg text-dark-900 dark:text-white">{data.studentProgress.surahsMemorized}</span>
                        </div>
                        <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                            <span className="text-dark-600 dark:text-dark-300 font-medium">{t.progress.currentJuz}</span>
                            <span className="font-extrabold text-lg text-primary-600 dark:text-primary-400">{data.studentProgress.currentJuz || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                            <span className="text-dark-600 dark:text-dark-300 font-medium">{t.progress.lastSurah}</span>
                            <span className="font-bold text-dark-900 dark:text-white truncate max-w-[120px]">{data.studentProgress.lastSurah}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Homework */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                            <FaClipboardList className="w-5 h-5" />
                        </div>
                        {t.common.homework}
                    </h3>
                    <div className="space-y-4 relative z-10 flex-1">
                        {data.pendingHomeworks.length === 0 ? (
                            <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <p className="text-dark-500 font-bold">{t.homework.noHomework}</p>
                            </div>
                        ) : (
                            data.pendingHomeworks.slice(0, 3).map((hw: any) => (
                                <div key={hw.assignmentId} className="flex flex-col gap-2 bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-200 dark:hover:border-dark-700">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-dark-900 dark:text-white text-base leading-tight pr-4">{hw.title}</p>
                                        <Link
                                            href={`/dashboard/homework/${hw.assignmentId}`}
                                            className="text-primary-600 dark:text-primary-400 text-[10px] font-extrabold uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors whitespace-nowrap"
                                        >
                                            {t.homework.doIt}
                                        </Link>
                                    </div>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                                        {t.homework.due}: {format(new Date(hw.dueDate), 'd MMM', { locale: dateLocale })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    {data.pendingHomeworks.length > 0 && (
                        <div className="mt-6 text-center relative z-10 pt-4 border-t border-dark-100 dark:border-dark-800">
                            <Link href="/dashboard/homework" className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                                {t.homework.viewAll} →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Upcoming Exams */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                            <FaCalendarAlt className="w-5 h-5" />
                        </div>
                        {t.homework.upcomingExams}
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {data.upcomingExams.length === 0 ? (
                            <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <p className="text-dark-500 font-bold">{t.homework.noExams}</p>
                            </div>
                        ) : (
                            data.upcomingExams.map((e: any) => (
                                <div key={e.examId} className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-3xl border border-purple-100 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                    <p className="font-bold text-dark-900 dark:text-white text-base">{e.title}</p>
                                    <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-lg">
                                        {format(new Date(e.examDate), 'd MMM', { locale: dateLocale })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Missions Card */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <FaMicrophone className="w-5 h-5" />
                            </div>
                            Missions de Récitation
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {missions.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-dark-50 dark:bg-dark-900/30 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <p className="text-dark-500 font-bold uppercase tracking-widest text-xs">Toutes les missions sont complétées !</p>
                            </div>
                        ) : (
                            missions.map((m) => (
                                <div key={m.id} className="bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 p-5 rounded-3xl flex flex-col justify-between hover:border-emerald-200 dark:hover:border-emerald-900 transition-all group">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${m.type === 'SmartRevision' ? 'bg-purple-100 text-purple-600' : 'bg-primary-100 text-primary-600'
                                                }`}>
                                                {m.type === 'SmartRevision' ? 'Révision' : 'Devoir'}
                                            </span>
                                            <span className="text-[10px] text-dark-400 font-bold">{format(new Date(m.dueDate), 'd MMM', { locale: dateLocale })}</span>
                                        </div>
                                        <p className="font-extrabold text-lg text-dark-900 dark:text-white leading-tight mb-1">
                                            {m.targetType === 'Surah' ? `Sourate ${m.targetId}` : m.customDescription}
                                        </p>
                                        <p className="text-xs text-dark-500 font-medium">Assigné par {m.teacherName || 'Système'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRecordClick(m)}
                                        className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 group-hover:scale-[1.02]"
                                    >
                                        <FaMicrophone /> Réciter maintenant
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
