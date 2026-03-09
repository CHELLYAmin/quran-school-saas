'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { dashboardApi } from '@/lib/api/client';
import { AdminDashboardResponse } from '@/types';
import {
    FiUsers, FiTrendingUp, FiDollarSign, FiCheckCircle,
    FiBarChart2, FiCalendar, FiAward, FiActivity,
    FiBookOpen, FiBriefcase, FiAlertTriangle
} from 'react-icons/fi';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const { data } = await dashboardApi.getAdmin();
            setStats(data);
        } catch {
            // Use mock data if API is not available
            setStats({
                totalStudents: 247,
                activeStudents: 218,
                totalTeachers: 12,
                totalGroups: 15,
                monthlyRevenue: 18500,
                totalRevenue: 156000,
                averageProgress: 72,
                examPassRate: 88,
                attendanceRate: 94,
                overduePaymentsCount: 5,
                examsThisMonthCount: 12,
                revenueHistory: [
                    { month: 'Sep', amount: 15000 },
                    { month: 'Oct', amount: 16200 },
                    { month: 'Nov', amount: 17100 },
                    { month: 'Dec', amount: 14800 },
                    { month: 'Jan', amount: 18500 },
                    { month: 'Feb', amount: 18500 },
                ],
                groupProgress: [
                    { groupName: 'Al-Fatiha', averageProgress: 85, studentCount: 20 },
                    { groupName: 'Al-Baqara', averageProgress: 62, studentCount: 15 },
                    { groupName: 'Al-Imran', averageProgress: 78, studentCount: 18 },
                    { groupName: 'An-Nisa', averageProgress: 45, studentCount: 12 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-10 h-10" />
            </div>
        );
    }

    const statCards = [
        { icon: <FiUsers />, label: t.dashboard.totalStudents, value: stats?.totalStudents, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { icon: <FiActivity />, label: t.dashboard.activeStudents, value: stats?.activeStudents, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { icon: <FiBriefcase />, label: "Total Enseignants", value: stats?.totalTeachers, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { icon: <FiBookOpen />, label: "Total Groupes", value: stats?.totalGroups, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },

        { icon: <FiDollarSign />, label: t.dashboard.monthlyRevenue, value: `${stats?.monthlyRevenue?.toLocaleString()} €`, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        { icon: <FiAlertTriangle />, label: "Paiements en retard", value: stats?.overduePaymentsCount, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20', animate: (stats?.overduePaymentsCount || 0) > 0 ? 'animate-pulse' : '' },

        { icon: <FiTrendingUp />, label: t.dashboard.averageProgress, value: `${stats?.averageProgress}%`, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { icon: <FiCalendar />, label: "Évaluations (Mois)", value: stats?.examsThisMonthCount, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },

        { icon: <FiAward />, label: t.dashboard.examPassRate, value: `${stats?.examPassRate}%`, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
        { icon: <FiCheckCircle />, label: t.dashboard.attendanceRate, value: `${stats?.attendanceRate}%`, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    ];

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.common.dashboard}</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Vue d'ensemble et statistiques rapides</p>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                    <span className="bg-dark-50 dark:bg-dark-800 text-dark-600 dark:text-dark-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-dark-100 dark:border-dark-700">
                        Aujourd'hui
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white dark:bg-dark-900 rounded-[2rem] p-5 sm:p-6 border border-dark-100 dark:border-dark-800 flex flex-col items-center sm:items-start sm:flex-row gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden ${card.animate || ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg.split(' ')[0]}/50 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-110 transition-transform pointer-events-none`}></div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 relative z-10 ${card.bg}`}>
                            <div className={`text-2xl bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="text-center sm:text-left min-w-0 relative z-10">
                            <p className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight truncate">{card.value}</p>
                            <h3 className="text-[10px] sm:text-xs text-dark-500 font-bold uppercase tracking-widest truncate mt-1">{card.label}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-dark-100 dark:border-dark-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/5 dark:to-transparent pointer-events-none -z-0" />
                    <h3 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-8 flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <FiBarChart2 className="w-6 h-6" />
                        </div>
                        Revenus mensuels
                    </h3>
                    <div className="space-y-5 relative z-10">
                        {stats?.revenueHistory?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-dark-500 w-12">{item.month}</span>
                                <div className="flex-1 bg-dark-50 dark:bg-dark-950 rounded-2xl h-10 overflow-hidden relative border border-dark-100 dark:border-dark-800 shadow-inner">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl transition-all duration-1000 ease-out flex items-center px-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
                                        style={{ width: `${(item.amount / 20000) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-[-150%] group-hover:animate-shine"></div>
                                        <span className="text-xs font-extrabold text-white relative z-10">{item.amount.toLocaleString()} €</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group Progress */}
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-dark-100 dark:border-dark-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-accent-50/50 to-transparent dark:from-accent-900/5 dark:to-transparent pointer-events-none -z-0" />
                    <h3 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-8 flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-500/20">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                        Progression moyenne par groupe
                    </h3>
                    <div className="space-y-8 relative z-10">
                        {stats?.groupProgress?.map((group, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="font-extrabold text-lg text-dark-900 dark:text-white block tracking-tight">{group.groupName}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-dark-500">{group.studentCount} élèves actifs</span>
                                    </div>
                                    <span className={`text-base font-extrabold ${group.averageProgress >= 75 ? 'text-emerald-500' :
                                        group.averageProgress >= 50 ? 'text-accent-500' : 'text-rose-500'
                                        }`}>{group.averageProgress}%</span>
                                </div>
                                <div className="bg-dark-50 dark:bg-dark-950 rounded-2xl h-4 overflow-hidden border border-dark-100 dark:border-dark-800 shadow-inner">
                                    <div
                                        className={`h-full rounded-2xl transition-all duration-1000 ease-out shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] ${group.averageProgress >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                            group.averageProgress >= 50 ? 'bg-gradient-to-r from-accent-400 to-accent-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'
                                            }`}
                                        style={{ width: `${group.averageProgress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 sm:p-10 border border-dark-100 dark:border-dark-800 shadow-xl overflow-hidden relative">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-dark-50 dark:bg-dark-800/30 rounded-full blur-3xl pointer-events-none -z-0" />
                <h3 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-8 relative z-10 flex items-center gap-3">
                    <FiActivity className="text-primary-500" size={24} />
                    Actions rapides
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                    {[
                        { label: 'Ajouter un élève', href: '/dashboard/students', icon: '👨‍🎓', color: 'bg-dark-50 dark:bg-dark-950 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800 text-dark-700 dark:text-dark-300 hover:text-emerald-700 dark:hover:text-emerald-400' },
                        { label: 'Présences', href: '/dashboard/attendance', icon: '✅', color: 'bg-dark-50 dark:bg-dark-950 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 text-dark-700 dark:text-dark-300 hover:text-blue-700 dark:hover:text-blue-400' },
                        { label: 'Nouvel examen', href: '/dashboard/exams', icon: '📝', color: 'bg-dark-50 dark:bg-dark-950 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800 text-dark-700 dark:text-dark-300 hover:text-purple-700 dark:hover:text-purple-400' },
                        { label: 'Paiements', href: '/dashboard/payments', icon: '💰', color: 'bg-dark-50 dark:bg-dark-950 hover:bg-accent-50 dark:hover:bg-accent-900/10 hover:border-accent-200 dark:hover:border-accent-800 text-dark-700 dark:text-dark-300 hover:text-accent-700 dark:hover:text-accent-400' },
                        { label: 'Devoirs', href: '/dashboard/homework/create', icon: '📚', color: 'bg-dark-50 dark:bg-dark-950 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-800 text-dark-700 dark:text-dark-300 hover:text-orange-700 dark:hover:text-orange-400' },
                    ].map((action, i) => (
                        <a
                            key={i}
                            href={action.href}
                            className={`flex flex-col items-center justify-center text-center gap-4 p-6 sm:py-8 rounded-[2rem] border border-dark-100 dark:border-dark-800 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${action.color} group`}
                        >
                            <span className="text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform drop-shadow-sm">{action.icon}</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
