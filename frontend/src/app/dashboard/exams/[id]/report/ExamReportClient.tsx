'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { examApi } from '@/lib/api/client';
import { ExamReportResponse, ExamType, VerseEvaluationStatus, WordAnnotationType } from '@/types';
import {
    FiArrowLeft, FiPrinter, FiDownload, FiCheckCircle, FiAlertCircle,
    FiXCircle, FiActivity, FiInfo, FiClock, FiTarget, FiCalendar,
    FiBookOpen, FiAward
} from 'react-icons/fi';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const TYPE_LABELS: Record<string, string> = {
    [ExamType.Hifdh]: 'Hifdh', [ExamType.Revision]: 'Révision',
    [ExamType.Tajwid]: 'Tajwid', [ExamType.Reading]: 'Lecture',
};

function gradeLabel(score: number): { label: string; color: string; bg: string } {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'from-emerald-500 to-teal-600' };
    if (score >= 75) return { label: 'Bien', color: 'text-blue-600', bg: 'from-blue-500 to-indigo-600' };
    if (score >= 55) return { label: 'Moyen', color: 'text-amber-600', bg: 'from-amber-500 to-orange-600' };
    return { label: 'Insuffisant', color: 'text-red-600', bg: 'from-red-500 to-rose-600' };
}

// SVG Radial gauge — pure CSS, no library
function ScoreGauge({ score }: { score: number }) {
    const grade = gradeLabel(score);
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-dark-100 dark:text-dark-700" />
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
                    stroke="url(#gaugeGrad)" strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out" />
                <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'} />
                        <stop offset="100%" stopColor={score >= 75 ? '#6366f1' : score >= 55 ? '#f97316' : '#f43f5e'} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-dark-900 dark:text-white">{score}%</span>
                <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
            </div>
        </div>
    );
}

