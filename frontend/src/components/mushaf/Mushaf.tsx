'use client';

import React, { useState, useMemo } from 'react';
import { VerseEvaluationStatus, WordAnnotationType } from '@/types';

// ─── Public types ─────────────────────────────────────────────────────────────
export interface MushafWordData {
    id: string;
    wordText: string;
    wordIndex: number;
}
export interface MushafVerseData {
    id: string;
    verseNumber: number;
    textArabic: string;
    words: MushafWordData[];
    surahNumber?: number;
    surahName?: string;
    surahEnglishName?: string;
    isFirstOfSurah?: boolean;
}
interface MushafProps {
    verses: MushafVerseData[];
    onWordClick?: (verseId: string, wordId: string, wordText: string) => void;
    onVerseStatusChange?: (verseId: string, status: VerseEvaluationStatus | undefined) => void;
    evaluationState: {
        verses: Record<string, VerseEvaluationStatus>;
        words: Record<string, WordAnnotationType>;
    };
    onSetWordAnnotation?: (verseId: string, wordId: string, type: WordAnnotationType | undefined) => void;
    activeSurahNumber?: number;
    quranPageNumber?: number;
    fontClass?: string;
    fontSize?: number;
    activeAudioVerseNumber?: number;
}

// ─── Annotation styles (pure CSS-in-JS, no Tailwind on Arabic text) ──────────
const ANN_STYLE: Record<string, React.CSSProperties> = {
    [WordAnnotationType.Blocked]: { background: 'rgba(251,146,60,0.28)', color: '#9a3412', borderRadius: 3 },
    [WordAnnotationType.Forgotten]: { background: 'rgba(248,113,113,0.28)', color: '#991b1b', borderRadius: 3 },
    [WordAnnotationType.TajwidError]: { background: 'rgba(234,179,8,0.22)', color: '#78350f', borderRadius: 3, textDecoration: 'underline', textDecorationColor: '#ca8a04', textDecorationThickness: '2px' },
};

const VERSE_BADGE_COLOR: Record<string, string> = {
    [VerseEvaluationStatus.Correct]: '#16a34a',
    [VerseEvaluationStatus.Blocked]: '#ea580c',
    [VerseEvaluationStatus.Forgotten]: '#dc2626',
};

// ─── Popup state (shared between word and verse) ──────────────────────────────
type PopupKind = 'word' | 'verse';
interface PopupState {
    kind: PopupKind;
    targetId: string;      // wordId or verseId
    verseId: string;
    label: string;         // word text or verse number string
    x: number;
    y: number;
}

function groupBySurah(verses: MushafVerseData[]) {
    const groups: { key: string; surahNumber: number; surahName: string; isFirst: boolean; verses: MushafVerseData[] }[] = [];
    verses.forEach((v) => {
        const sn = v.surahNumber ?? 0;
        const last = groups[groups.length - 1];
        if (last && last.surahNumber === sn) {
            last.verses.push(v);
        } else {
            groups.push({ key: `${sn}-${groups.length}`, surahNumber: sn, surahName: v.surahName ?? '', isFirst: !!v.isFirstOfSurah, verses: [v] });
        }
    });
    return groups;
}

