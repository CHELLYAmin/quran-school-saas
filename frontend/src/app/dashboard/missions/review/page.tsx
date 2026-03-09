'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { missionsService } from '@/lib/services/missions';
import { StudentMissionResponse, MissionStatus } from '@/types';
import { FiMusic, FiCheck, FiX, FiMessageSquare, FiStar, FiChevronRight, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AudioReviewPage() {
    const { user } = useAuthStore();
    const [pendingMissions, setPendingMissions] = useState<StudentMissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMission, setSelectedMission] = useState<StudentMissionResponse | null>(null);
    const [feedback, setFeedback] = useState('');
    const [qualityScore, setQualityScore] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadPendingMissions();
    }, []);

    const loadPendingMissions = async () => {
        setIsLoading(true);
        try {
            const data = await missionsService.getPendingEvaluations();
            // Filter only Submitted missions (pending evaluations might include Completed without score)
            // But our new flow uses Submitted -> Teacher Review -> Completed
            const submitted = data.filter(m => m.status === MissionStatus.Submitted);
            setPendingMissions(submitted);
        } catch (error) {
            console.error('Failed to load pending evaluations', error);
            toast.error('Impossible de charger les corrections en attente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!selectedMission) return;

        setIsSubmitting(true);
        try {
            await missionsService.provideFeedback(selectedMission.id, {
                qualityScore,
                feedback
            });
            toast.success(`Correction envoyée pour ${selectedMission.studentName}`);
            setSelectedMission(null);
            setFeedback('');
            setQualityScore(5);
            loadPendingMissions();
        } catch (error) {
            console.error('Failed to submit feedback', error);
            toast.error('Erreur lors de l\'envoi de la correction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12 h-screen items-center bg-white dark:bg-dark-950"><div className="spinner w-10 h-10 border-primary-600"></div></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in px-4 py-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FiMusic className="text-primary-500" />
                        Corrections Audio
                    </h1>
                    <p className="text-dark-500 mt-2 text-lg">Suivi des récitations asynchrones à la maison.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* List of Submissions */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-4">
                    <h2 className="text-xl font-bold text-dark-800 dark:text-dark-200 flex items-center gap-2 mb-4">
                        Soumissions à corriger
                        <span className="bg-primary-100 text-primary-700 text-xs py-0.5 px-2.5 rounded-full font-black">{pendingMissions.length}</span>
                    </h2>

                    {pendingMissions.length === 0 ? (
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-12 text-center border border-dark-100 dark:border-dark-800 border-dashed">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <FiCheck size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white">Tout est corrigé !</h3>
                            <p className="text-dark-500 mt-2">Aucune nouvelle récitation audio en attente de votre part.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingMissions.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMission(m)}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center justify-between group ${selectedMission?.id === m.id ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 ring-2 ring-primary-500/10' : 'bg-white border-dark-100 dark:bg-dark-900 dark:border-dark-800 hover:border-dark-200 dark:hover:border-dark-700 hover:shadow-md'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-400 group-hover:text-primary-500 transition-colors">
                                            <FiUser size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-900 dark:text-white leading-tight">{m.studentName}</h4>
                                            <p className="text-xs font-bold text-dark-500 mt-1 uppercase tracking-wider">
                                                Sourate {m.targetId} • {format(new Date(m.createdAt), 'd MMM HH:mm', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                    <FiChevronRight className={`text-dark-300 transition-transform ${selectedMission?.id === m.id ? 'rotate-90 text-primary-500' : 'group-hover:translate-x-1'}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Correction Interface */}
                <div className="lg:col-span-12 xl:col-span-7">
                    {selectedMission ? (
                        <div className="bg-white dark:bg-dark-900 rounded-4xl p-8 border border-dark-100 dark:border-dark-800 shadow-xl space-y-8 sticky top-8">
                            <div className="flex justify-between items-start border-b border-dark-100 dark:border-dark-800 pb-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-2 block">Correction en cours</span>
                                    <h2 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight">{selectedMission.studentName}</h2>
                                    <p className="text-dark-500 font-medium">Mission : Sourate {selectedMission.targetId} ({selectedMission.customDescription || 'Récitation maison'})</p>
                                </div>
                                <button onClick={() => setSelectedMission(null)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-xl transition-colors">
                                    <FiX size={24} className="text-dark-400" />
                                </button>
                            </div>

                            {/* Player */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <FiMusic className="text-emerald-500" /> 1. Écouter la récitation
                                </h3>
                                <div className="bg-dark-50 dark:bg-dark-950 p-6 rounded-3xl border border-dark-100 dark:border-dark-800 flex flex-col items-center gap-4">
                                    <audio src={selectedMission.audioUrl} controls className="w-full h-12 accent-primary-600" />
                                    <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Format Audio: WebM / OPUS</p>
                                </div>
                            </div>

                            {/* Evaluation Form */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <FiMessageSquare className="text-amber-500" /> 2. Évaluation & Feedback
                                </h3>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-dark-700 dark:text-dark-300 mb-1">Score Qualité (1-5)</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setQualityScore(star)}
                                                className={`flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${qualityScore === star ? 'bg-amber-50 border-amber-400 text-amber-600' : 'bg-white dark:bg-dark-800 border-dark-100 dark:border-dark-700 text-dark-400 hover:border-dark-300'}`}
                                            >
                                                <FiStar size={20} className={star <= qualityScore ? 'fill-amber-400' : ''} />
                                                <span className="text-[10px] font-black tracking-tighter uppercase">{star === 5 ? 'Parfait' : star === 1 ? 'À refaire' : star}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-dark-700 dark:text-dark-300 mb-2">Commentaires Pédagogiques</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Ex: Attention à la prononciation du 'Ra' au verset 3..."
                                        className="w-full bg-dark-50 dark:bg-dark-950 border-dark-100 dark:border-dark-800 rounded-3xl p-5 min-h-[120px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-dark-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={isSubmitting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95"
                                >
                                    {isSubmitting ? <div className="spinner w-6 h-6 border-white" /> : <>Terminer & Noter <FiCheck size={24} /></>}
                                </button>
                                <p className="text-center text-[10px] text-dark-400 font-bold uppercase tracking-widest">L'élève recevra une notification immédiate</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-dark-50 dark:bg-dark-900/30 rounded-4xl p-12 text-center border-2 border-dashed border-dark-100 dark:border-dark-800 h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-white dark:bg-dark-900 rounded-3xl shadow-sm flex items-center justify-center text-dark-200 mb-6">
                                <FiMusic size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-dark-400">Sélectionnez une soumission</h3>
                            <p className="text-dark-400 mt-2 max-w-[280px]">Cliquez sur un élève dans la liste de gauche pour écouter sa récitation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
