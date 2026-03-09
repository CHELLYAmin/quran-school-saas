'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveSessionStore } from '@/lib/store/useLiveSessionStore';
import { FiArrowLeft, FiUsers, FiVideo } from 'react-icons/fi';
import CockpitSidebar from '@/components/sessions/CockpitSidebar';
import CockpitMushaf from '@/components/sessions/CockpitMushaf';
import SessionSummaryDashboard from '@/components/sessions/SessionSummaryDashboard';
import { sessionApi } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function SessionCockpitClient() {
    const { id } = useParams();
    const router = useRouter();
    const { cockpit, fetchCockpit, isLoading, error, activeStudentId } = useLiveSessionStore();
    const [mobileView, setMobileView] = useState<'queue' | 'mushaf'>('queue');

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [pedagogicalSummary, setPedagogicalSummary] = useState('');

    useEffect(() => {
        if (id) {
            fetchCockpit(id as string);
        }
    }, [id, fetchCockpit]);

    useEffect(() => {
        if (activeStudentId) {
            setMobileView('mushaf');
        }
    }, [activeStudentId]);

    const handleCompleteSession = async () => {
        try {
            setIsCompleting(true);
            await sessionApi.complete(id as string, pedagogicalSummary);
            toast.success("Séance terminée avec succès");
            setShowCompleteModal(false);
            fetchCockpit(id as string);
        } catch (e: any) {
            toast.error(e?.response?.data?.title || e?.message || "Erreur lors de la clôture de la séance");
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return <PageSkeleton variant="detail" />;
    }

    if (error || !cockpit) {
        return (
            <div className="flex h-screen items-center justify-center bg-dark-50 dark:bg-dark-950">
                <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30 text-center max-w-md">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 dark:text-red-400 text-xl font-bold">!</span>
                    </div>
                    <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-2">Erreur de chargement</h2>
                    <p className="text-dark-500 mb-6">{error || "Impossible de charger les données de la séance."}</p>
                    <button onClick={() => router.push('/dashboard/sessions')} className="btn btn-primary w-full">Retour aux séances</button>
                </div>
            </div>
        );
    }

    if (cockpit.status === 'Completed' || (cockpit.status as any) === 2) {
        return <SessionSummaryDashboard sessionId={id as string} groupName={cockpit.groupName} />;
    }

    return (
        <div className="flex bg-dark-50 dark:bg-dark-950 h-screen overflow-hidden">
            {showCompleteModal && (
                <div onClick={() => setShowCompleteModal(false)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-dark-200 dark:border-dark-800" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-100 dark:border-dark-800">
                            <h2 className="text-xl font-bold text-dark-900 dark:text-white">Terminer la séance</h2>
                            <p className="text-dark-500 text-sm mt-1">Vous êtes sur le point de clôturer définitivement cette séance. Les statistiques de progression seront figées.</p>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold mb-2 text-dark-700 dark:text-dark-300">Note pédagogique globale (Optionnel)</label>
                            <textarea
                                value={pedagogicalSummary}
                                onChange={(e) => setPedagogicalSummary(e.target.value)}
                                className="input-field w-full min-h-[120px] resize-none"
                                placeholder="Ex: Séance très productive, la plupart des élèves ont maîtrisé leurs révisions."
                            />
                        </div>
                        <div className="p-6 bg-dark-50 dark:bg-dark-950 flex justify-end gap-3 rounded-b-2xl border-t border-dark-100 dark:border-dark-800">
                            <button onClick={() => setShowCompleteModal(false)} className="btn bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700">Annuler</button>
                            <button onClick={handleCompleteSession} disabled={isCompleting} className="btn btn-primary disabled:opacity-50">
                                {isCompleting ? 'Clôture en cours...' : 'Confirmer la clôture'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside className={`
                ${mobileView === 'queue' ? 'flex' : 'hidden'} 
                lg:flex w-full lg:w-[350px] 
                border-r border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex-col h-full z-20 shrink-0 shadow-sm
            `}>
                <CockpitSidebar />
            </aside>

            <main className={`
                ${mobileView === 'mushaf' ? 'flex' : 'hidden'} 
                lg:flex flex-1 flex-col h-full overflow-hidden bg-dark-50 dark:bg-dark-950 relative
            `}>
                <header className="h-16 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900/50 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={() => setMobileView('queue')} className="lg:hidden p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-primary-600 font-bold flex items-center gap-1 text-sm">
                            <FiArrowLeft className="w-5 h-5" />
                            <span>File</span>
                        </button>
                        <button onClick={() => router.push('/dashboard/sessions')} className="hidden lg:block p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-full transition-colors text-dark-500">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="overflow-hidden">
                            <h1 className="text-sm sm:text-lg font-bold text-dark-900 dark:text-white truncate">Séance : {cockpit.groupName}</h1>
                            <p className="text-[10px] sm:text-[11px] font-medium text-dark-500 flex flex-wrap gap-x-2">
                                <span>{cockpit.smartQueue.length} élèves</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-green-600 dark:text-green-500">{cockpit.smartQueue.filter(s => s.attendanceStatus === 'Present' || (s.attendanceStatus as any) === 0).length} présents</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {cockpit.isOnline && (
                            <button
                                onClick={() => router.push(`/dashboard/sessions/${id}/live`)}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-500/20"
                            >
                                <FiVideo size={16} />
                                <span className="hidden xs:inline">Mode Virtuel</span>
                            </button>
                        )}
                        <button onClick={() => setShowCompleteModal(true)} className="text-xs sm:text-sm font-semibold bg-dark-900 hover:bg-black dark:bg-dark-800 dark:hover:bg-dark-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap">Terminer</button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {activeStudentId ? <CockpitMushaf /> : (
                        <div className="flex flex-col items-center justify-center h-full text-dark-400 p-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-dark-200 dark:border-dark-800">
                                <FiUsers className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-2 sm:mb-3 text-center">Séance API-Q Initialisée</h2>
                            <p className="text-center max-w-md text-sm sm:text-[15px] leading-relaxed">
                                L'assistant intelligent a trié vos élèves selon leurs besoins de révision spécifiques.
                                <br className="hidden sm:block" /><br className="hidden sm:block" />
                                <span className="font-medium text-dark-700 dark:text-dark-300">
                                    {typeof window !== 'undefined' && window.innerWidth < 1024 ? 'Revenez à la file pour sélectionner un élève' : 'Sélectionnez un élève dans la file de gauche'}
                                </span> pour démarrer son évaluation détaillée.
                            </p>
                            <button onClick={() => setMobileView('queue')} className="lg:hidden mt-8 btn btn-primary flex items-center gap-2">
                                <FiUsers size={18} /> Voir la file d'élèves
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
