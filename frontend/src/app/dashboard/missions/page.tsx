'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { missionsService } from '@/lib/services/missions';
import { StudentMissionResponse, MissionType, MissionStatus, MissionTargetType, UserRole } from '@/types';
import { FiCheckCircle, FiClock, FiAlertCircle, FiBookOpen, FiStar, FiRefreshCw, FiTarget, FiX, FiMic, FiSend } from 'react-icons/fi';
import Mushaf, { MushafVerseData } from '@/components/mushaf/Mushaf';
import AudioPlayer from '@/components/mushaf/AudioPlayer';
import MissionRecordingCard from '@/components/missions/MissionRecordingCard';

// ─── API Helpers ─────────────────────────────────────────────────────────────
async function loadSurahVerses(surahNumber: number): Promise<MushafVerseData[]> {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!res.ok) {
        const res2 = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`);
        if (!res2.ok) return [];
        const j2 = await res2.json();
        return mapAyahs(j2.data?.ayahs ?? [], j2.data?.name ?? '', j2.data?.number ?? surahNumber);
    }
    const json = await res.json();
    return mapAyahs(json.data?.ayahs ?? [], json.data?.name ?? '', json.data?.number ?? surahNumber);
}

function mapAyahs(ayahs: any[], surahName: string, surahNumber: number): MushafVerseData[] {
    return ayahs.map((ayah: any) => ({
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
    }));
}

export default function MissionsHubPage() {
    const { user, isAuthenticated } = useAuthStore();
    const { t } = useTranslation('fr'); // Using fr as default for now
    const [missions, setMissions] = useState<StudentMissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEvaluating, setIsEvaluating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Mock student ID if parent or admin is viewing. In a real scenario, this would come from a selector.
    const studentId = user?.roles?.includes(UserRole.Student) ? user.userId : '00000000-0000-0000-0000-000000000000'; // Replace with a real mock ID later if needed for testing

    useEffect(() => {
        if (isAuthenticated && studentId) {
            loadMissions();
        }
    }, [isAuthenticated, studentId]);

    const loadMissions = async () => {
        if (!studentId) return;
        setIsLoading(true);
        try {
            const data = await missionsService.getStudentMissions(studentId);
            setMissions(data);
        } catch (error) {
            console.error('Failed to load missions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteMission = async (missionId: string, score: number) => {
        try {
            await missionsService.completeMission(missionId, score);
            loadMissions(); // Reload from server
            setIsEvaluating(null);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } catch (error) {
            console.error('Failed to complete mission', error);
        }
    };

    const handleGenerateRevision = async () => {
        if (!studentId) return;
        setIsGenerating(true);
        try {
            // Adjust missionsService to use createManualMission or triggerSmartRevision if applicable
            // For now, reload to see if backend generated something
            await missionsService.getStudentMissions(studentId);
            loadMissions();
            setIsGenerating(false);
        } catch (error) {
            console.error('Failed to generate revision', error);
            setIsGenerating(false);
        }
    };

    const activeMissions = missions.filter(m => m.status !== MissionStatus.Completed);
    const manualAssignments = activeMissions.filter(m => m.type === MissionType.ManualAssignment);
    const smartRevisions = activeMissions.filter(m => m.type === MissionType.SmartRevision);
    const completedMissions = missions.filter(m => m.status === MissionStatus.Completed);

    const getTargetName = (mission: StudentMissionResponse) => {
        if (mission.targetType === MissionTargetType.Surah) return `Sourate ${mission.targetId}`;
        if (mission.targetType === MissionTargetType.Hizb) return `Hizb ${mission.targetId}`;
        return mission.customDescription || 'Mission personnalisée';
    };

    if (isLoading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-6">
            {/* ... title section ... */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FiTarget className="text-primary-500" />
                        Hub des Missions
                    </h1>
                    <p className="text-dark-500 mt-2 text-lg">Vos devoirs et entraînements du jour.</p>
                </div>
                {/* ... gamification stats ... */}
            </div>

            {/* Success Overlay Animation */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-300">
                    <div className="bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce">
                        <span className="text-4xl">🎉</span>
                        <div>
                            <h3 className="text-xl font-bold">Mission Accomplie !</h3>
                            <p className="text-emerald-100">+20 XP gagnés</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-dark-200 dark:border-dark-800 pb-2">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-2 font-bold text-lg px-2 transition-colors border-b-2 ${activeTab === 'active' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-400 hover:text-dark-600'}`}
                >
                    En cours ({(activeMissions.length)})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-2 font-bold text-lg px-2 transition-colors border-b-2 ${activeTab === 'completed' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-400 hover:text-dark-600'}`}
                >
                    Historique ({completedMissions.length})
                </button>
            </div>

            {activeTab === 'active' ? (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Column 1: Manual Assignments (Urgent) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-dark-900 dark:text-white">
                            <FiAlertCircle className="text-accent-500" />
                            Devoirs à rendre
                            <span className="bg-accent-100 text-accent-700 text-xs py-0.5 px-2 rounded-full font-black">{manualAssignments.length}</span>
                        </h2>

                        {manualAssignments.length === 0 ? (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 text-center border border-dark-100 dark:border-dark-800 border-dashed">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiCheckCircle size={32} />
                                </div>
                                <h3 className="text-lg font-bold">Aucun devoir en retard !</h3>
                                <p className="text-dark-500 mt-1">Excellent travail, vous êtes à jour avec votre professeur.</p>
                            </div>
                        ) : (
                            manualAssignments.map(mission => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    title={getTargetName(mission)}
                                    isEvaluating={isEvaluating === mission.id}
                                    onEvaluateClick={() => setIsEvaluating(mission.id)}
                                    onComplete={(score) => handleCompleteMission(mission.id, score)}
                                    onCancelEvaluate={() => setIsEvaluating(null)}
                                    reloadMissions={loadMissions}
                                />
                            ))
                        )}
                    </div>

                    {/* Column 2: Smart Revisions (Training) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-dark-900 dark:text-white">
                            <FiRefreshCw className="text-primary-500" />
                            Entraînement Suggéré
                            <span className="bg-primary-100 text-primary-700 text-xs py-0.5 px-2 rounded-full font-black">{smartRevisions.length}</span>
                        </h2>

                        {smartRevisions.length === 0 ? (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 text-center border border-dark-100 dark:border-dark-800 border-dashed">
                                <div className="w-16 h-16 bg-dark-50 text-dark-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiStar size={32} />
                                </div>
                                <h3 className="text-lg font-bold">Entraînement terminé</h3>
                                <p className="text-dark-500 mt-1">L'algorithme n'a pas de révision urgente pour vous aujourd'hui.</p>
                            </div>
                        ) : (
                            smartRevisions.map(mission => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    title={getTargetName(mission)}
                                    isEvaluating={isEvaluating === mission.id}
                                    onEvaluateClick={() => setIsEvaluating(mission.id)}
                                    onComplete={(score) => handleCompleteMission(mission.id, score)}
                                    onCancelEvaluate={() => setIsEvaluating(null)}
                                    reloadMissions={loadMissions}
                                />
                            ))
                        )}

                        {/* Generative UI for Continuity */}
                        <div className="mt-6">
                            <button
                                onClick={handleGenerateRevision}
                                disabled={isGenerating}
                                className={`w-full py-4 border-2 border-dashed border-primary-200 dark:border-primary-900/50 rounded-3xl flex flex-col items-center justify-center gap-2 text-primary-600 dark:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiRefreshCw size={24} className={isGenerating ? 'animate-spin' : ''} />
                                </div>
                                <span className="font-bold text-lg">{isGenerating ? 'Génération en cours...' : 'Générer une nouvelle révision'}</span>
                                <span className="text-sm font-medium text-primary-500/70">Dépassez vos objectifs avec l'algorithme intelligent</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Completed Tab */
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Gamification Summary Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -z-0" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner">
                                <span className="text-4xl">🏆</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Mon Palmarès</h2>
                                <p className="text-emerald-100 font-medium">Continuez vos efforts, vous êtes sur la bonne voie !</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
                                <div className="text-3xl font-black text-white">{completedMissions.length}</div>
                                <div className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold mt-1">Missions</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
                                <div className="text-3xl font-black text-white">{(completedMissions.length * 20)}</div>
                                <div className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold mt-1">XP Total</div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative pt-10">
                        {completedMissions.length === 0 ? (
                            <div className="text-center py-12 text-dark-400">
                                <FiCheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Aucun historique pour le moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-200 dark:before:via-dark-800 before:to-transparent">
                                {completedMissions.map((m, index) => (
                                    <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-dark-900 bg-emerald-500 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                            <FiCheckCircle size={18} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-dark-50 dark:bg-dark-950 p-5 rounded-3xl shadow-sm border border-dark-100 dark:border-dark-800 transition-all hover:-translate-y-1 hover:shadow-md">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black text-dark-400 uppercase tracking-widest">{new Date(m.completedAt || m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">+20 XP</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-dark-900 dark:text-white leading-tight mb-3">{getTargetName(m)}</h3>

                                            <div className="bg-white dark:bg-dark-900 rounded-xl p-3 flex justify-between items-center border border-dark-100 dark:border-dark-800 shadow-inner">
                                                <span className="text-[10px] font-bold text-dark-500 uppercase">Qualité Notée</span>
                                                <div className="flex gap-1 justify-end">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FiStar key={star} size={14} className={star <= (m.qualityScore || 0) ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-dark-200 dark:text-dark-700'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponent for the cards
function MissionCard({ mission, title, isEvaluating, onEvaluateClick, onComplete, onCancelEvaluate, reloadMissions }: { mission: StudentMissionResponse, title: string, isEvaluating: boolean, onEvaluateClick: () => void, onComplete: (score: number) => void, onCancelEvaluate: () => void, reloadMissions: () => void }) {
    const isUrgent = mission.type === MissionType.ManualAssignment;
    const [mode, setMode] = useState<'selection' | 'eval' | 'record'>('selection');

    // Mushaf State
    const [verses, setVerses] = useState<MushafVerseData[]>([]);
    const [isLoadingVerses, setIsLoadingVerses] = useState(false);
    const [activeAudioVerse, setActiveAudioVerse] = useState<number>(0);
    const [evaluationState, setEvaluationState] = useState({ verses: {}, words: {} });

    useEffect(() => {
        if (isEvaluating && mode === 'eval' && mission.targetType === MissionTargetType.Surah) {
            setIsLoadingVerses(true);
            loadSurahVerses(mission.targetId!)
                .then(data => setVerses(data))
                .catch(console.error)
                .finally(() => setIsLoadingVerses(false));
        }
    }, [isEvaluating, mode, mission.targetType, mission.targetId]);

    const handleCancel = () => {
        setMode('selection');
        onCancelEvaluate();
    };

    return (
        <div className={`relative overflow-hidden bg-white dark:bg-dark-900 rounded-3xl p-5 border ${isUrgent ? 'border-accent-100 dark:border-accent-900/30 shadow-accent-500/5' : 'border-dark-100 dark:border-dark-800'} shadow-sm transition-all hover:shadow-md group`}>

            {/* Urgency indicator strip */}
            {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-500" />}

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary-600'}`}>
                        {isUrgent ? <FiBookOpen size={18} /> : <FiRefreshCw size={18} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight text-dark-900 dark:text-white">{title}</h3>
                        {mission.teacherName && <p className="text-xs font-medium text-dark-500">Demandé par {mission.teacherName}</p>}
                        {mission.status === MissionStatus.Submitted && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                En attente de correction
                            </span>
                        )}
                    </div>
                </div>
                {isUrgent && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-accent-600 bg-accent-50 px-2 py-1 rounded-lg">
                        <FiClock size={12} />
                        Demain
                    </div>
                )}
            </div>

            {!isEvaluating ? (
                <button
                    disabled={mission.status === MissionStatus.Submitted}
                    onClick={() => {
                        setMode('selection');
                        onEvaluateClick();
                    }}
                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-colors text-white ${mission.status === MissionStatus.Submitted ? 'bg-dark-200 cursor-not-allowed' : (isUrgent ? 'bg-accent-600 hover:bg-accent-700 shadow-lg shadow-accent-600/20' : 'bg-dark-900 dark:bg-dark-700 hover:bg-black dark:hover:bg-dark-600')}`}
                >
                    {mission.status === MissionStatus.Submitted ? 'Soumission envoyée' : 'Commencer / Valider'}
                </button>
            ) : (
                <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800 animate-fade-in relative">
                    <button onClick={handleCancel} className="absolute -top-3 -right-2 p-1 text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 transition bg-white dark:bg-dark-900 rounded-full shadow-sm border border-dark-100 dark:border-dark-800"><FiX size={16} /></button>

                    {mode === 'selection' && (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-bold text-dark-900 dark:text-white mb-2">Comment souhaitez-vous valider cette mission ?</p>
                            <button
                                onClick={() => setMode('eval')}
                                className="flex items-center gap-4 p-4 bg-dark-50 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl transition-all border border-transparent hover:border-primary-200 text-left group/btn"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 flex items-center justify-center text-primary-500 shadow-sm border border-dark-100 dark:border-dark-800">
                                    <FiCheckCircle size={20} />
                                </div>
                                <div>
                                    <span className="block font-bold text-dark-900 dark:text-white">Auto-évaluation rapide</span>
                                    <span className="block text-xs text-dark-500">Notez vous-même votre mémorisation</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setMode('record')}
                                className="flex items-center gap-4 p-4 bg-dark-50 dark:bg-dark-800 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-2xl transition-all border border-transparent hover:border-accent-200 text-left group/btn"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 flex items-center justify-center text-accent-500 shadow-sm border border-dark-100 dark:border-dark-800">
                                    <FiMic size={20} />
                                </div>
                                <div>
                                    <span className="block font-bold text-dark-900 dark:text-white tracking-tight">Récitation Audio (Maison)</span>
                                    <span className="block text-xs text-dark-500">Envoyez un audio à votre professeur</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {mode === 'eval' && (
                        <>
                            {/* Mission Mushaf / Audio View */}
                            <div className="bg-dark-50 dark:bg-dark-950 p-4 rounded-2xl mb-4 border border-dark-100 dark:border-dark-800">
                                {isLoadingVerses ? (
                                    <div className="py-8 text-center text-dark-500 text-sm animate-pulse">Chargement des versets...</div>
                                ) : verses.length > 0 ? (
                                    <>
                                        <AudioPlayer verses={verses} onVerseChange={setActiveAudioVerse} />
                                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            <Mushaf
                                                verses={verses}
                                                evaluationState={evaluationState as any}
                                                fontClass="font-madani"
                                                fontSize={24}
                                                activeAudioVerseNumber={activeAudioVerse}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-4 text-center text-dark-500 text-sm">Contenu non disponible. (Mock: Sourate non trouvée)</div>
                                )}
                            </div>

                            <p className="text-sm font-bold text-center mb-3">Comment évaluez-vous votre mémorisation ?</p>
                            <div className="flex gap-2">
                                <button onClick={() => onComplete(5)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-xs font-bold transition-colors">Très Facile</button>
                                <button onClick={() => onComplete(3)} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg text-xs font-bold transition-colors">Moyen</button>
                                <button onClick={() => onComplete(1)} className="flex-1 bg-accent-50 hover:bg-accent-100 text-accent-700 py-2 rounded-lg text-xs font-bold transition-colors">Difficile</button>
                            </div>
                        </>
                    )}

                    {mode === 'record' && (
                        <MissionRecordingCard
                            mission={mission}
                            onSuccess={() => {
                                handleCancel();
                                reloadMissions();
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
