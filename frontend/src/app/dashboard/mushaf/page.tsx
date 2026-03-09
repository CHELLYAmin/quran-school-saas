'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Mushaf, { MushafVerseData } from '@/components/mushaf/Mushaf';
import { VerseEvaluationStatus, WordAnnotationType } from '@/types';
import {
    FiSearch, FiChevronRight, FiChevronLeft, FiCheck,
    FiAlertTriangle, FiXCircle, FiType, FiBookOpen, FiChevronDown, FiZoomIn, FiZoomOut
} from 'react-icons/fi';

// ─── Types ─────────────────────────────────────────────────────────────────
interface SurahInfo {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
}

// ─── API (single call per surah) ────────────────────────────────────────────
async function loadSurahList(): Promise<SurahInfo[]> {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    return (json.data as any[]).map((s) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        numberOfAyahs: s.numberOfAyahs,
    }));
}

async function loadSurahVerses(surahNumber: number): Promise<MushafVerseData[]> {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!res.ok) {
        // Fallback to simpler edition
        const res2 = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`);
        if (!res2.ok) return [];
        const j2 = await res2.json();
        return mapAyahs(j2.data?.ayahs ?? [], j2.data?.name ?? '', j2.data?.number ?? surahNumber, true);
    }
    const json = await res.json();
    return mapAyahs(json.data?.ayahs ?? [], json.data?.name ?? '', json.data?.number ?? surahNumber, true);
}

function mapAyahs(ayahs: any[], surahName: string, surahNumber: number, isFirstOfSurah: boolean): MushafVerseData[] {
    return ayahs.map((ayah: any, i: number) => ({
        id: String(ayah.number),
        verseNumber: ayah.numberInSurah,
        textArabic: ayah.text,
        words: (ayah.text as string).split(/\s+/).filter(Boolean).map((w: string, wi: number) => ({
            id: `${ayah.number}-w${wi}`,
            wordText: w,
            wordIndex: wi,
        })),
        surahNumber,
        surahName,
        isFirstOfSurah: i === 0 ? isFirstOfSurah : false,
    }));
}

const VERSES_PER_PAGE = 15;

// ─── Component ───────────────────────────────────────────────────────────────
export default function MushafPage() {
    const [surahs, setSurahs] = useState<SurahInfo[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
    const [allVerses, setAllVerses] = useState<MushafVerseData[]>([]); // full surah
    const [pageIndex, setPageIndex] = useState(0);   // which "mushaf page" within the surah
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    const [loadingVerses, setLoadingVerses] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [quranFont, setQuranFont] = useState('font-madani');
    const [quranFontSize, setQuranFontSize] = useState(28);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [evaluationState, setEvaluationState] = useState({
        verses: {} as Record<string, VerseEvaluationStatus>,
        words: {} as Record<string, WordAnnotationType>,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Load surah list on mount
    useEffect(() => {
        loadSurahList()
            .then(async (data) => {
                setSurahs(data);
                const fatiha = data.find(s => s.number === 1);
                if (fatiha) await selectSurah(fatiha);
            })
            .catch(console.error)
            .finally(() => setLoadingSurahs(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectSurah = useCallback(async (surah: SurahInfo) => {
        setSelectedSurah(surah);
        setDropdownOpen(false);
        setSearchQuery('');
        setPageIndex(0);
        setEvaluationState({ verses: {}, words: {} });
        setLoadingVerses(true);
        try {
            const verses = await loadSurahVerses(surah.number);
            setAllVerses(verses);
        } catch (err) {
            console.error('Failed to load surah:', err);
        } finally {
            setLoadingVerses(false);
        }
    }, []);

    // Paginate: verses shown on current page
    const totalPages = Math.ceil(allVerses.length / VERSES_PER_PAGE);
    const pageVerses = allVerses.slice(pageIndex * VERSES_PER_PAGE, (pageIndex + 1) * VERSES_PER_PAGE);

    // Stats — rule: unannotated verse = correct
    const wordErrors = Object.keys(evaluationState.words).length;
    const versesBlocked = Object.values(evaluationState.verses).filter(v => v === VerseEvaluationStatus.Blocked).length;
    const versesForgotten = Object.values(evaluationState.verses).filter(v => v === VerseEvaluationStatus.Forgotten).length;
    const versesCorrect = allVerses.length - versesBlocked - versesForgotten;

    // Handlers
    const handleSetWordAnnotation = useCallback((_: string, wordId: string, type: WordAnnotationType | undefined) => {
        setEvaluationState(prev => {
            const words = { ...prev.words };
            if (type !== undefined) words[wordId] = type; else delete words[wordId];
            return { ...prev, words };
        });
    }, []);

    const handleWordClick = useCallback((_: string, wordId: string) => {
        setEvaluationState(prev => {
            const words = { ...prev.words };
            const cur = words[wordId];
            if (!cur) words[wordId] = WordAnnotationType.Blocked;
            else if (cur === WordAnnotationType.Blocked) words[wordId] = WordAnnotationType.Forgotten;
            else if (cur === WordAnnotationType.Forgotten) words[wordId] = WordAnnotationType.TajwidError;
            else delete words[wordId];
            return { ...prev, words };
        });
    }, []);

    const handleVerseStatusChange = useCallback((verseId: string, status: VerseEvaluationStatus | undefined) => {
        setEvaluationState(prev => {
            const verses = { ...prev.verses };
            if (status !== undefined) verses[verseId] = status;
            else delete verses[verseId];
            return { ...prev, verses };
        });
    }, []);

    const filteredSurahs = searchQuery.trim()
        ? surahs.filter(s =>
            s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.includes(searchQuery) ||
            String(s.number).includes(searchQuery)
        )
        : surahs;

    const goToPrevSurah = () => {
        if (!selectedSurah) return;
        const prev = surahs.find(s => s.number === selectedSurah.number - 1);
        if (prev) selectSurah(prev);
    };

    const goToNextSurah = () => {
        if (!selectedSurah) return;
        const next = surahs.find(s => s.number === selectedSurah.number + 1);
        if (next) selectSurah(next);
    };

    return (
        <div className="space-y-4">

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="card p-3">
                <div className="flex flex-wrap gap-3 items-center">

                    {/* Surah dropdown */}
                    <div ref={dropdownRef} className="relative" style={{ minWidth: 240, flex: '1 1 240px', maxWidth: 360 }}>
                        <button
                            onClick={() => setDropdownOpen(o => !o)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm hover:border-primary-400 transition-colors"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <FiBookOpen size={13} className="text-primary-500 shrink-0" />
                                <span className="truncate font-medium">
                                    {selectedSurah
                                        ? `${selectedSurah.number}. ${selectedSurah.englishName}`
                                        : 'Choisir une sourate...'}
                                </span>
                                {selectedSurah && (
                                    <span className="font-arabic text-dark-500 shrink-0">{selectedSurah.name}</span>
                                )}
                            </div>
                            <FiChevronDown size={13} className={`text-dark-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ width: '100%', maxHeight: 400 }}>
                                <div className="p-2 border-b border-dark-100 dark:border-dark-800 sticky top-0 bg-white dark:bg-dark-900">
                                    <div className="relative">
                                        <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            autoFocus
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher (nom, numéro...)"
                                            className="w-full pl-7 pr-3 py-1.5 text-xs border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-800 focus:outline-none focus:ring-1 focus:ring-primary-400"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                                    {loadingSurahs ? (
                                        <div className="flex items-center justify-center h-16"><div className="spinner w-5 h-5 border-primary-600" /></div>
                                    ) : filteredSurahs.map(s => (
                                        <button
                                            key={s.number}
                                            onClick={() => selectSurah(s)}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border-b border-dark-50 dark:border-dark-800/40 last:border-0 ${selectedSurah?.number === s.number ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                        >
                                            <span className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${selectedSurah?.number === s.number ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-700 text-dark-600'}`}>
                                                {s.number}
                                            </span>
                                            <span className="flex-1 text-xs font-medium truncate">{s.englishName}</span>
                                            <span className="text-xs text-dark-400">{s.numberOfAyahs} v.</span>
                                            <span className="font-arabic text-sm text-dark-600 dark:text-dark-400">{s.name}</span>
                                        </button>
                                    ))}
                                    {!loadingSurahs && filteredSurahs.length === 0 && (
                                        <p className="text-xs text-dark-400 text-center py-6">Aucun résultat</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prev / Next surah */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={goToPrevSurah} disabled={!selectedSurah || selectedSurah.number <= 1 || loadingVerses}
                            className="btn btn-outline text-xs py-2 px-3 disabled:opacity-40 flex items-center gap-1">
                            <FiChevronLeft size={13} /> Préc.
                        </button>
                        <button onClick={goToNextSurah} disabled={!selectedSurah || selectedSurah.number >= 114 || loadingVerses}
                            className="btn btn-outline text-xs py-2 px-3 disabled:opacity-40 flex items-center gap-1">
                            Suiv. <FiChevronRight size={13} />
                        </button>
                    </div>

                    {/* Font & Zoom controls */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-xl ml-auto">
                        <FiType size={14} className="text-dark-400 hidden sm:block" />
                        <select
                            value={quranFont}
                            onChange={(e) => setQuranFont(e.target.value)}
                            className="text-xs bg-transparent border-none focus:ring-0 text-dark-700 dark:text-dark-300 font-bold py-1 pr-6 cursor-pointer"
                        >
                            <option value="font-madani">Madani (Standard)</option>
                            <option value="font-tajweed">Tajweed (Couleurs)</option>
                            <option value="font-indopak">IndoPak (Majeedi)</option>
                        </select>

                        <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 mx-1 hidden sm:block"></div>

                        <div className="hidden sm:flex items-center gap-1">
                            <button onClick={() => setQuranFontSize(s => Math.max(16, s - 2))} className="p-1 rounded-md hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-500 transition">
                                <FiZoomOut size={14} />
                            </button>
                            <span className="text-xs font-bold text-dark-600 dark:text-dark-400 w-6 text-center">{quranFontSize}</span>
                            <button onClick={() => setQuranFontSize(s => Math.min(64, s + 2))} className="p-1 rounded-md hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-500 transition">
                                <FiZoomIn size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Corrects', value: versesCorrect, c: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20', icon: <FiCheck size={14} /> },
                    { label: 'Bloqués', value: versesBlocked, c: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20', icon: <FiAlertTriangle size={14} /> },
                    { label: 'Oubliés', value: versesForgotten, c: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20', icon: <FiXCircle size={14} /> },
                    { label: 'Mots annotés', value: wordErrors, c: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20', icon: <FiType size={14} /> },
                ].map(({ label, value, c, bg, icon }) => (
                    <div key={label} className={`card py-3 px-4 flex items-center gap-3 border ${bg}`}>
                        <div className={c}>{icon}</div>
                        <div>
                            <p className={`text-2xl font-bold leading-none ${c}`}>{value}</p>
                            <p className="text-xs text-dark-500 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Mushaf display ─────────────────────────────────────────── */}
            <div className="mt-6">
                {loadingVerses ? (
                    <div className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800" style={{ minHeight: 400 }}>
                        <div className="spinner w-10 h-10 border-primary-600" />
                        <p className="text-dark-400 text-sm animate-pulse">Chargement de la sourate...</p>
                    </div>
                ) : (
                    <>
                        {/* Page nav — TOP: 3-col grid → nav centred */}
                        {totalPages > 1 && (
                            <div className="grid grid-cols-3 items-center mb-3">
                                <span className="text-xs text-dark-400">
                                    Versets {pageIndex * VERSES_PER_PAGE + 1}–{Math.min((pageIndex + 1) * VERSES_PER_PAGE, allVerses.length)} / {allVerses.length}
                                </span>
                                <div className="flex items-center justify-center gap-1 bg-dark-50 dark:bg-dark-800/60 rounded-xl p-1 w-fit mx-auto">
                                    <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 disabled:opacity-30 transition"><FiChevronLeft size={14} /></button>
                                    <span className="text-xs font-medium text-dark-600 dark:text-dark-400 tabular-nums px-1">{pageIndex + 1} / {totalPages}</span>
                                    <button onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))} disabled={pageIndex >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 disabled:opacity-30 transition"><FiChevronRight size={14} /></button>
                                </div>
                                <div />
                            </div>
                        )}

                        <Mushaf
                            verses={pageVerses}
                            onWordClick={handleWordClick}
                            onVerseStatusChange={handleVerseStatusChange}
                            evaluationState={evaluationState}
                            onSetWordAnnotation={handleSetWordAnnotation}
                            fontClass={quranFont}
                            fontSize={quranFontSize}
                        />

                        {/* Page nav — BOTTOM + save: 3-col grid → nav centred */}
                        <div className="grid grid-cols-3 items-center mt-3">
                            <div />
                            {totalPages > 1 ? (
                                <div className="flex items-center justify-center gap-1 bg-dark-50 dark:bg-dark-800/60 rounded-xl p-1 w-fit mx-auto">
                                    <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 disabled:opacity-30 transition"><FiChevronLeft size={14} /></button>
                                    <span className="text-xs font-medium text-dark-600 dark:text-dark-400 tabular-nums px-1">{pageIndex + 1} / {totalPages}</span>
                                    <button onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))} disabled={pageIndex >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 disabled:opacity-30 transition"><FiChevronRight size={14} /></button>
                                </div>
                            ) : <div />}
                            <div className="flex justify-end">
                                <button onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2500); }}
                                    className={`btn text-sm flex items-center gap-2 ${saveSuccess ? 'btn-primary opacity-80' : 'btn-primary'}`}>
                                    {saveSuccess ? <><FiCheck size={13} /> Sauvegardé !</> : '💾 Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
