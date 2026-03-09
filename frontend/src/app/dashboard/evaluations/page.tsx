'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { missionsService } from '@/lib/services/missions';
import { StudentMissionResponse, MissionTargetType } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
    FiCheckCircle, FiClock, FiStar, FiAward, FiInbox,
    FiUser, FiMessageSquare, FiBookOpen, FiRefreshCcw
} from 'react-icons/fi';
import Link from 'next/link';

export default function EvaluationsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const { user } = useAuthStore();
    const [missions, setMissions] = useState<StudentMissionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchMissions();
    }, [user]);

    const fetchMissions = async () => {
        try {
            setLoading(true);
            const data = await missionsService.getPendingEvaluations();
            setMissions(data);
        } catch (error) {
            console.error('Failed to fetch pending evaluations', error);
            toast.error("Erreur lors du chargement des évaluations.");
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (missionId: string, score: number) => {
        setSubmittingId(missionId);
        try {
            await missionsService.completeMission(missionId, score);
            toast.success("Évaluation enregistrée avec succès !");
            setMissions(prev => prev.filter(m => m.id !== missionId));
        } catch (error) {
            console.error("Evaluation error", error);
            toast.error("Un problème est survenu.");
        } finally {
            setSubmittingId(null);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-200 dark:ring-emerald-800';
        if (score >= 70) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-blue-200 dark:ring-blue-800';
        if (score >= 50) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-amber-200 dark:ring-amber-800';
        return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 ring-rose-200 dark:ring-rose-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto">
            {/* ══ Header ══ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FiCheckCircle className="text-primary-500" />
                        Évaluations en attente
                    </h1>
                    <p className="text-dark-500 mt-2 font-medium">Récompensez les efforts de vos élèves en corrigeant leurs missions terminées.</p>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-dark-50 dark:bg-dark-800 px-6 py-4 rounded-2xl border border-dark-100 dark:border-dark-700 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">{missions.length}</span>
                        <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mt-1">À Corriger</span>
                    </div>
                </div>
            </div>

            {/* ══ Content ══ */}
            <div className="space-y-6">
                {missions.length === 0 ? (
                    <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-16 text-center text-dark-500 shadow-xl flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                            <FiInbox className="text-4xl text-dark-300 dark:text-dark-600" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-900">
                                <FiCheckCircle className="text-white text-xs" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-dark-900 dark:text-white mb-2">Tout est à jour !</p>
                        <p className="text-dark-400 max-w-sm mx-auto font-medium">Aucune mission en attente de validation. Vos élèves n'ont pas encore soumis de nouvelles révisions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className="bg-white dark:bg-dark-900 rounded-[2rem] shadow-lg border border-dark-100 dark:border-dark-800 flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="p-6 border-b border-dark-50 dark:border-dark-800/50 flex-1 relative">
                                    {/* Aesthetic line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-accent-500 opacity-80" />

                                    <div className="flex items-start justify-between mb-4 pl-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-extrabold shadow-md">
                                                {mission.studentName?.charAt(0) || <FiUser />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-dark-900 dark:text-white leading-tight">
                                                    {mission.studentName}
                                                </h3>
                                                <p className="text-xs font-bold text-dark-400 mt-0.5 flex items-center gap-1.5">
                                                    <FiClock className="text-primary-400" />
                                                    Terminé le {mission.completedAt ? format(new Date(mission.completedAt), 'dd MMM yyyy à HH:mm', { locale: locale === 'fr' ? fr : undefined }) : 'Date inconnue'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-3 space-y-3">
                                        <div className="inline-flex items-center gap-2 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-700">
                                            <span className="text-accent-500"><FiBookOpen size={14} /></span>
                                            <span className="text-sm font-bold text-dark-700 dark:text-dark-300">
                                                {mission.targetType === MissionTargetType.Surah ? 'Sourate' :
                                                    mission.targetType === MissionTargetType.Hizb ? 'Hizb' : 'Personnalisée'}
                                                {' '} {mission.targetId || ''}
                                            </span>
                                        </div>

                                        {mission.customDescription && (
                                            <div className="bg-primary-50/50 dark:bg-primary-900/10 p-3 rounded-xl border border-primary-100/50 dark:border-primary-800/20 text-sm text-dark-600 dark:text-dark-300 font-medium italic flex items-start gap-2">
                                                <FiMessageSquare className="text-primary-400 shrink-0 mt-0.5" />
                                                <p>{mission.customDescription}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Evaluation Actions */}
                                <div className="p-6 bg-dark-50/30 dark:bg-dark-900 flex flex-col justify-center border-t border-dark-100 dark:border-dark-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-dark-400 text-center mb-3">Attribuer une note</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { score: 40, label: 'Passable' },
                                            { score: 60, label: 'Bien' },
                                            { score: 80, label: 'Très Bien' },
                                            { score: 100, label: 'Excellent' }
                                        ].map((grade) => {
                                            const colors = getScoreColor(grade.score);
                                            return (
                                                <button
                                                    key={grade.score}
                                                    onClick={() => handleEvaluate(mission.id, grade.score)}
                                                    disabled={submittingId === mission.id}
                                                    className={`
                                                        relative overflow-hidden flex flex-col items-center justify-center p-3 sm:py-4 rounded-2xl transition-all duration-300
                                                        border border-transparent ring-1 ring-inset
                                                        hover:-translate-y-1 hover:shadow-lg
                                                        ${colors}
                                                        ${submittingId === mission.id ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2'}
                                                    `}
                                                    title={`Noter ${grade.score}/100`}
                                                >
                                                    <span className="text-lg sm:text-2xl font-black mb-1">{grade.score}</span>
                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-80">{grade.label}</span>

                                                    {/* Decorative background glow */}
                                                    <div className="absolute inset-0 bg-white/20 dark:bg-black/10 opacity-0 hover:opacity-100 transition-opacity" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center px-2">
                                        <button
                                            onClick={() => handleEvaluate(mission.id, 0)}
                                            disabled={submittingId === mission.id}
                                            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline transition-colors decoration-rose-500/30 underline-offset-4"
                                        >
                                            Mission incomplète (0%)
                                        </button>
                                        {submittingId === mission.id && (
                                            <FiRefreshCcw className="animate-spin text-dark-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