export default function Mushaf({
    verses, onWordClick, onVerseStatusChange, evaluationState, onSetWordAnnotation, activeSurahNumber, quranPageNumber, fontClass, fontSize, activeAudioVerseNumber
}: MushafProps) {
    const [popup, setPopup] = useState<PopupState | null>(null);

    const groups = useMemo(() => groupBySurah(verses), [verses]);
    const isActive = (v: MushafVerseData) =>
        !activeSurahNumber || !v.surahNumber || v.surahNumber === activeSurahNumber;

    /** Open popup for a word */
    const handleWordClick = (e: React.MouseEvent, verse: MushafVerseData, wordId: string, wordText: string) => {
        if (!isActive(verse)) return;
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = Math.min(rect.left, window.innerWidth - 240);
        const y = Math.min(rect.bottom + 6, window.innerHeight - 240);
        if (onSetWordAnnotation || onWordClick) {
            setPopup({ kind: 'word', targetId: wordId, verseId: verse.id, label: wordText, x, y });
        }
    };

    /** Open popup for a verse (by clicking verse number badge) */
    const handleVerseNumberClick = (e: React.MouseEvent, verse: MushafVerseData) => {
        if (!isActive(verse)) return;
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = Math.min(rect.left, window.innerWidth - 240);
        const y = Math.min(rect.bottom + 6, window.innerHeight - 240);
        setPopup({ kind: 'verse', targetId: verse.id, verseId: verse.id, label: `Verset ${verse.verseNumber}`, x, y });
    };

    /** Apply word annotation from popup */
    const applyWordAnnotation = (type: WordAnnotationType | undefined) => {
        if (!popup || popup.kind !== 'word') return;
        if (onSetWordAnnotation) {
            onSetWordAnnotation(popup.verseId, popup.targetId, type);
        } else if (onWordClick && type !== undefined) {
            onWordClick(popup.verseId, popup.targetId, popup.label);
        }
        setPopup(null);
    };

    /** Apply verse status from popup */
    const applyVerseStatus = (status: VerseEvaluationStatus | undefined) => {
        if (!popup || popup.kind !== 'verse') return;
        onVerseStatusChange?.(popup.targetId, status as any);
        setPopup(null);
    };

    if (verses.length === 0) {
        return <div className="flex items-center justify-center h-48 text-dark-400 text-sm">Aucun verset à afficher</div>;
    }

    return (
        <>
            {/* Book page */}
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
                <div style={{ padding: 8, background: 'repeating-linear-gradient(135deg,#7B1A1A 0px,#7B1A1A 5px,#B8860B 5px,#B8860B 10px)', borderRadius: 6, boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}>
                    <div style={{ background: '#B8860B', padding: 3, borderRadius: 3 }}>
                        <div style={{ background: '#7B1A1A', padding: 3, borderRadius: 2 }}>
                            <div style={{ background: 'linear-gradient(170deg,#FFFEF5,#FFF9E7 50%,#FFFEF5)', padding: '24px 32px', borderRadius: 1 }}>

                                {/* Page header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, direction: 'rtl', fontFamily: 'sans-serif', fontSize: 11, color: '#8B3A3A' }}>
                                    <span>
                                        {(() => {
                                            const g = activeSurahNumber ? groups.find(g => g.surahNumber === activeSurahNumber) : groups[0];
                                            return g?.surahName ? `سُورَةُ ${g.surahName}` : '';
                                        })()}
                                    </span>
                                    <span>{quranPageNumber ? `صفحة ${quranPageNumber}` : ''}</span>
                                </div>
                                <div style={{ height: 1.5, background: 'linear-gradient(90deg,transparent,#B8860B 20%,#B8860B 80%,transparent)', marginBottom: 20 }} />

                                {/* Surah groups */}
                                {groups.map((group) => {
                                    const active = !activeSurahNumber || group.surahNumber === 0 || group.surahNumber === activeSurahNumber;
                                    return (
                                        <div key={group.key} style={{ filter: active ? 'none' : 'grayscale(1)', opacity: active ? 1 : 0.3, pointerEvents: active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                                            {/* Surah name header */}
                                            {group.surahName && (
                                                <div style={{ textAlign: 'center', margin: '16px 0 12px' }}>
                                                    <div style={{ display: 'inline-block', border: `1.5px solid ${active ? '#B8860B' : '#aaa'}`, borderRadius: 3, padding: '4px 28px', background: active ? 'rgba(184,134,11,0.06)' : 'rgba(0,0,0,0.02)', marginBottom: 8 }}>
                                                        <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: 22, color: active ? '#3D0A0A' : '#777', fontWeight: 700 }}>{group.surahName}</span>
                                                    </div>
                                                    {group.isFirst && group.surahNumber !== 9 && (
                                                        <div style={{ fontFamily: "'Scheherazade New', 'Traditional Arabic', serif", fontSize: 20, color: active ? '#2C0A0A' : '#888', marginTop: 6, direction: 'rtl' }}>
                                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                                        </div>
                                                    )}
                                                    <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${active ? '#B8860B' : '#bbb'},transparent)`, marginTop: 12 }} />
                                                </div>
                                            )}

                                            {/* Continuous verse text */}
                                            <div className={fontClass || 'font-madani'} style={{ direction: 'rtl', fontSize: fontSize || 28, lineHeight: 2.2, color: active ? '#18060a' : '#888', textAlign: 'justify' }}>
                                                {group.verses.map((verse) => {
                                                    const vStatus = evaluationState.verses[verse.id];
                                                    const badgeColor = vStatus ? VERSE_BADGE_COLOR[vStatus] : undefined;
                                                    const isAudioActive = activeAudioVerseNumber === verse.verseNumber;

                                                    return (
                                                        <React.Fragment key={verse.id}>
                                                            <span style={{
                                                                background: isAudioActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                                                                borderRadius: 8,
                                                                transition: 'background 0.3s'
                                                            }}>
                                                                {verse.words.map((word) => {
                                                                    const ann = evaluationState.words[word.id];
                                                                    return (
                                                                        <React.Fragment key={word.id}>
                                                                            <span
                                                                                onClick={(e) => handleWordClick(e, verse, word.id, word.wordText)}
                                                                                style={{
                                                                                    cursor: active ? 'pointer' : 'default',
                                                                                    borderRadius: 3,
                                                                                    transition: 'background 0.12s',
                                                                                    ...(ann ? ANN_STYLE[ann] : {}),
                                                                                }}
                                                                                title={active ? word.wordText : undefined}
                                                                            >
                                                                                {word.wordText}
                                                                            </span>
                                                                            {' '}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                {/* Verse number badge */}
                                                                <span
                                                                    onClick={(e) => handleVerseNumberClick(e, verse)}
                                                                    style={{
                                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                        width: 32, height: 32, borderRadius: '50%',
                                                                        fontSize: 13, fontFamily: 'sans-serif', fontWeight: 700, lineHeight: 1,
                                                                        cursor: active ? 'pointer' : 'default',
                                                                        border: `1.5px solid ${badgeColor ?? (active ? '#B8860B' : '#aaa')}`,
                                                                        background: badgeColor ?? 'transparent',
                                                                        color: badgeColor ? '#fff' : (active ? '#7B3A00' : '#aaa'),
                                                                        verticalAlign: 'middle', marginInline: 8,
                                                                        transition: 'all 0.2s', flexShrink: 0,
                                                                    }}
                                                                    title={active ? `Verset ${verse.verseNumber} — cliquer pour commenter` : undefined}
                                                                >
                                                                    {verse.verseNumber}
                                                                </span>
                                                            </span>
                                                            {' '}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div style={{ height: 1.5, background: 'linear-gradient(90deg,transparent,#B8860B 20%,#B8860B 80%,transparent)', marginTop: 24 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 18px', marginTop: 12, fontSize: 11, color: '#666', fontFamily: 'sans-serif' }}>
                <span>🟠 Bloqué / Aide</span>
                <span>🔴 Oublié / Erreur grave</span>
                <span>🟡 Erreur de lecture</span>
                <span style={{ color: '#888' }}>① = noter le verset &nbsp;·&nbsp; cliquer un mot = annoter</span>
                {activeSurahNumber && <span style={{ color: '#aaa' }}>⬜ autre sourate (grisée)</span>}
            </div>

            {/* ── Annotation popup (word or verse) ── */}
            {popup && (
                <>
                    {/* Transparent backdrop closes popup */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 9990 }}
                        onClick={() => setPopup(null)}
                    />
                    {/* Popup panel */}
                    <div
                        style={{ position: 'fixed', top: popup.y, left: popup.x, zIndex: 9999, minWidth: 210 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-dark-100 dark:border-dark-700 bg-dark-50 dark:bg-dark-700">
                            {popup.kind === 'word' ? (
                                <p dir="rtl" style={{ fontFamily: "'Scheherazade New', serif", fontSize: 20, fontWeight: 700, color: '#1a0505', margin: 0 }}>
                                    {popup.label}
                                </p>
                            ) : (
                                <p className="text-sm font-bold text-dark-700 dark:text-dark-200" style={{ margin: 0 }}>
                                    {popup.label}
                                </p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="p-1.5 space-y-0.5">
                            {popup.kind === 'word' ? (
                                <>
                                    <button onClick={() => applyWordAnnotation(WordAnnotationType.Blocked)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-left transition-colors">
                                        🟠 Bloqué / Aide
                                    </button>
                                    <button onClick={() => applyWordAnnotation(WordAnnotationType.Forgotten)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors">
                                        🔴 Oublié / Erreur grave
                                    </button>
                                    <button onClick={() => applyWordAnnotation(WordAnnotationType.TajwidError)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-left transition-colors">
                                        🟡 Erreur de lecture
                                    </button>
                                    {evaluationState.words[popup.targetId] !== undefined && (
                                        <>
                                            <div className="h-px bg-dark-100 dark:bg-dark-700 my-1" />
                                            <button onClick={() => applyWordAnnotation(undefined)}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-700 text-left transition-colors">
                                                ✖ Effacer
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button onClick={() => applyVerseStatus(VerseEvaluationStatus.Correct)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-left transition-colors">
                                        ✅ Correct
                                    </button>
                                    <button onClick={() => applyVerseStatus(VerseEvaluationStatus.Blocked)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-left transition-colors">
                                        🟠 Bloqué / Aide
                                    </button>
                                    <button onClick={() => applyVerseStatus(VerseEvaluationStatus.Forgotten)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors">
                                        🔴 Oublié / Erreur grave
                                    </button>
                                    {evaluationState.verses[popup.targetId] !== undefined && (
                                        <>
                                            <div className="h-px bg-dark-100 dark:bg-dark-700 my-1" />
                                            <button onClick={() => applyVerseStatus(undefined)}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-700 text-left transition-colors">
                                                ✖ Effacer
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
