import React, { useState } from 'react';
import { FiX, FiRefreshCw, FiBookOpen } from 'react-icons/fi';
import { MissionTargetType } from '@/types';

// The types are from our existing schema
interface CreateManualMissionRequest {
    studentId: string;
    targetType: MissionTargetType;
    targetId?: number;
    customDescription?: string;
    dueDate: string;
}

interface AssignMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (data: Omit<CreateManualMissionRequest, 'studentId'>) => Promise<void>;
    targetName?: string; // e.g. "Ahmed Ali" or "Groupe Al-Fatiha"
    isGroup?: boolean;
}

export default function AssignMissionModal({ isOpen, onClose, onAssign, targetName, isGroup }: AssignMissionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [missionTargetType, setMissionTargetType] = useState<MissionTargetType>(MissionTargetType.Surah);
    const [missionTargetId, setMissionTargetId] = useState('');
    const [missionDesc, setMissionDesc] = useState('');
    const [missionDueDate, setMissionDueDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onAssign({
                targetType: missionTargetType,
                targetId: missionTargetType !== MissionTargetType.CustomText ? Number(missionTargetId) : undefined,
                customDescription: missionTargetType === MissionTargetType.CustomText ? missionDesc : missionDesc,
                dueDate: new Date(missionDueDate || new Date().getTime() + 86400000).toISOString(),
            });
            onClose();
            setMissionTargetId('');
            setMissionDesc('');
            setMissionDueDate('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-dark-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 animate-fade-in-up border border-dark-100 dark:border-dark-800">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-950/50">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <FiBookOpen className="text-primary-500" />
                        {isGroup ? 'Assigner au Groupe' : 'Assigner un Devoir'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {targetName && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-3 rounded-xl text-sm font-medium border border-primary-100 dark:border-primary-900/50">
                            Cible : <strong>{targetName}</strong>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1">Type de Mission</label>
                            <select
                                value={missionTargetType}
                                onChange={(e) => setMissionTargetType(e.target.value as unknown as MissionTargetType)}
                                className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                            >
                                <option value={MissionTargetType.Surah}>Mémoriser une Sourate</option>
                                <option value={MissionTargetType.Hizb}>Réviser un Hizb</option>
                                <option value={MissionTargetType.CustomText}>Mission Personnalisée</option>
                            </select>
                        </div>

                        {missionTargetType !== MissionTargetType.CustomText ? (
                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1">
                                    Numéro ({missionTargetType})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="114"
                                    value={missionTargetId}
                                    onChange={(e) => setMissionTargetId(e.target.value)}
                                    placeholder="Ex: 67 (pour Al-Mulk)"
                                    className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1">Description</label>
                                <textarea
                                    value={missionDesc}
                                    onChange={(e) => setMissionDesc(e.target.value)}
                                    placeholder="Ex: Réviser les règles de Tajwid page 14..."
                                    rows={3}
                                    className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white resize-none"
                                />
                            </div>
                        )}

                        {missionTargetType !== MissionTargetType.CustomText && (
                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1">Consigne (Optionnel)</label>
                                <input
                                    type="text"
                                    value={missionDesc}
                                    onChange={(e) => setMissionDesc(e.target.value)}
                                    placeholder="Ex: Avec une attention particulière aux Makhaarij"
                                    className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1">À faire pour le</label>
                            <input
                                type="date"
                                value={missionDueDate}
                                onChange={(e) => setMissionDueDate(e.target.value)}
                                className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-100 dark:border-dark-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300 rounded-xl font-bold transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <FiRefreshCw className="animate-spin" />
                        ) : (
                            "Assigner"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
