'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { dashboardApi, analyticsApi, paymentApi } from '@/lib/api/client';
import { format } from 'date-fns';
import { FaUser, FaCheckCircle, FaBook, FaCalendarAlt, FaClipboardList, FaFileAlt, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';
import Link from 'next/link';
import { QualityTrendChart, MissionProgressChart } from '@/components/analytics/AnalyticsCharts';

// Move to types
interface PaymentItem {
    id: string;
    studentName: string;
    amount: number;
    description: string;
    dueDate: string;
    status: 'Pending' | 'Paid';
}

// Move to types
interface ChildDashboardItem {
    studentId: string;
    fullName: string;
    groupName: string;
    attendanceRate: number;
    progress: {
        juzCompleted: number;
        surahsMemorized: number;
        currentJuz: number;
        lastSurah: string;
    };
    upcomingExams: any[];
    pendingHomeworks: any[];
    recentResults: any[];
    schedule: any[];
}

interface ChildAnalytics {
    studentId: string;
    studentName: string;
    attendanceRate: number;
    totalMissions: number;
    completedMissions: number;
    qualityTrend: any[];
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const [children, setChildren] = useState<ChildDashboardItem[]>([]);
    const [selectedChild, setSelectedChild] = useState<ChildDashboardItem | null>(null);
    const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null);
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        if (!user?.userId) return;
        fetchDashboard();
    }, [user?.userId]);

    useEffect(() => {
        if (selectedChild) {
            fetchAnalytics(selectedChild.studentId);
        }
    }, [selectedChild]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const [dashRes, payRes] = await Promise.all([
                dashboardApi.getParent(user!.userId),
                paymentApi.getParentPayments(user!.userId)
            ]);

            setChildren(dashRes.data.children || []);
            setPayments(payRes.data || []);

            if (dashRes.data.children && dashRes.data.children.length > 0) {
                setSelectedChild(dashRes.data.children[0]);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (studentId: string) => {
        try {
            setAnalyticsLoading(true);
            const res = await analyticsApi.getParent(user!.userId);
            // Find specific child in parent analytics response
            const childData = res.data.children.find((c: any) => c.studentId === studentId);
            setAnalytics(childData || null);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;
    if (children.length === 0) return <div>No children found linked to your account.</div>;

    if (loading) return <PageSkeleton variant="dashboard" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Page Header */}
            <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden flex flex-col gap-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight relative z-10">Espace Parents</h1>
                <p className="text-dark-500 font-medium text-lg relative z-10">Suivez le parcours de vos enfants</p>
            </div>

            {/* Child Selector Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {children.map(child => (
                    <button
                        key={child.studentId}
                        onClick={() => setSelectedChild(child)}
                        className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all whitespace-nowrap ${selectedChild?.studentId === child.studentId
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 text-dark-500 hover:text-dark-900 dark:hover:text-white hover:border-dark-200 dark:hover:border-dark-700 hover:shadow-sm'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedChild?.studentId === child.studentId ? 'bg-white/20' : 'bg-dark-50 dark:bg-dark-800'}`}>
                            <FaUser className={selectedChild?.studentId === child.studentId ? 'text-white' : 'text-dark-400'} />
                        </div>
                        {child.fullName}
                    </button>
                ))}
            </div>

            {selectedChild && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Welcome & Group Info */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-dark-900 dark:text-white">Carnet de <span className="text-primary-600 dark:text-primary-400">{selectedChild.fullName}</span></h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 bg-dark-50 dark:bg-dark-800 text-dark-600 dark:text-dark-300 text-xs font-bold rounded-lg border border-dark-200 dark:border-dark-700 tracking-wider uppercase">
                                    {selectedChild.groupName}
                                </span>
                            </div>
                        </div>
                        <div className="text-left sm:text-right relative z-10 bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl border border-dark-100 dark:border-dark-700/50 min-w-[150px]">
                            <p className="text-xs text-dark-500 font-bold uppercase tracking-wider mb-1">Assiduité</p>
                            <p className={`text-3xl font-extrabold tracking-tight ${selectedChild.attendanceRate >= 90 ? 'text-green-500' :
                                selectedChild.attendanceRate >= 75 ? 'text-orange-500' : 'text-red-500'
                                }`}>
                                {selectedChild.attendanceRate}%
                            </p>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group min-h-[300px]">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                    <FaChartLine className="w-5 h-5" />
                                </div>
                                Qualité des Récitations (Dernières séances)
                            </h3>
                            <div className="h-48 relative z-10">
                                {analyticsLoading ? (
                                    <div className="flex justify-center items-center h-full"><div className="spinner-sm w-8 h-8" /></div>
                                ) : (
                                    <QualityTrendChart qualityTrend={analytics?.qualityTrend || []} />
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group min-h-[300px]">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <FaCheckCircle className="w-5 h-5" />
                                </div>
                                Missions & Devoirs
                            </h3>
                            <div className="h-48 relative z-10">
                                {analyticsLoading ? (
                                    <div className="flex justify-center items-center h-full"><div className="spinner-sm w-8 h-8" /></div>
                                ) : (
                                    <div className="space-y-6">
                                        <MissionProgressChart
                                            total={analytics?.totalMissions || 0}
                                            completed={analytics?.completedMissions || 0}
                                        />
                                        <div className="flex justify-center gap-8 text-center pt-2">
                                            <div>
                                                <p className="text-2xl font-black text-green-600">{analytics?.completedMissions || 0}</p>
                                                <p className="text-[10px] font-bold text-dark-400 uppercase tracking-tighter">Terminées</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-orange-500">{(analytics?.totalMissions || 0) - (analytics?.completedMissions || 0)}</p>
                                                <p className="text-[10px] font-bold text-dark-400 uppercase tracking-tighter">Restantes</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                <FaBook className="w-5 h-5" />
                            </div>
                            Progression
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                <span className="text-dark-600 dark:text-dark-300 font-medium">Juz complétés</span>
                                <span className="font-extrabold text-lg text-dark-900 dark:text-white">{selectedChild.progress.juzCompleted}</span>
                            </div>
                            <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                <span className="text-dark-600 dark:text-dark-300 font-medium">Sourates apprises</span>
                                <span className="font-extrabold text-lg text-dark-900 dark:text-white">{selectedChild.progress.surahsMemorized}</span>
                            </div>
                            <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                <span className="text-dark-600 dark:text-dark-300 font-medium">Juz actuel</span>
                                <span className="font-extrabold text-lg text-primary-600 dark:text-primary-400">{selectedChild.progress.currentJuz || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-2xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                <span className="text-dark-600 dark:text-dark-300 font-medium">Dernière sourate</span>
                                <span className="font-bold text-dark-900 dark:text-white truncate max-w-[120px]">{selectedChild.progress.lastSurah}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Homework */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                <FaClipboardList className="w-5 h-5" />
                            </div>
                            Devoirs en attente
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {selectedChild.pendingHomeworks.length === 0 ? (
                                <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                    <p className="text-dark-500 font-bold">Aucun devoir en attente.</p>
                                </div>
                            ) : (
                                selectedChild.pendingHomeworks.map((hw: any) => (
                                    <div key={hw.assignmentId} className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-200 dark:hover:border-dark-700">
                                        <div>
                                            <p className="font-bold text-dark-900 dark:text-white text-base truncate max-w-[150px]">{hw.title}</p>
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-bold">Pour le : {format(new Date(hw.dueDate), 'd MMM')}</p>
                                        </div>
                                        <Link
                                            href={`/dashboard/homework/${hw.assignmentId}`}
                                            className="text-primary-600 dark:text-primary-400 text-sm font-bold bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                                        >
                                            Voir
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                        {selectedChild.pendingHomeworks.length > 0 && (
                            <div className="mt-6 text-center relative z-10">
                                <Link href="/dashboard/homework" className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                                    Voir tous les devoirs →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Exam Results */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <FaFileAlt className="w-5 h-5" />
                            </div>
                            Derniers résultats d'examen
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {selectedChild.recentResults.length === 0 ? (
                                <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                    <p className="text-dark-500 font-bold">Aucun résultat récent.</p>
                                </div>
                            ) : (
                                selectedChild.recentResults.map((r: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                        <div>
                                            <p className="font-bold text-dark-900 dark:text-white text-base">{r.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-dark-500 font-medium">{format(new Date(r.date), 'd MMM')}</span>
                                                <span className="w-1 h-1 rounded-full bg-dark-300 dark:bg-dark-600"></span>
                                                <span className="text-xs text-dark-500 font-bold uppercase tracking-wider">{r.type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xl font-extrabold tracking-tight ${(r.grade || 0) >= 80 ? 'text-green-500' :
                                                (r.grade || 0) >= 50 ? 'text-orange-500' : 'text-red-500'
                                                }`}>
                                                {r.grade || '-'}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming Exams */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <FaCalendarAlt className="w-5 h-5" />
                            </div>
                            Prochains examens
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {selectedChild.upcomingExams.length === 0 ? (
                                <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                    <p className="text-dark-500 font-bold">Aucun examen prévu.</p>
                                </div>
                            ) : (
                                selectedChild.upcomingExams.map((e: any) => (
                                    <div key={e.examId} className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-3xl border border-purple-100 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                        <p className="font-bold text-dark-900 dark:text-white text-base">{e.title}</p>
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-xl">
                                            {format(new Date(e.examDate), 'd MMM')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Finances & Facturation */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden group col-span-1 md:col-span-1 lg:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                <FaFileInvoiceDollar className="w-5 h-5" />
                            </div>
                            Finances & Facturation
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {payments.length === 0 ? (
                                <div className="text-center py-10 bg-dark-50 dark:bg-dark-800/50 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                    <p className="text-dark-500 font-bold">Aucune facture en attente.</p>
                                </div>
                            ) : (
                                payments.slice(0, 3).map((p: PaymentItem) => (
                                    <div key={p.id} className="flex justify-between items-center bg-dark-50 dark:bg-dark-800/50 p-4 rounded-3xl border border-transparent hover:border-dark-200 dark:hover:border-dark-700 transition-colors">
                                        <div>
                                            <p className="font-bold text-dark-900 dark:text-white text-sm">{p.studentName}</p>
                                            <p className="text-xs text-dark-500 mt-1">{p.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-primary-600 dark:text-primary-400">{p.amount} €</p>
                                            <Link
                                                href={`/dashboard/parent/payments/${p.id}`}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-lg mt-1 inline-block ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}
                                            >
                                                {p.status === 'Paid' ? 'Réglé' : 'À Payer'}
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {payments.length > 0 && (
                            <div className="mt-6 text-center relative z-10">
                                <Link href="/dashboard/parent/payments" className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                                    Historique complet →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
