'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { levelApi, groupApi, mushafApi } from '@/lib/api/client';
import { LevelResponse, GroupResponse, SurahResponse } from '@/types';
import {
    FiArrowLeft, FiEdit2, FiTrash2, FiLayers, FiUsers, FiTarget,
    FiBookOpen, FiCheck, FiX, FiChevronRight, FiHash, FiPlus,
    FiClock, FiCalendar
} from 'react-icons/fi';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_SURAHS: SurahResponse[] = [
    { id: '1', number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatiha', revelationType: 'Meccan', verseCount: 7 },
    { id: '2', number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', revelationType: 'Medinan', verseCount: 286 },
    { id: '67', number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', revelationType: 'Meccan', verseCount: 30 },
    { id: '110', number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', revelationType: 'Medinan', verseCount: 3 },
    { id: '112', number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', revelationType: 'Meccan', verseCount: 4 },
    { id: '113', number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', revelationType: 'Meccan', verseCount: 5 },
    { id: '114', number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', revelationType: 'Meccan', verseCount: 6 },
];

function getMockLevel(id: string): LevelResponse {
    const levels: Record<string, LevelResponse> = {
        'lv1': {
            id: 'lv1', name: 'Niveau 1 — Sourates Courtes', order: 1,
            description: 'Mémorisation des sourates courtes du Juz Amma. Ce niveau constitue la base de l\'apprentissage coranique.',
            isActive: true, groupCount: 3, studentCount: 28,
            startSurah: 114, endSurah: 90, createdAt: '2024-09-01'
        },
    };
    return levels[id] || {
        id, name: `Niveau ${id}`, order: 1,
        description: 'Description du niveau', isActive: true, groupCount: 1, studentCount: 5,
        startSurah: 1, endSurah: 1, createdAt: '2024-09-01'
    };
}

function getMockGroups(): GroupResponse[] {
    return [
        { id: '1', name: 'Groupe Al-Fatiha', level: 'Débutant', levelId: 'lv1', levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1, maxCapacity: 20, isActive: true, teacherName: 'Khalil Bennani', studentCount: 18, createdAt: '2024-09-01' },
        { id: '2', name: 'Groupe Al-Nour', level: 'Débutant', levelId: 'lv1', levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1, maxCapacity: 15, isActive: true, teacherName: 'Fatima Zahra', studentCount: 5, createdAt: '2024-09-01' },
        { id: '3', name: 'Groupe As-Salam', level: 'Débutant', levelId: 'lv1', levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1, maxCapacity: 12, isActive: true, teacherName: 'Omar Idrissi', studentCount: 5, createdAt: '2024-09-01' },
    ];
}

function getMockStudents() {
    return [
        { id: 's1', fullName: 'Ahmed Al-Farsi', groupName: 'Groupe Al-Fatiha', avgScore: 88, attendanceRate: 95 },
        { id: 's2', fullName: 'Sara Mansour', groupName: 'Groupe Al-Fatiha', avgScore: 92, attendanceRate: 98 },
        { id: 's3', fullName: 'Omar Khayyam', groupName: 'Groupe Al-Nour', avgScore: 75, attendanceRate: 85 },
        { id: 's4', fullName: 'Fatima Zahra', groupName: 'Groupe Al-Nour', avgScore: 82, attendanceRate: 90 },
        { id: 's5', fullName: 'Youssef Benali', groupName: 'Groupe As-Salam', avgScore: 78, attendanceRate: 88 },
    ];
}

export default function LevelDetailsClient() {
    const { id } = useParams();
    const router = useRouter();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [level, setLevel] = useState<LevelResponse | null>(null);
    const [surahs, setSurahs] = useState<SurahResponse[]>([]);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', order: 1, isActive: true, startSurah: 1, endSurah: 114 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [levelRes, surahsRes] = await Promise.all([levelApi.getById(id as string), mushafApi.getSurahs()]);
            setLevel(levelRes.data);
            setSurahs(surahsRes.data);
            setGroups(getMockGroups());
            setStudents(getMockStudents());
        } catch {
            setLevel(getMockLevel(id as string));
            setSurahs(MOCK_SURAHS);
            setGroups(getMockGroups());
            setStudents(getMockStudents());
        } finally { setLoading(false); }
    };

    const openEditModal = () => {
        if (!level) return;
        setEditForm({
            name: level.name, description: level.description || '', order: level.order,
            isActive: level.isActive,
            startSurah: level.startSurah || 1, endSurah: level.endSurah || 114
        });
        setShowEditModal(true);
    };

    const updateSurah = (field: 'startSurah' | 'endSurah', val: string) => {
        setEditForm(prev => ({ ...prev, [field]: parseInt(val) || 1 }));
    };

    const saveEdit = async () => {
        if (!level || !editForm.name.trim()) return;
        const payload = { ...editForm };
        try { await levelApi.update(level.id, payload); } catch { }
        setLevel({ ...level, ...payload });
        setShowEditModal(false);
    };

    const handleDelete = async () => {
        if (!level) return;
        try { await levelApi.delete(level.id); } catch { }
        router.push('/dashboard/levels');
    };

    if (!level) return <div className="text-center py-12 text-dark-400">Niveau introuvable</div>;

    if (loading) return <PageSkeleton variant="detail" />;

    return (
        <div className="space-y-5">
            <Link href="/dashboard/levels" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 transition-colors font-medium">
                <FiArrowLeft size={14} /> Retour aux niveaux
            </Link>

            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="flex items-stretch">
                    <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary-500 to-primary-600 text-white">
                        <span className="text-3xl font-black">{level.order}</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold opacity-70">Niveau</span>
                    </div>
                    <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-xl font-bold text-dark-900 dark:text-white">{level.name}</h1>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${level.isActive ? 'bg-green-100 text-green-700' : 'bg-dark-200 text-dark-500'}`}>
                                        {level.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                {level.description && <p className="text-sm text-dark-500 max-w-2xl">{level.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={openEditModal} className="btn btn-outline px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                                    <FiEdit2 size={13} /> Modifier
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} className="p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-dark-400">
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 text-xs">
                            <span className="flex items-center gap-1.5 text-dark-500"><FiUsers size={12} className="text-primary-600" /> <strong>{level.groupCount || groups.length}</strong> groupes</span>
                            <span className="flex items-center gap-1.5 text-dark-500"><FiTarget size={12} className="text-purple-600" /> <strong>{level.studentCount || students.length}</strong> élèves</span>
                            <span className="flex items-center gap-1.5 text-dark-500"><FiCalendar size={12} className="text-dark-400" /> Créé le {new Date(level.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-5">
                    <h2 className="font-bold flex items-center gap-2 mb-4"><FiBookOpen className="text-primary-600" /> Programme du niveau</h2>
                    <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl text-center border border-primary-100 dark:border-primary-800/20">
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-widest text-dark-400 mb-1">Début</p>
                                <p className="text-lg font-bold text-primary-700 dark:text-primary-400">
                                    {surahs.find(s => s.number === level.startSurah)?.nameEnglish || `Sourate ${level.startSurah}`}
                                </p>
                            </div>
                            <div className="h-0.5 w-12 bg-primary-200 dark:bg-primary-800" />
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-widest text-dark-400 mb-1">Fin</p>
                                <p className="text-lg font-bold text-primary-700 dark:text-primary-400">
                                    {surahs.find(s => s.number === level.endSurah)?.nameEnglish || `Sourate ${level.endSurah}`}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-dark-500">
                            Programme complet allant de la sourate <strong>{level.startSurah}</strong> à la sourate <strong>{level.endSurah}</strong>.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-5">
                    <h2 className="font-bold flex items-center gap-2 mb-4"><FiUsers className="text-blue-600" /> Groupes à ce niveau ({groups.length})</h2>
                    <div className="space-y-2">
                        {groups.map(g => (
                            <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                                className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors group">
                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {g.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-dark-900 dark:text-white group-hover:text-primary-600 transition-colors">{g.name}</p>
                                    <p className="text-[10px] text-dark-400">{g.teacherName} • {g.studentCount} élèves</p>
                                </div>
                                <FiChevronRight size={12} className="text-dark-300 group-hover:text-primary-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-5">
                    <h2 className="font-bold flex items-center gap-2 mb-4"><FiTarget className="text-purple-600" /> Élèves à ce niveau ({students.length})</h2>
                    <div className="space-y-2">
                        {students.map(s => {
                            const scoreColor = s.avgScore >= 80 ? 'text-green-600' : s.avgScore >= 60 ? 'text-orange-500' : 'text-red-500';
                            return (
                                <Link key={s.id} href={`/dashboard/students/${s.id}`}
                                    className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors group">
                                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {s.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-dark-900 dark:text-white group-hover:text-primary-600 transition-colors">{s.fullName}</p>
                                        <p className="text-[10px] text-dark-400">{s.groupName}</p>
                                    </div>
                                    <span className={`text-xs font-bold ${scoreColor}`}>{s.avgScore}%</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-dark-100 dark:border-dark-800 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold">Modifier le niveau</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"><FiX size={16} /></button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="label text-xs mb-1">Nom *</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input w-full text-sm" />
                                </div>
                                <div>
                                    <label className="label text-xs mb-1">Ordre</label>
                                    <input type="number" min={1} value={editForm.order} onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value) || 1 })} className="input w-full text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="label text-xs mb-1">Description</label>
                                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="input w-full text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label text-xs mb-1">Sourate de début</label>
                                    <select value={editForm.startSurah} onChange={e => updateSurah('startSurah', e.target.value)} className="input w-full text-sm">
                                        {surahs.map(s => <option key={s.id} value={s.number}>{s.number}. {s.nameArabic} ({s.nameEnglish})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs mb-1">Sourate de fin</label>
                                    <select value={editForm.endSurah} onChange={e => updateSurah('endSurah', e.target.value)} className="input w-full text-sm">
                                        {surahs.map(s => <option key={s.id} value={s.number}>{s.number}. {s.nameArabic} ({s.nameEnglish})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t dark:border-dark-800">
                                <span className="text-sm font-medium">Niveau actif</span>
                                <button onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${editForm.isActive ? 'bg-green-500' : 'bg-dark-300'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${editForm.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="btn btn-ghost px-5 py-2 rounded-xl text-sm">Annuler</button>
                            <button onClick={saveEdit} className="btn btn-primary px-6 py-2 rounded-xl text-sm flex items-center gap-1.5"><FiCheck size={13} /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-dark-100 dark:border-dark-800">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><FiTrash2 size={22} className="text-red-500" /></div>
                            <h3 className="text-lg font-bold mb-2">Supprimer ce niveau ?</h3>
                            <p className="text-sm text-dark-500 mb-1">« {level.name} »</p>
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn btn-ghost py-2.5 rounded-xl text-sm">Annuler</button>
                                <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
