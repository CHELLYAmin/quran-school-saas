'use client';

import React, { useState, useEffect } from 'react';
import { useLiveSessionStore, SmartQueueStudent } from '@/lib/store/useLiveSessionStore';
import { FiCheckCircle, FiXCircle, FiClock, FiZap, FiBookOpen } from 'react-icons/fi';
import AssignMissionModal from '@/components/missions/AssignMissionModal';
import { missionsService } from '@/lib/services/missions';
import toast from 'react-hot-toast';

export default function CockpitSidebar() {
    const { cockpit, activeStudentId, setActiveStudent, updateAttendanceOptimistic, queueMode, setQueueMode } = useLiveSessionStore();

    const [allSurahs, setAllSurahs] = useState<any[]>([]);

    // Assignment Modal State
    const [assignTarget, setAssignTarget] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        fetch('https://api.alquran.cloud/v1/surah')
            .then(res => res.json())
            .then(d => {
                if (d.data) setAllSurahs(d.data);
            })
            .catch(e => console.error(e));
    }, []);

    const sortedQueue = React.useMemo(() => {
        if (!cockpit) return [];
        const queueCopy = [...cockpit.smartQueue];

        return queueCopy.sort((a, b) => {
            // Absolute priority 1: Absents go to the very bottom, always.
            const aIsAbsent = a.attendanceStatus === 'Absent';
            const bIsAbsent = b.attendanceStatus === 'Absent';
            if (aIsAbsent && !bIsAbsent) return 1;
            if (!aIsAbsent && bIsAbsent) return -1;

            if (queueMode === 'smart') {
                // If both are present (or both absent), sort by API priority
                return b.priorityIndex - a.priorityIndex;
            }

            // Round Robin mode: Least-recently recited first. 
            // Once they recite during the session, put them at the bottom before absents.
            const aHasRecited = (a.recitationsInSessionCount > 0);
            const bHasRecited = (b.recitationsInSessionCount > 0);
            if (aHasRecited && !bHasRecited) return 1;
            if (!aHasRecited && bHasRecited) return -1;

            if (aHasRecited && bHasRecited) {
                return (a.lastRecitedTimeInSession || 0) - (b.lastRecitedTimeInSession || 0);
            }

            // Neither recited today → fallback to days Since Last Recitation (bigger = worse = first)
            if (b.daysSinceLastRecitation !== a.daysSinceLastRecitation) {
                return b.daysSinceLastRecitation - a.daysSinceLastRecitation;
            }

            return b.recentErrorsCount - a.recentErrorsCount;
        });
    }, [cockpit, queueMode]);

    if (!cockpit) return null;

    const getPriorityColor = (index: number) => {
        if (index > 40) return 'text-red-700 bg-red-50 dark:bg-red-900/20 ring-red-500/30';
        if (index > 20) return 'text-accent-600 bg-accent-50 dark:bg-accent-900/20 ring-accent-500/30';
        return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-primary-500/30';
    };

    const handleAssignMission = async (data: any) => {
        if (!assignTarget) return;
        try {
            await missionsService.createManualMission({
                studentId: assignTarget.id,
                ...data
            });
            toast.success(`Mission assignée à ${assignTarget.name}`);
        } catch (error) {
            toast.error("Erreur lors de l'assignation");
            throw error;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-dark-900 font-sans">
            <div className="p-5 border-b border-dark-100 dark:border-dark-800 shrink-0 bg-dark-50 dark:bg-dark-950 flex flex-col gap-3 rounded-tl-4xl lg:rounded-tl-none">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${queueMode === 'smart' ? 'bg-primary-500 animate-pulse shadow-md' : 'bg-dark-300'}`}></span>
                        {queueMode === 'smart' ? 'Smart Queue (API-Q)' : 'File Normale'}
                    </h2>

                    {/* Toggle Switch */}
                    <button
                        onClick={() => setQueueMode(queueMode === 'smart' ? 'roundrobin' : 'smart')}
                        title="Changer de mode de file d'attente"
                        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2"
                    >
                        <span className={`pointer-events-none absolute h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${queueMode === 'smart' ? 'bg-primary-600' : 'bg-dark-300'}`} />
                        <span className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${queueMode === 'smart' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                <p className="text-xs text-dark-500 leading-relaxed font-medium">
                    {queueMode === 'smart'
                        ? "Ordre de passage optimisé selon le besoin de révision de l'élève."
                        : "Les élèves n'ayant pas récité récemment passent en premier."}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-50/30 dark:bg-dark-950">
                {sortedQueue.map((student) => {
                    const isActive = activeStudentId === student.studentId;
                    return (
                        <div
                            key={student.studentId}
                            onClick={() => setActiveStudent(student.studentId)}
                            className={`p-5 rounded-4xl border transition-all cursor-pointer ${isActive
                                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 ring-4 ring-primary-500/20 shadow-md transform scale-[1.02]'
                                : 'border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:-translate-y-1'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="min-w-0 mr-3">
                                    <h3 className={`font-bold text-lg flex flex-col gap-1 items-start sm:flex-row sm:items-center sm:gap-2 ${isActive ? 'text-primary-800 dark:text-primary-300' : 'text-dark-900 dark:text-white'}`}>
                                        <span className="truncate max-w-[200px]">
                                            {student.firstName} {student.lastName}
                                        </span>
                                        {student.recitationsInSessionCount > 0 && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 shadow-sm animate-fade-in">
                                                <FiCheckCircle className="text-primary-600 dark:text-primary-400 w-3 h-3" />
                                                <span className="text-[10px] text-primary-700 dark:text-primary-300 font-black uppercase tracking-tighter">
                                                    {student.recitationsInSessionCount} réc.
                                                </span>
                                            </div>
                                        )}
                                    </h3>
                                    <span className="text-xs font-bold text-dark-500 bg-dark-100 dark:bg-dark-800 px-3 py-1.5 rounded-xl text-left inline-block mt-2">
                                        {student.recommendedAction}
                                    </span>
                                </div>
                                <div className={`text-[10px] font-extrabold px-3 py-1.5 rounded-2xl ring-1 shrink-0 shadow-sm uppercase tracking-wider ${getPriorityColor(student.priorityIndex)}`}>
                                    P-{Math.round(student.priorityIndex)}
                                </div>
                            </div>

                            {/* Suggested Surah Pill and Actions */}
                            <div className="flex items-center justify-between mb-4">
                                {student.suggestedSurahNumber ? (() => {
                                    const fallbackSurah = allSurahs.find(s => s.number === student.suggestedSurahNumber);
                                    const displayName = student.suggestedSurahName
                                        || (fallbackSurah ? (fallbackSurah.englishName || fallbackSurah.name) : null);

                                    return (
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700/50 px-4 py-2 rounded-2xl">
                                            <FiZap size={14} className="shrink-0" />
                                            <span className="truncate">
                                                {displayName
                                                    ? `${student.suggestedSurahNumber}. ${displayName}`
                                                    : `Sourate ${student.suggestedSurahNumber}`}
                                            </span>
                                        </div>
                                    );
                                })() : <div />}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignTarget({ id: student.studentId, name: `${student.firstName} ${student.lastName}` });
                                    }}
                                    className="p-2 ml-2 rounded-xl text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                                    title="Assigner un devoir"
                                >
                                    <FiBookOpen size={16} />
                                </button>
                            </div>

                            {/* Attendance Toggles */}
                            <div className="flex items-center gap-2 pt-4 border-t border-dark-100 dark:border-dark-800/50" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => updateAttendanceOptimistic(student.studentId, 'Present')}
                                    className={`flex-1 flex justify-center items-center py-2.5 rounded-2xl text-xs font-bold transition-all ${student.attendanceStatus === 'Present' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-inner border border-primary-200' : 'text-dark-500 bg-dark-50 hover:bg-dark-100 dark:bg-dark-800 border border-dark-100'}`}
                                >
                                    <FiCheckCircle className="w-4 h-4 mr-1.5" /> Présent
                                </button>
                                <button
                                    onClick={() => updateAttendanceOptimistic(student.studentId, 'Absent')}
                                    className={`flex-1 flex justify-center items-center py-2.5 rounded-2xl text-xs font-bold transition-all ${student.attendanceStatus === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-inner border border-red-200' : 'text-dark-500 bg-dark-50 hover:bg-dark-100 dark:bg-dark-800 border border-dark-100'}`}
                                >
                                    <FiXCircle className="w-4 h-4 mr-1.5" /> Absent
                                </button>
                                <button
                                    onClick={() => updateAttendanceOptimistic(student.studentId, 'Late')}
                                    className={`flex-1 flex justify-center items-center py-2.5 rounded-2xl text-xs font-bold transition-all ${student.attendanceStatus === 'Late' ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 shadow-inner border border-accent-200' : 'text-dark-500 bg-dark-50 hover:bg-dark-100 dark:bg-dark-800 border border-dark-100'}`}
                                >
                                    <FiClock className="w-4 h-4 mr-1.5" /> Retard
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AssignMissionModal
                isOpen={!!assignTarget}
                onClose={() => setAssignTarget(null)}
                targetName={assignTarget?.name}
                onAssign={handleAssignMission}
            />
        </div>
    );
}
