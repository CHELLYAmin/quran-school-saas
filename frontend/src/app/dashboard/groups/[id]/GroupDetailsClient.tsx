'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { groupApi, studentApi, sessionApi } from '@/lib/api/client';
import { GroupResponse, StudentResponse, StudentListResponse, SessionResponse } from '@/types';
import {
    FiArrowLeft, FiEdit2, FiTrash2, FiUsers, FiClock, FiTarget,
    FiBookOpen, FiPlus, FiChevronRight, FiSearch, FiMoreVertical,
    FiCalendar, FiUserPlus, FiX
} from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { missionsService } from '@/lib/services/missions';
import { MissionTargetType } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
function getMockGroup(id: string): GroupResponse {
    return {
        id, name: 'Groupe Al-Fatiha', level: 'Niveau 1', levelId: 'lv1',
        levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1,
        maxCapacity: 20, isActive: true, teacherName: 'Khalil Bennani', teacherId: 'u1',
        studentCount: 18, createdAt: '2024-09-01'
    };
}

const MOCK_STUDENTS: StudentResponse[] = [
    { id: 's1', firstName: 'Ahmed', lastName: 'Al-Farsi', fullName: 'Ahmed Al-Farsi', email: 'ahmed@example.com', enrollmentDate: '2024-09-01', avgScore: 88, attendanceRate: 95, lastSessionNote: 'Excellent', dateOfBirth: '2012-05-15', isActive: true, createdAt: '2024-09-01' },
    { id: 's2', firstName: 'Sara', lastName: 'Mansour', fullName: 'Sara Mansour', email: 'sara@example.com', enrollmentDate: '2024-09-05', avgScore: 92, attendanceRate: 98, lastSessionNote: 'Très studieuse', dateOfBirth: '2013-03-20', isActive: true, createdAt: '2024-09-05' },
    { id: 's3', firstName: 'Youssef', lastName: 'Benali', fullName: 'Youssef Benali', email: 'youssef@example.com', enrollmentDate: '2024-10-10', avgScore: 75, attendanceRate: 85, lastSessionNote: 'Un peu fatigué', dateOfBirth: '2011-11-12', isActive: true, createdAt: '2024-10-10' },
];

