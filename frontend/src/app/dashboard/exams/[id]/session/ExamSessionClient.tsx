'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Mushaf from '@/components/mushaf/Mushaf';
import { examApi, mushafApi } from '@/lib/api/client';
import { VerseResponse, ExamResponse, ExamType, VerseEvaluationStatus, WordAnnotationType } from '@/types';
import {
    FiCheckCircle, FiXCircle, FiInfo, FiArrowLeft, FiClock, FiTarget,
    FiAlertTriangle, FiSlash, FiActivity, FiBookOpen
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const TYPE_LABELS: Record<ExamType, string> = {
    [ExamType.Hifdh]: 'Hifdh',
    [ExamType.Revision]: 'Révision',
    [ExamType.Tajwid]: 'Tajwid',
    [ExamType.Reading]: 'Lecture',
};

function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ExamSessionClient = () => {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [exam, setExam] = useState<ExamResponse | null>(null);
    const [verses, setVerses] = useState<VerseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [evaluationState, setEvaluationState] = useState<{
        verses: Record<string, VerseEvaluationStatus>;
        words: Record<string, WordAnnotationType>;
    }>({ verses: {}, words: {} });
    const [globalComment, setGlobalComment] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [showConfirm, setShowConfirm] = useState<'complete' | 'cancel' | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: examData } = await examApi.getById(id);
                setExam(examData);
                const { data: versesData } = await mushafApi.getVerses(
                    examData.surahId?.toString() || '',
                    (examData.startVerse || 0).toString(),
                    (examData.endVerse || 0).toString()
                );
                setVerses(versesData);
            } catch {
                // Mock data fallback
                setExam({
                    id, title: 'Hifdh — Sourate Al-Mulk', type: ExamType.Hifdh, examDate: new Date().toISOString(),
                    studentId: '1', studentName: 'Ahmed Al-Farsi', examinerId: 'u1', examinerName: 'Cheikh Ibrahim',
                    surahId: 's67', surahName: 'Al-Mulk', startVerse: 1, endVerse: 10,
                    finalStatus: 'InProgress' as any, finalScore: 0, createdAt: new Date().toISOString(),
                    groupId: '1', groupName: 'Groupe Al-Fatiha', isLevelProgressionExam: false,
                });
                toast.error('Mode démonstration — données simulées');
            } finally { setLoading(false); }
        };
        loadData();
    }, [id]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleWordClick = useCallback(async (verseId: string, wordId: string, wordText: string) => {
        const current = evaluationState.words[wordId];
        let next: WordAnnotationType | undefined;
        if (!current) next = WordAnnotationType.Blocked;
        else if (current === WordAnnotationType.Blocked) next = WordAnnotationType.Forgotten;
        else if (current === WordAnnotationType.Forgotten) next = WordAnnotationType.TajwidError;
        else next = undefined;

        setEvaluationState(prev => ({
            ...prev,
            words: next ? { ...prev.words, [wordId]: next } : (() => { const w = { ...prev.words }; delete w[wordId]; return w; })(),
        }));
    }, [evaluationState.words]);

    const handleVerseStatusChange = useCallback(async (verseId: string, status: VerseEvaluationStatus | undefined) => {
        if (!status) {
            setEvaluationState(prev => {
                const v = { ...prev.verses };
                delete v[verseId];
                return { ...prev, verses: v };
            });
            return;
        }
        try {
            await examApi.annotateVerse(id, { verseId, status, assistanceGiven: status === VerseEvaluationStatus.Blocked, comment: '' });
            setEvaluationState(prev => ({ ...prev, verses: { ...prev.verses, [verseId]: status } }));
            toast.success('Verset annoté');
        } catch {
            toast.error("Erreur lors de l'annotation");
        }
    }, [id]);

    const handleComplete = async () => {
        try {
            await examApi.complete(id, globalComment);
            toast.success('Examen terminé avec succès !');
            router.push(`/dashboard/exams/${id}/report`);
        } catch {
            toast.error("Erreur lors de la clôture");
        }
    };

    const handleCancel = async () => {
        try {
            await examApi.cancel(id);
            toast.success('Examen annulé');
            router.push('/dashboard/exams');
        } catch {
            toast.error("Erreur lors de l'annulation");
        }
    };

    // ── Computed stats ────────────────────────────────────────────────────────
    const totalVerses = exam ? ((exam.endVerse || 0) - (exam.startVerse || 0) + 1) : 0;
    const evaluatedCount = Object.keys(evaluationState.verses).length;
    const progressPct = totalVerses > 0 ? Math.round((evaluatedCount / totalVerses) * 100) : 0;

    const annotationCounts = {
        correct: Object.values(evaluationState.verses).filter(v => v === VerseEvaluationStatus.Correct).length,
        blocked: Object.values(evaluationState.verses).filter(v => v === VerseEvaluationStatus.Blocked).length,
        forgotten: Object.values(evaluationState.verses).filter(v => v === VerseEvaluationStatus.Forgotten).length,
        wordBlocked: Object.values(evaluationState.words).filter(w => w === WordAnnotationType.Blocked).length,
        wordForgotten: Object.values(evaluationState.words).filter(w => w === WordAnnotationType.Forgotten).length,
        wordTajwid: Object.values(evaluationState.words).filter(w => w === WordAnnotationType.TajwidError).length,
    };

    if (loading) return <PageSkeleton variant="detail" />;

    if (!exam) return <div className="text-center py-12 text-dark-400">Session non trouvée.</div>;

    return (
        <div className="space-y-4">
            {/* ══ Header ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <Link href="/dashboard/exams" className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-primary-600 font-medium mb-2">
                            <FiArrowLeft size={12} /> Retour aux examens
                        </Link>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-dark-900 dark:text-white">{exam.title}</h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> En cours
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-dark-500">
                            <span className="flex items-center gap-1"><FiTarget size={11} /> {TYPE_LABELS[exam.type] || exam.type}</span>
                            <Link href={`/dashboard/students/${exam.studentId}`} className="text-primary-600 hover:text-primary-700 font-medium">{exam.studentName}</Link>
                            <span>{exam.surahName} ({exam.startVerse}–{exam.endVerse})</span>
                            {exam.groupName && (
                                <Link href={`/dashboard/groups/${exam.groupId}`} className="text-dark-400 hover:text-dark-600"><FiBookOpen size={10} className="inline mr-0.5" />{exam.groupName}</Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-dark-50 dark:bg-dark-800 rounded-xl px-4 py-2 text-center mr-2">
                            <p className="text-[9px] text-dark-400 uppercase tracking-wider font-bold">Temps</p>
                            <p className="text-lg font-mono font-bold text-dark-900 dark:text-white">{formatElapsed(elapsed)}</p>
                        </div>
                        <button onClick={() => setShowConfirm('cancel')}
                            className="px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-bold text-dark-500 hover:text-red-500 hover:border-red-200 transition-colors flex items-center gap-1.5">
                            <FiSlash size={13} /> Annuler
                        </button>
                        <button onClick={() => setShowConfirm('complete')}
                            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                            <FiCheckCircle size={14} /> Terminer
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-dark-50 dark:border-dark-800">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-dark-500 font-medium">{evaluatedCount}/{totalVerses} versets évalués</span>
                        <span className="font-bold text-primary-600">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            </div>

            {/* ══ Main: Mushaf + Sidebar ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Mushaf */}
                <div className="lg:col-span-3">
                    <Mushaf
                        verses={verses}
                        onWordClick={handleWordClick}
                        onVerseStatusChange={handleVerseStatusChange}
                        evaluationState={evaluationState}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Live counts */}
                    <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
                        <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-3 flex items-center gap-1.5"><FiActivity size={13} className="text-primary-600" /> Annotations</h3>
                        <div className="space-y-2.5">
                            {/* Verse-level */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Corrects</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{annotationCounts.correct}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-orange-400" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Bloqués</span>
                                </div>
                                <span className="text-sm font-bold text-orange-600">{annotationCounts.blocked}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-red-400" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Oubliés</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">{annotationCounts.forgotten}</span>
                            </div>

                            <div className="border-t border-dark-50 dark:border-dark-800 pt-2 mt-2" />
                            <p className="text-[10px] text-dark-400 uppercase tracking-wider font-bold">Mots annotés</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-orange-200 border border-orange-400" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Bloqué</span>
                                </div>
                                <span className="text-sm font-bold text-orange-600">{annotationCounts.wordBlocked}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Oublié</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">{annotationCounts.wordForgotten}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">Tajwid</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">{annotationCounts.wordTajwid}</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
                        <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-3 flex items-center gap-1.5"><FiInfo size={13} className="text-dark-400" /> Légende</h3>
                        <p className="text-[10px] text-dark-400 leading-relaxed">
                            Cliquez sur un mot pour alterner entre <span className="text-orange-600 font-bold">Bloqué</span> → <span className="text-red-600 font-bold">Oublié</span> → <span className="text-blue-600 font-bold">Tajwid</span> → Normal.
                            Utilisez les contrôles de verset pour marquer le statut global de chaque verset.
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4">
                        <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-3">Commentaire global</h3>
                        <textarea value={globalComment} onChange={e => setGlobalComment(e.target.value)}
                            placeholder="Notes de l'examinateur…"
                            className="w-full h-28 p-3 text-sm border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-300 focus:ring-2 focus:ring-primary-500 resize-none" />
                    </div>
                </div>
            </div>

            {/* ══ Confirm Modal ══ */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(null)} />
                    <div className="relative bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 shadow-2xl w-full max-w-sm p-6 animate-slide-up">
                        <div className="text-center mb-5">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${showConfirm === 'complete' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {showConfirm === 'complete' ? <FiCheckCircle size={22} /> : <FiAlertTriangle size={22} />}
                            </div>
                            <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                                {showConfirm === 'complete' ? 'Terminer l\'examen ?' : 'Annuler l\'examen ?'}
                            </h3>
                            <p className="text-sm text-dark-400 mt-1">
                                {showConfirm === 'complete'
                                    ? `${evaluatedCount}/${totalVerses} versets évalués — Le rapport sera généré automatiquement.`
                                    : 'L\'examen sera marqué comme annulé et les annotations perdues.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                                Retour
                            </button>
                            <button onClick={showConfirm === 'complete' ? handleComplete : handleCancel}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors ${showConfirm === 'complete' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                {showConfirm === 'complete' ? 'Terminer' : 'Annuler l\'examen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSessionClient;
