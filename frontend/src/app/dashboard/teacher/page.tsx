'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { dashboardApi, sessionApi } from '@/lib/api/client';
import { format } from 'date-fns';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt, FaClipboardCheck, FaPlus } from 'react-icons/fa';
import { FiVideo } from 'react-icons/fi';
import Link from 'next/link';

// Move to types
interface TeacherDashboardData {
    totalStudents: number;
    totalGroups: number;
    classesToday: number;
    studentsNeedingAttention: any[];
    upcomingExams: any[];
    assignmentsToGrade: any[]; // New field
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const [todaySessions, setTodaySessions] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.userId) return;
        fetchDashboard();
        fetchTodaySessions();
    }, [user?.userId]);

    const fetchTodaySessions = async () => {
        try {
            const res = await sessionApi.getAll();
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const filtered = res.data.filter((s: any) =>
                s.date.split('T')[0] === todayStr &&
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
            const res = await dashboardApi.getTeacher(user!.userId);
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;
    if (!data) return <div>No data found.</div>;

    if (loading) return <PageSkeleton variant="dashboard" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Page Header */}
            <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Espace Professeur</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Gérez vos classes et suivez la progression de vos élèves</p>
                </div>
                <Link href="/dashboard/homework/create" className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 w-full sm:w-auto">
                    <FaPlus size={16} /> Créer un Devoir
                </Link>
            </div>

            {/* Active Online Session Banner */}
            {todaySessions.filter(s => s.isOnline && s.status === 'InProgress').map(s => (
                <div key={s.id} className="bg-primary-600 rounded-4xl p-8 text-white shadow-xl shadow-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary-400/30 overflow-hidden relative group transition-all hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl shadow-inner border border-white/20">
                            <FiVideo />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                <h2 className="text-xl font-black uppercase tracking-wider">Séance en ligne en cours</h2>
                            </div>
                            <p className="text-primary-100 font-bold text-lg">{s.groupName} — {s.startTime} : {s.sessionObjective || 'Récitation et révision'}</p>
                        </div>
                    </div>
                    <Link href={`/dashboard/sessions/${s.id}/live`} className="btn bg-white text-primary-600 hover:bg-primary-50 px-10 py-4 rounded-2xl font-black shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 relative z-10 whitespace-nowrap text-lg">
                        Rejoindre la classe virtuelle
                    </Link>
                </div>
            ))}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: <FaUserGraduate />, label: 'Total Élèves', value: data.totalStudents,
                        color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        icon: <FaChalkboardTeacher />, label: 'Groupes Actifs', value: data.totalGroups,
                        color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                        icon: <FaCalendarAlt />, label: "Séances d'aujourd'hui", value: data.classesToday,
                        color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20'
                    },
                    {
                        icon: <FaClipboardCheck />, label: 'Devoirs à corriger', value: data.assignmentsToGrade?.length || 0,
                        color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20'
                    }
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 rounded-3xl p-5 border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg.split(' ')[0]}/50 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-110 transition-transform`}></div>
                        <div className="flex flex-col gap-4 relative">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center border border-white/20 shadow-sm`}>
                                    <div className={`text-xl bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1 truncate">{card.label}</h3>
                                <p className="text-2xl font-extrabold text-dark-900 dark:text-white tracking-tight">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assignments to Grade */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                            <FaClipboardCheck className="w-5 h-5" />
                        </div>
                        Devoirs à corriger
                    </h2>
                    <div className="space-y-4 relative z-10">
                        {(!data.assignmentsToGrade || data.assignmentsToGrade.length === 0) ? (
                            <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <p className="text-dark-500 font-bold">Aucun devoir en attente.</p>
                            </div>
                        ) : (
                            data.assignmentsToGrade.map((a: any) => (
                                <div key={a.assignmentId} className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-200 dark:hover:border-dark-700">
                                    <div>
                                        <p className="font-bold text-dark-900 dark:text-white text-base">{a.title}</p>
                                        <p className="text-xs text-dark-500 mt-1 font-medium">Soumis le : <span className="text-dark-700 dark:text-dark-300">{format(new Date(a.dueDate), 'd MMM yyyy')}</span></p>
                                    </div>
                                    <Link
                                        href={`/dashboard/homework/${a.homeworkId}`}
                                        className="text-primary-600 dark:text-primary-400 text-sm font-bold bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                                    >
                                        Corriger
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                    {data.assignmentsToGrade?.length > 0 && (
                        <div className="mt-6 text-center relative z-10">
                            <Link href="/dashboard/homework" className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                                Voir tous les devoirs →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Upcoming Exams */}
                <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                            <FaCalendarAlt className="w-5 h-5" />
                        </div>
                        Prochains examens
                    </h2>
                    <div className="space-y-4 relative z-10">
                        {data.upcomingExams.length === 0 ? (
                            <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <p className="text-dark-500 font-bold">Aucun examen prévu.</p>
                            </div>
                        ) : (
                            data.upcomingExams.map((e: any) => (
                                <div key={e.examId} className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-3xl border border-purple-100 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-bold text-dark-900 dark:text-white text-base truncate">{e.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-md">
                                                {format(new Date(e.examDate), 'd MMM yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 px-3 py-1.5 rounded-xl whitespace-nowrap">
                                        {e.groupName}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
