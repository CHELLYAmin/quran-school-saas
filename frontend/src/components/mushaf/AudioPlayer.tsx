import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSquare, FiRepeat, FiSettings, FiVolume2, FiRefreshCw } from 'react-icons/fi';
import { MushafVerseData } from '@/components/mushaf/Mushaf';

export interface AudioPlayerProps {
    verses: MushafVerseData[];
    onVerseChange?: (verseNumber: number) => void;
}

const RECITERS = [
    { id: 'ar.husary', name: 'Al-Husary (Classic)' },
    { id: 'ar.minshawi', name: 'Al-Minshawi (Murottal)' },
    { id: 'ar.alafasy', name: 'Mishary Alafasy' }
];

export default function AudioPlayer({ verses, onVerseChange }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [reciter, setReciter] = useState(RECITERS[0].id);
    const [repeatCount, setRepeatCount] = useState(1); // How many times to repeat EACH verse
    const [currentRepeat, setCurrentRepeat] = useState(1);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const nextAudioRef = useRef<HTMLAudioElement | null>(null);

    // Filter out verses that don't have surah/ayah number (shouldn't happen here)
    const validVerses = verses.filter(v => v.surahNumber && v.verseNumber);

    const getAudioUrl = (verseId: string) => `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseId}.mp3`;

    const preloadNextVerse = (index: number) => {
        const nextIndex = index + 1;
        if (validVerses[nextIndex] && nextAudioRef.current) {
            nextAudioRef.current.src = getAudioUrl(validVerses[nextIndex].id);
            nextAudioRef.current.load();
        }
    };

    const playVerse = async (index: number) => {
        if (!validVerses[index]) {
            setIsPlaying(false);
            return;
        }

        const v = validVerses[index];
        const url = getAudioUrl(v.id);

        if (audioRef.current) {
            // If we already preloaded this in nextAudioRef, we could swap, 
            // but the simplest fluid way is to just ensure the current one plays the URL.
            // A more advanced swap would be better, but let's start with preloading the 'src'.
            audioRef.current.src = url;
            try {
                await audioRef.current.play();
                setIsPlaying(true);
                onVerseChange?.(v.verseNumber);

                // Preload the next one immediately
                preloadNextVerse(index);
            } catch (err) {
                console.error("Audio playback error:", err);
                setIsPlaying(false);
            }
        }
    };

    useEffect(() => {
        if (isPlaying) {
            playVerse(currentVerseIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentVerseIndex, reciter]);

    const handleAudioEnded = () => {
        if (currentRepeat < repeatCount) {
            setCurrentRepeat(r => r + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else {
            setCurrentRepeat(1);
            if (currentVerseIndex < validVerses.length - 1) {
                setCurrentVerseIndex(i => i + 1);
            } else {
                setIsPlaying(false); // Finished all verses
                onVerseChange?.(0); // Clear highlight
            }
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            if (currentVerseIndex >= validVerses.length) {
                setCurrentVerseIndex(0);
                setCurrentRepeat(1);
            }
            setIsPlaying(true);
            playVerse(currentVerseIndex >= validVerses.length ? 0 : currentVerseIndex);
        }
    };

    const stop = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
        setCurrentVerseIndex(0);
        setCurrentRepeat(1);
        if (audioRef.current) audioRef.current.currentTime = 0;
        onVerseChange?.(0);
    };

    if (validVerses.length === 0) return null;

    return (
        <div className="card p-4 sm:p-5 mb-6 border border-primary-100 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-900/10" style={{ maxWidth: 780, margin: '0 auto 24px auto' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left: Player Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                    >
                        {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="ml-1" />}
                    </button>
                    <button
                        onClick={stop}
                        disabled={!isPlaying && currentVerseIndex === 0}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                        <FiSquare size={16} />
                    </button>

                    <div className="ml-2">
                        <div className="text-sm font-bold text-dark-800 dark:text-dark-100">
                            {validVerses[currentVerseIndex].surahName} • Verset {validVerses[currentVerseIndex].verseNumber}
                        </div>
                        <div className="text-xs text-dark-500 flex items-center gap-1 mt-0.5">
                            <FiVolume2 size={10} /> En cours de lecture...
                        </div>
                    </div>
                </div>

                {/* Right: Settings */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <div className="flex-1 md:flex-none">
                        <label className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1 block">Récitateur</label>
                        <select
                            value={reciter}
                            onChange={(e) => { setReciter(e.target.value); if (isPlaying) { stop(); } }}
                            className="w-full text-xs bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary-400"
                        >
                            {RECITERS.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-px h-8 bg-dark-200 dark:bg-dark-700 hidden md:block"></div>

                    <div className="flex-1 md:flex-none min-w-[100px]">
                        <label className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FiRefreshCw size={10} /> Répéter {currentRepeat}/{repeatCount}
                        </label>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))} className="p-1 px-2 border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 rounded text-xs">-</button>
                            <span className="text-xs font-bold text-center flex-1">{repeatCount} fois</span>
                            <button onClick={() => setRepeatCount(Math.min(10, repeatCount + 1))} className="p-1 px-2 border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 rounded text-xs">+</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Progress bar visual */}
            <div className="mt-4 flex gap-1 h-1.5">
                {validVerses.map((v, idx) => (
                    <div
                        key={v.id}
                        className={`flex-1 rounded-full ${idx < currentVerseIndex ? 'bg-primary-500' :
                            idx === currentVerseIndex ? (isPlaying ? 'bg-amber-500 animate-pulse' : 'bg-primary-500 opacity-50') :
                                'bg-dark-200 dark:bg-dark-700'
                            }`}
                        title={`Verset ${v.verseNumber}`}
                    />
                ))}
            </div>

            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
            <audio ref={nextAudioRef} className="hidden" />
        </div>
    );
}