// Mock fallback
const MOCK_REPORT: ExamReportResponse = {
    examId: 'ex1', title: 'Hifdh — Sourate Al-Mulk', studentName: 'Ahmed Al-Farsi',
    examType: ExamType.Hifdh, examDate: '2026-02-20T09:00:00',
    surahName: 'Al-Mulk', startVerse: 1, endVerse: 5,
    totalVersesEvaluated: 5, blockedCount: 1, forgottenCount: 0, tajwidErrorCount: 2,
    finalScore: 88, duration: 25,
    globalComment: 'Très bon travail global. Quelques erreurs de tajwid sur les lettres solaires. La mémorisation est solide, continuer les révisions.',
    verseDetails: [
        { verseNumber: 1, textArabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', status: VerseEvaluationStatus.Correct, assistanceGiven: false, wordAnnotations: [] },
        { verseNumber: 2, textArabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', status: VerseEvaluationStatus.Correct, assistanceGiven: false, wordAnnotations: [{ wordIndex: 3, wordText: 'وَالْحَيَاةَ', type: WordAnnotationType.TajwidError }] },
        { verseNumber: 3, textArabic: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِنْ تَفَاوُتٍ', status: VerseEvaluationStatus.Blocked, assistanceGiven: true, comment: 'Hésitation sur le début du verset', wordAnnotations: [{ wordIndex: 5, wordText: 'طِبَاقًا', type: WordAnnotationType.Blocked }] },
        { verseNumber: 4, textArabic: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', status: VerseEvaluationStatus.Correct, assistanceGiven: false, wordAnnotations: [{ wordIndex: 6, wordText: 'يَنْقَلِبْ', type: WordAnnotationType.TajwidError }] },
        { verseNumber: 5, textArabic: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِلشَّيَاطِينِ', status: VerseEvaluationStatus.Correct, assistanceGiven: false, wordAnnotations: [] },
    ],
};

export default function ExamReportClient() {
    const { id } = useParams() as { id: string };
    const [report, setReport] = useState<ExamReportResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const { data } = await examApi.getReport(id);
                setReport(data);
            } catch {
                setReport(MOCK_REPORT);
            } finally { setLoading(false); }
        };
        loadReport();
    }, [id]);

    if (loading) return <PageSkeleton variant="detail" />;

    if (!report) return <div className="text-center py-12 text-dark-400">Rapport non trouvé.</div>;

    const grade = gradeLabel(report.finalScore);
    const correctCount = report.verseDetails.filter(v => v.status === VerseEvaluationStatus.Correct).length;

    return (
        <div className="space-y-5">
            {/* ══ Header ══ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <Link href="/dashboard/exams" className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-primary-600 font-medium">
                    <FiArrowLeft size={14} /> Retour aux examens
                </Link>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dark-200 dark:border-dark-700 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                        <FiPrinter size={13} /> Imprimer
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
                        <FiDownload size={13} /> Rapport PDF
                    </button>
                </div>
            </div>

            {/* ══ Score Hero ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className={`bg-gradient-to-br ${grade.bg} p-8 text-white`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                            <ScoreGauge score={report.finalScore} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold mb-1">{report.title || 'Rapport d\'Examen'}</h1>
                            <p className="text-white/80 text-lg font-medium">{report.studentName}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-white/70">
                                <span className="flex items-center gap-1"><FiBookOpen size={12} /> {report.surahName} ({report.startVerse}–{report.endVerse})</span>
                                {report.examType && <span className="flex items-center gap-1"><FiTarget size={12} /> {TYPE_LABELS[report.examType] || report.examType}</span>}
                                {report.examDate && <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(report.examDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
                                {report.duration && <span className="flex items-center gap-1"><FiClock size={12} /> {report.duration} min</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-y md:divide-y-0 divide-dark-100 dark:divide-dark-800">
                    {[
                        { icon: <FiActivity size={18} className="text-indigo-500" />, label: 'Versets évalués', value: report.totalVersesEvaluated, color: 'text-dark-900 dark:text-white' },
                        { icon: <FiCheckCircle size={18} className="text-emerald-500" />, label: 'Corrects', value: correctCount, color: 'text-emerald-600' },
                        { icon: <FiAlertCircle size={18} className="text-orange-500" />, label: 'Bloqués', value: report.blockedCount, color: 'text-orange-600' },
                        { icon: <FiXCircle size={18} className="text-red-500" />, label: 'Oubliés', value: report.forgottenCount, color: 'text-red-600' },
                        { icon: <FiInfo size={18} className="text-blue-500" />, label: 'Err. Tajwid', value: report.tajwidErrorCount, color: 'text-blue-600' },
                    ].map(s => (
                        <div key={s.label} className="p-4 flex flex-col items-center gap-1.5">
                            {s.icon}
                            <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                            <span className="text-[9px] text-dark-400 uppercase tracking-wider font-bold">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ Comment ══ */}
            {report.globalComment && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30 p-5">
                    <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiAward size={12} /> Commentaire de l&apos;examinateur
                    </h3>
                    <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed italic">&ldquo;{report.globalComment}&rdquo;</p>
                </div>
            )}

            {/* ══ Verse-by-verse breakdown ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="p-5 border-b border-dark-100 dark:border-dark-800">
                    <h3 className="text-base font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <FiBookOpen size={15} className="text-primary-600" /> Détails par verset
                    </h3>
                </div>
                <div className="divide-y divide-dark-50 dark:divide-dark-800">
                    {report.verseDetails.map(verse => {
                        const statusCfg = verse.status === VerseEvaluationStatus.Correct
                            ? { label: 'Correct', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-l-emerald-500' }
                            : verse.status === VerseEvaluationStatus.Blocked
                                ? { label: 'Bloqué', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-l-orange-500' }
                                : { label: 'Oublié', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-l-red-500' };

                        return (
                            <div key={verse.verseNumber} className={`p-5 border-l-4 ${statusCfg.border}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-dark-800 dark:bg-dark-700 flex items-center justify-center text-white text-xs font-bold">
                                            {verse.verseNumber}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                                        {verse.assistanceGiven && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Aide donnée</span>}
                                    </div>
                                    {verse.wordAnnotations.length > 0 && (
                                        <span className="text-[10px] text-dark-400">{verse.wordAnnotations.length} annotation{verse.wordAnnotations.length > 1 ? 's' : ''}</span>
                                    )}
                                </div>

                                {/* Arabic text with highlighted words */}
                                <div className="text-xl font-arabic leading-[2.2] text-right mb-2" dir="rtl">
                                    {verse.textArabic.split(' ').map((word, idx) => {
                                        const annotation = verse.wordAnnotations.find(a => a.wordIndex === idx);
                                        let bgColor = '';
                                        let border = '';
                                        if (annotation?.type === WordAnnotationType.Blocked) { bgColor = 'bg-orange-200 dark:bg-orange-800/40'; border = 'border-b-2 border-orange-400'; }
                                        else if (annotation?.type === WordAnnotationType.Forgotten) { bgColor = 'bg-red-200 dark:bg-red-800/40'; border = 'border-b-2 border-red-400'; }
                                        else if (annotation?.type === WordAnnotationType.TajwidError) { bgColor = 'bg-blue-200 dark:bg-blue-800/40'; border = 'border-b-2 border-blue-400'; }
                                        return (
                                            <span key={idx} className={`px-1 py-0.5 rounded ${bgColor} ${border} inline-block mx-0.5`}
                                                title={annotation ? `${annotation.type}${annotation.comment ? ': ' + annotation.comment : ''}` : undefined}>
                                                {word}
                                            </span>
                                        );
                                    })}
                                </div>

                                {verse.comment && (
                                    <p className="text-xs text-dark-400 italic mt-2 flex items-center gap-1" dir="ltr">
                                        <FiInfo size={10} /> {verse.comment}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
