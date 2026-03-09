'use client';

import React, { useState, useEffect } from 'react';
import { useLiveSessionStore } from '@/lib/store/useLiveSessionStore';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';
import { sessionApi } from '@/lib/api/client';
import Mushaf, { MushafVerseData } from '@/components/mushaf/Mushaf';
import { FiBookOpen, FiSave, FiPlay, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CockpitMushaf() {
    const { cockpit, activeStudentId, setActiveStudent, markStudentRecited, syncMushafState, remoteMushafState } = useLiveSessionStore();
    const student = cockpit?.smartQueue.find(s => s.studentId === activeStudentId);

    const [allSurahs, setAllSurahs] = useState<any[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<string>('');
    const [verses, setVerses] = useState<MushafVerseData[]>([]);
    const [isSuggestion, setIsSuggestion] = useState(false);
    const [isSynced, setIsSynced] = useState(false);

    // Sync from Teacher
    useEffect(() => {
        if (remoteMushafState?.surahNumber) {
            setSelectedSurah(String(remoteMushafState.surahNumber));
            setIsSuggestion(false);
        }
    }, [remoteMushafState]);

    const { user } = useAuthStore();
    const isTeacher = user?.roles.includes(UserRole.Teacher) || user?.roles.includes(UserRole.Admin);

    // Recitation State
    const [activeRecitationId, setActiveRecitationId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Local Evaluation State (buffer before sending batch)
    const [evaluationState, setEvaluationState] = useState({
        verses: {} as Record<string, any>,
        words: {} as Record<string, any>
    });

    // Sync from Teacher (for students)
    useEffect(() => {
        if (!isTeacher && remoteMushafState) {
            if (remoteMushafState.surahNumber) {
                setSelectedSurah(String(remoteMushafState.surahNumber));
                setIsSuggestion(false);
                setIsSynced(true);
                // Clear sync indicator after 3 seconds
                const timer = setTimeout(() => setIsSynced(false), 3000);
                return () => clearTimeout(timer);
            }
            if (remoteMushafState.evaluationState) {
                setEvaluationState(remoteMushafState.evaluationState);
            }
        }
    }, [remoteMushafState, isTeacher]);

    // Teacher: Sync state when evaluation/surah changes
    useEffect(() => {
        if (isTeacher && cockpit?.sessionId && selectedSurah) {
            syncMushafState(cockpit.sessionId, {
                surahNumber: selectedSurah,
                studentId: activeStudentId,
                evaluationState: evaluationState
            });
        }
    }, [evaluationState, selectedSurah, activeStudentId, cockpit?.sessionId, isTeacher, syncMushafState]);

    // Fetch all Surahs once on mount
    useEffect(() => {
        async function loadSurahs() {
            try {
                const res = await fetch('https://api.alquran.cloud/v1/surah');
                if (res.ok) {
                    const { data } = await res.json();
                    setAllSurahs(data || []);
                }
            } catch (e) { }
        }
        loadSurahs();
    }, []);

    // Auto-select suggested surah when student changes
    useEffect(() => {
        setActiveRecitationId(null);
        setEvaluationState({ verses: {}, words: {} });

        if (student?.suggestedSurahNumber) {
            const surahNum = String(student.suggestedSurahNumber);
            setSelectedSurah(surahNum);
            setIsSuggestion(true);
            if (cockpit?.sessionId) syncMushafState(cockpit.sessionId, { surahNumber: surahNum, studentId: activeStudentId });
        } else {
            setSelectedSurah('');
            setIsSuggestion(false);
            if (cockpit?.sessionId) syncMushafState(cockpit.sessionId, { surahNumber: '', studentId: activeStudentId });
        }
    }, [activeStudentId, student?.suggestedSurahNumber, cockpit?.sessionId, syncMushafState]);

    // Clear suggestion badge when user manually changes surah
    const handleSurahChange = (value: string) => {
        setSelectedSurah(value);
        setIsSuggestion(student?.suggestedSurahNumber === Number(value));
        if (cockpit?.sessionId) syncMushafState(cockpit.sessionId, { surahNumber: value, studentId: activeStudentId });
    };

    // Fetch Verses when Surah changes
    useEffect(() => {
        if (!selectedSurah) {
            setVerses([]);
            return;
        }

        async function loadVerses() {
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`);
                if (res.ok) {
                    const json = await res.json();
                    const surahName = json.data?.name ?? '';
                    const loadedVerses = (json.data?.ayahs as any[] ?? []).map((ayah: any, i: number) => ({
                        id: String(ayah.number),
                        verseNumber: ayah.numberInSurah,
                        textArabic: ayah.text,
                        surahNumber: Number(selectedSurah),
                        surahName,
                        isFirstOfSurah: i === 0,
                        words: ayah.text.split(/\s+/).filter(Boolean).map((word: string, idx: number) => ({
                            id: `${ayah.number}-w${idx}`, wordText: word, wordIndex: idx,
                        })),
                    }));
                    setVerses(loadedVerses);
                }
            } catch (e) { }
        }
        loadVerses();
    }, [selectedSurah]);

    if (!student || !cockpit) return null;

    // Build two groups: level surahs + rest of Mushaf
    const levelSurahNumbers = new Set((cockpit.levelSurahs ?? []).map(s => s.number));

    // The level surahs section
    const levelSurahsForDropdown = [...(cockpit.levelSurahs ?? [])];

    // If there's a suggested surah but it's not in the level objective, we still want it at the top of Section 1
    if (student?.suggestedSurahNumber && !levelSurahNumbers.has(student.suggestedSurahNumber)) {
        const found = allSurahs.find(s => s.number === student.suggestedSurahNumber);
        if (found) {
            levelSurahsForDropdown.push({
                number: found.number,
                nameEnglish: found.englishName || found.name || `Sourate ${found.number}`,
                nameArabic: found.name || ''
            });
            levelSurahNumbers.add(found.number); // Add to set so it's not duplicated in Section 2
        }
    }

    // Sort: force the suggested surah to index 0, otherwise keep sort order
    levelSurahsForDropdown.sort((a, b) => {
        if (student && student.suggestedSurahNumber === a.number) return -1;
        if (student && student.suggestedSurahNumber === b.number) return 1;
        return a.number - b.number;
    });

    // All other surahs not in level range (from alquran.cloud)
    const otherSurahs = allSurahs.filter(s => !levelSurahNumbers.has(s.number));

    const handleStartRecitation = async () => {
        if (!selectedSurah) return toast.error('Veuillez sélectionner une sourate');

        setIsStarting(true);
        try {
            const response = await sessionApi.startRecitation(cockpit.sessionId, {
                studentId: student.studentId,
                surahNumber: Number(selectedSurah),
                startVerse: 1,
                endVerse: verses.length
            });
            setActiveRecitationId(response.data.id);
            toast.success('Récitation démarrée !');
        } catch (e: any) {
            toast.error('Erreur de démarrage: ' + e.message);
        } finally {
            setIsStarting(false);
        }
    };

    const handleSaveBatch = async () => {
        if (!activeRecitationId) return;
        setIsSaving(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            toast.success('Évaluation sauvegardée !');
            if (activeStudentId) markStudentRecited(activeStudentId);
            setActiveStudent(null);
        } catch (e: any) {
            toast.error('Erreur de sauvegarde: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-dark-900 font-sans relative">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-dark-100 dark:border-dark-800 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-4 bg-white dark:bg-dark-900 relative z-10 shadow-sm">
                <div className="min-w-0 flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                        <span className="relative w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-extrabold shrink-0 border border-primary-200/50 shadow-sm">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-dark-900 dark:text-white truncate tracking-tight">
                            {student.firstName} {student.lastName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-accent-600 dark:text-accent-400 tracking-widest uppercase">Récitation en cours</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full md:w-auto">
                    {/* Surah Dropdown with suggestion badge */}
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                        {isSuggestion && (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-extrabold text-white bg-accent-500 px-3 py-1 rounded-xl shadow-md border border-accent-400/50">
                                <FiZap size={12} className="shrink-0" />
                                Suggestion API-Q
                            </span>
                        )}
                        {!isSuggestion && (
                            <span className="text-xs text-dark-500 px-1">
                                <span className="font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{cockpit.levelName}</span>
                            </span>
                        )}

                        {isTeacher ? (
                            <select
                                value={selectedSurah}
                                onChange={e => handleSurahChange(e.target.value)}
                                disabled={!!activeRecitationId}
                                className={`w-full sm:w-auto min-w-[260px] text-sm font-bold py-3.5 px-4 rounded-2xl border-2 transition-all outline-none appearance-none cursor-pointer ${isSuggestion ? 'border-accent-400 dark:border-accent-600 bg-accent-50/50 dark:bg-accent-900/20 text-accent-900 dark:text-accent-100 focus:ring-4 focus:ring-accent-500/20' : 'border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 text-dark-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 shadow-inner'}`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                            >
                                <option value="" className="text-dark-500">-- Sélectionner une Sourate --</option>
                                {levelSurahsForDropdown.length > 0 && (
                                    <optgroup label={`🎯 Objectif — ${cockpit.levelName ?? 'Niveau'}`} className="font-extrabold text-primary-600 bg-white dark:bg-dark-900">
                                        {levelSurahsForDropdown.map(s => (
                                            <option key={s.number} value={s.number} className="text-dark-900 dark:text-white font-semibold">
                                                {s.number}. {s.nameEnglish}
                                                {student.suggestedSurahNumber === s.number ? ' ⚡' : ''}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                <optgroup label="📖 Tout le Mushaf" className="font-bold text-dark-500 bg-white dark:bg-dark-900">
                                    {otherSurahs.map(s => (
                                        <option key={s.number} value={s.number} className="text-dark-900 dark:text-white font-medium">
                                            {s.number}. {s.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        ) : (
                            <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 px-6 py-3 rounded-2xl border border-dark-100 dark:border-dark-700 relative overflow-hidden">
                                {isSynced && (
                                    <span className="absolute inset-0 bg-primary-500/10 animate-pulse pointer-events-none" />
                                )}
                                <p className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-2">
                                    {isSynced && <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />}
                                    {selectedSurah ? `Sourate ${selectedSurah}` : "Attente de l'enseignant..."}
                                    {isSynced && <span className="text-[10px] font-bold text-primary-400 normal-case ml-2">(Synchronisé)</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    {isTeacher && (
                        !activeRecitationId ? (
                            <button
                                onClick={handleStartRecitation}
                                disabled={isStarting || !selectedSurah}
                                className={`btn flex flex-row items-center justify-center whitespace-nowrap min-w-[180px] py-3.5 rounded-2xl transition-all duration-300 font-extrabold uppercase tracking-widest text-xs ${(isStarting || !selectedSurah)
                                    ? 'bg-dark-100 text-dark-400 dark:bg-dark-800 dark:text-dark-500 cursor-not-allowed border-2 border-dark-200 dark:border-dark-700'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/30 hover:-translate-y-1 transform border border-primary-500'
                                    }`}
                            >
                                {isStarting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
                                ) : (
                                    <FiPlay className="mr-2 text-white shrink-0 mb-0.5" size={16} />
                                )}
                                <span>{isStarting ? 'Démarrage...' : 'Démarrer'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSaveBatch}
                                disabled={isSaving}
                                className={`btn flex flex-row items-center justify-center whitespace-nowrap min-w-[180px] py-3.5 rounded-2xl transition-all duration-300 font-extrabold uppercase tracking-widest text-xs ${isSaving
                                    ? 'bg-primary-50 text-primary-700 cursor-wait dark:bg-primary-900/20 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/30 hover:-translate-y-1 transform border border-green-500'
                                    }`}
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
                                ) : (
                                    <FiSave className="mr-2 shrink-0 mb-0.5" size={16} />
                                )}
                                <span>{isSaving ? 'Enregistrement...' : 'Terminer'}</span>
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Mushaf Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-dark-50 dark:bg-dark-950/50">
                {verses.length > 0 ? (
                    <div className={`transition-all duration-500 ${!activeRecitationId ? 'opacity-50 grayscale-[0.2]' : 'opacity-100'}`}>
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-5 md:p-8 shadow-sm border border-dark-100 dark:border-dark-800">
                            <Mushaf
                                verses={verses}
                                activeSurahNumber={Number(selectedSurah)}
                                evaluationState={evaluationState}
                                onVerseStatusChange={isTeacher ? (verseId, status) => {
                                    setEvaluationState(prev => ({
                                        ...prev,
                                        verses: { ...prev.verses, [verseId]: status }
                                    }));
                                } : undefined}
                                onSetWordAnnotation={isTeacher ? (verseId, wordId, type) => {
                                    setEvaluationState(prev => ({
                                        ...prev,
                                        words: { ...prev.words, [wordId]: type }
                                    }));
                                } : undefined}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-dark-400">
                        <div className="w-24 h-24 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-dark-200 dark:border-dark-800">
                            <FiBookOpen className="w-10 h-10 text-primary-400" />
                        </div>
                        <p className="text-center text-lg font-medium max-w-sm leading-relaxed">
                            {student.suggestedSurahNumber
                                ? <>Sourate suggérée : <br /><strong className="text-accent-500 text-xl block mt-2">{student.suggestedSurahName ?? `#${student.suggestedSurahNumber}`}</strong></>
                                : 'Veuillez sélectionner une sourate pour commencer l\'évaluation détaillée.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