const MOCK_SESSIONS: SessionResponse[] = [
    { id: 'ses1', date: '2026-02-15T14:00', durationMinutes: 60, status: 'Completed', groupName: 'Groupe Al-Fatiha', startTime: '2026-02-15T14:00', endTime: '2026-02-15T15:00', groupId: 'g1', teacherId: 'u1', teacherName: 'Khalil Bennani', isOnline: false },
    { id: 'ses2', date: '2026-02-12T14:00', durationMinutes: 60, status: 'Completed', groupName: 'Groupe Al-Fatiha', startTime: '2026-02-12T14:00', endTime: '2026-02-12T15:00', groupId: 'g1', teacherId: 'u1', teacherName: 'Khalil Bennani', isOnline: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function GroupDetailsClient() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [students, setStudents] = useState<StudentListResponse[]>([]);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'students' | 'schedule' | 'history'>('students');
    const [searchTerm, setSearchTerm] = useState('');

    // Mission Modal State
    const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
    const [isSubmittingMission, setIsSubmittingMission] = useState(false);
    const [missionTargetType, setMissionTargetType] = useState<MissionTargetType>(MissionTargetType.Surah);
    const [missionTargetId, setMissionTargetId] = useState('');
    const [missionDesc, setMissionDesc] = useState('');
    const [missionDueDate, setMissionDueDate] = useState('');

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [groupRes, studentsRes, sessionsRes] = await Promise.all([
                groupApi.getById(id),
                studentApi.getByGroup(id),
                sessionApi.getByGroup(id)
            ]);
            setGroup(groupRes.data);
            setStudents(studentsRes.data);
            setSessions(sessionsRes.data);
        } catch (e) {
            console.error('Failed to load group data', e);
            setGroup(getMockGroup(id));
            setStudents(MOCK_STUDENTS);
            setSessions(MOCK_SESSIONS);
        } finally { setLoading(false); }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [students, searchTerm]);

    const handleAssignMission = async () => {
        if (!missionTargetId && missionTargetType !== MissionTargetType.CustomText) {
            toast.error("Veuillez remplir la cible.");
            return;
        }
        if (!missionDueDate) {
            toast.error("Veuillez définir une date d'échéance.");
            return;
        }

        setIsSubmittingMission(true);
        try {
            await missionsService.createGroupMission(id, {
                studentId: '', // Unused param by group endpoint but required by generic DTO, backend ignores it
                targetType: missionTargetType,
                targetId: missionTargetType !== MissionTargetType.CustomText ? Number(missionTargetId) : undefined,
                customDescription: missionTargetType === MissionTargetType.CustomText ? missionDesc : missionDesc,
                dueDate: new Date(missionDueDate).toISOString(),
            });
            toast.success("Mission assignée à tout le groupe !");
            setIsMissionModalOpen(false);
            // Reset
            setMissionTargetId('');
            setMissionDesc('');
            setMissionDueDate('');
        } catch (error) {
            toast.error("Erreur lors de l'assignation de la mission.");
        } finally {
            setIsSubmittingMission(false);
        }
    };

    if (!group) return <div className="text-center py-12 text-dark-400">Groupe introuvable.</div>;

    if (loading) return <PageSkeleton variant="detail" />;

    return (
        <div className="space-y-5">
            {/* ══ Header Row ══ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/dashboard/groups" className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-500 hover:text-primary-600 transition-colors">
                    <FiArrowLeft size={14} /> Retour à la liste
                </Link>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 text-sm font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-50 transition-colors shadow-sm">
                        <FiEdit2 size={13} /> Modifier
                    </button>
                    <button onClick={() => toast.error('Action réservée aux administrateurs')} className="p-2.5 rounded-xl border border-dark-200 dark:border-dark-800 text-red-500 hover:bg-red-50 transition-colors">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            {/* ══ Hero Content ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 dark:bg-primary-900/10 blur-3xl -mr-32 -mt-32 rounded-full" />

                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-500/20">
                        {group.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{group.name}</h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Actif</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                            <span className="flex items-center gap-1.5 text-dark-500"><FiUserPlus size={13} className="text-primary-600" /> {group.teacherName} (Enseignant)</span>
                            <span className="flex items-center gap-1.5 text-dark-500"><FiTarget size={13} className="text-purple-600" /> {group.levelName}</span>
                            <span className="flex items-center gap-1.5 text-dark-500"><FiUsers size={13} className="text-blue-600" /> {group.studentCount}/{group.maxCapacity} élèves</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <button onClick={() => router.push(`/dashboard/sessions/new?groupId=${group.id}`)} className="btn btn-primary w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                            <FiPlus size={14} /> Démarrer une séance
                        </button>
                        <button
                            onClick={() => setIsMissionModalOpen(true)}
                            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <FiTarget size={14} /> Assigner Mission
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ Tabs Navigation ══ */}
            <div className="flex gap-2 p-1 bg-dark-100/50 dark:bg-dark-800/30 rounded-2xl w-fit">
                {[
                    { id: 'students', label: 'Élèves', icon: <FiUsers size={14} />, count: students.length },
                    { id: 'schedule', label: 'Horaires', icon: <FiClock size={14} /> },
                    { id: 'history', label: 'Historique', icon: <FiCalendar size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm' : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'}`}
                    >
                        {tab.icon} {tab.label}
                        {tab.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-dark-200 text-dark-500'}`}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* ══ Tab Content ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm min-h-[400px]">
                {activeTab === 'students' && (
                    <div className="flex flex-col h-full">
                        {/* Search & Bulk */}
                        <div className="p-4 border-b border-dark-50 dark:border-dark-800 flex flex-col md:flex-row justify-between items-center gap-3 bg-dark-50/30">
                            <div className="relative w-full md:w-80">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un élève..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-xs font-bold text-primary-600 px-3 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors">Exporter liste</button>
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold hover:opacity-90 transition-opacity">
                                    <FiUserPlus size={13} /> Ajouter un élève
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        {filteredStudents.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <FiSearch size={40} className="text-dark-200 mb-4" />
                                <p className="text-dark-500 font-medium">Aucun élève trouvé</p>
                                <p className="text-xs text-dark-400 mt-1">Réessayez avec un autre nom ou ajoutez-en un nouveau.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-dark-50 dark:border-dark-800 text-[10px] uppercase tracking-widest text-dark-400 font-bold">
                                            <th className="px-6 py-4">Élève</th>
                                            <th className="px-6 py-4">Assiduité</th>
                                            <th className="px-6 py-4">Note moyenne</th>
                                            <th className="px-6 py-4">Dernier retour</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
                                        {filteredStudents.map(student => (
                                            <tr key={student.id} className="group hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-primary-600 font-bold text-xs">
                                                            {student.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link href={`/dashboard/students/${student.id}`} className="text-sm font-bold text-dark-900 dark:text-white hover:text-primary-600 transition-colors">{student.fullName}</Link>
                                                            <p className="text-[10px] text-dark-400">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 w-12 h-1 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${student.attendanceRate ?? 0}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-dark-700 dark:text-dark-300">{student.attendanceRate ?? 0}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${(student.avgScore ?? 0) >= 80 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {student.avgScore ?? 0}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs italic text-dark-400">{student.lastSessionNote}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <FiMoreVertical size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-dark-50 dark:bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiClock size={24} className="text-dark-300" />
                        </div>
                        <h3 className="text-lg font-bold text-dark-900 dark:text-white">Planning du groupe</h3>
                        <p className="text-sm text-dark-400 mt-1 max-w-sm mx-auto">Consultez les créneaux hebdomadaires et la planification des séances à venir.</p>
                        <button className="btn btn-outline mt-6 rounded-xl text-xs font-bold px-6 border-dark-200">Gérer l'emploi du temps</button>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-4">Séances récentes</h3>
                        {sessions.length === 0 ? (
                            <div className="py-12 text-center text-dark-400 text-sm italic">Aucune séance enregistrée pour ce groupe.</div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map(session => (
                                    <div key={session.id} className="p-4 rounded-2xl border border-dark-100 dark:border-dark-800 flex items-center justify-between hover:bg-dark-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{new Date(session.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                <p className="text-[10px] text-dark-400">{new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {session.durationMinutes} min</p>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/sessions/${session.id}/report`} className="text-[10px] font-bold text-primary-600 hover:underline">Voir rapport</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ══ Modal Assigner Mission ══ */}
            {isMissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-dark-100 dark:border-dark-800">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                    <FiTarget size={16} />
                                </div>
                                Mission de Groupe
                            </h3>
                            <button onClick={() => setIsMissionModalOpen(false)} className="text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 p-2">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1.5">Type de Mission</label>
                                <select
                                    className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={missionTargetType}
                                    onChange={(e) => setMissionTargetType(Number(e.target.value) as unknown as MissionTargetType)}
                                >
                                    <option value={MissionTargetType.Surah}>Sourate</option>
                                    <option value={MissionTargetType.Hizb}>Hizb</option>
                                    <option value={MissionTargetType.CustomText}>Texte / Tâche personnalisée</option>
                                </select>
                            </div>

                            {missionTargetType !== MissionTargetType.CustomText && (
                                <div>
                                    <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1.5">Numéro ({missionTargetType === MissionTargetType.Surah ? 'Sourate' : 'Hizb'})</label>
                                    <input
                                        type="number"
                                        value={missionTargetId}
                                        onChange={e => setMissionTargetId(e.target.value)}
                                        className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ex: 1"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1.5">Description (Optionnel)</label>
                                <textarea
                                    value={missionDesc}
                                    onChange={e => setMissionDesc(e.target.value)}
                                    className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="Instructions spéciales pour les élèves..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1.5 ">Date d'échéance</label>
                                <input
                                    type="date"
                                    value={missionDueDate}
                                    onChange={e => setMissionDueDate(e.target.value)}
                                    className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3 bg-dark-50/50 dark:bg-dark-800/30">
                            <button
                                onClick={() => setIsMissionModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark-600 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAssignMission}
                                disabled={isSubmittingMission}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center min-w-[120px]"
                            >
                                {isSubmittingMission ? <span className="spinner w-4 h-4 border-white" /> : 'Assigner à tous'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
