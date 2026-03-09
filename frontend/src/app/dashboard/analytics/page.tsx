'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { FiPieChart, FiUsers, FiActivity, FiCheckCircle, FiTarget, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface AnalyticsOverview {
    activeStudents: number;
    activeTeachers: number;
    totalGroups: number;
    activeMissions: number;
    completedMissionsThisWeek: number;
}

export default function AnalyticsPage() {
    const { user } = useAuthStore();
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // Ideally fetch from /api/analytics/overview
            // Mock data for UI
            setTimeout(() => {
                setOverview({
                    activeStudents: 142,
                    activeTeachers: 8,
                    totalGroups: 12,
                    activeMissions: 345,
                    completedMissionsThisWeek: 89
                });
                setIsLoading(false);
            }, 600);
        } catch (error) {
            console.error('Failed to load analytics', error);
            toast.error("Erreur lors du chargement des statistiques");
            setIsLoading(false);
        }
    };

    if (isLoading || !overview) {
        return <PageSkeleton variant="dashboard" />;
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                            <FiPieChart size={20} />
                        </div>
                        Pilotage & Statistiques
                    </h1>
                    <p className="text-dark-500 mt-2 text-lg">Vue d'ensemble de l'activité de l'école.</p>
                </div>
                <div className="hidden sm:block">
                    {/* Period selector stub */}
                    <select className="input-field py-2 text-sm font-bold bg-white dark:bg-dark-900 shadow-sm">
                        <option>7 derniers jours</option>
                        <option>Ce mois</option>
                        <option>Cette année</option>
                    </select>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KpiCard
                    title="Élèves Actifs"
                    value={overview.activeStudents.toString()}
                    trend="+5%"
                    icon={<FiUsers size={24} />}
                    color="primary"
                />
                <KpiCard
                    title="Enseignants"
                    value={overview.activeTeachers.toString()}
                    trend="Stable"
                    icon={<FiCheckCircle size={24} />}
                    color="indigo"
                />
                <KpiCard
                    title="Missions en Cours"
                    value={overview.activeMissions.toString()}
                    trend="+12%"
                    icon={<FiTarget size={24} />}
                    color="amber"
                />
                <KpiCard
                    title="Devoirs Terminés (Semaine)"
                    value={overview.completedMissionsThisWeek.toString()}
                    trend="+24%"
                    icon={<FiActivity size={24} />}
                    color="emerald"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Growth Chart Stub */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 md:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                    <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
                        Évolution des Révisions
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1"><FiTrendingUp /> +18%</span>
                    </h3>
                    <div className="h-64 flex items-end gap-2 sm:gap-4 select-none">
                        {/* Fake bars for visualization */}
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group-hover:first:flex-1">
                                <div className="w-full bg-primary-100 dark:bg-primary-900/20 rounded-t-xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors relative" style={{ height: `${height}%` }}>
                                    <div className="absolute inset-x-0 bottom-0 bg-primary-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ height: `${height * 0.4}%` }} />
                                </div>
                                <span className="text-xs font-bold text-dark-400">J-{6 - i}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 md:p-8 border border-dark-100 dark:border-dark-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-dark-900 dark:text-white">Qualité Pédagogique (Cette semaine)</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-dark-600 dark:text-dark-300">Taux de Complétion des Devoirs</span>
                                <span className="text-emerald-600">85%</span>
                            </div>
                            <div className="w-full h-3 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-dark-600 dark:text-dark-300">Participation au Leaderboard</span>
                                <span className="text-amber-500">62%</span>
                            </div>
                            <div className="w-full h-3 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-dark-600 dark:text-dark-300">Assiduité en Séance</span>
                                <span className="text-primary-600">94%</span>
                            </div>
                            <div className="w-full h-3 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dark-100 dark:border-dark-800">
                            <p className="text-sm text-dark-500 italic">💡 L'engagement global est en hausse grâce aux nouvelles fonctionnalités du Missions Hub.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, icon, color }: { title: string; value: string; trend: string; icon: React.ReactNode; color: 'primary' | 'emerald' | 'amber' | 'indigo' | 'rose' }) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800',
        rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
    };

    return (
        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50 blur-2xl transition-all group-hover:scale-150 ${colorClasses[color].split(' ')[0]}`} />
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorClasses[color]}`}>
                    {icon}
                </div>
                <h3 className="text-dark-500 font-bold text-sm mb-1">{title}</h3>
                <div className="flex items-end justify-between">
                    <div className="text-3xl font-black text-dark-900 dark:text-white leading-none">{value}</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') || trend === 'Stable' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'}`}>
                        {trend}
                    </div>
                </div>
            </div>
        </div>
    );
}
