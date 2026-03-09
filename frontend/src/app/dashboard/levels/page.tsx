'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { levelApi, groupApi, mushafApi } from '@/lib/api/client';
import { LevelResponse, GroupResponse, SurahResponse } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    FiPlus, FiEdit2, FiTrash2, FiEye, FiLayers, FiChevronRight,
    FiCheck, FiX, FiSearch, FiBookOpen, FiUsers, FiTarget,
    FiArrowUp, FiArrowDown, FiHash
} from 'react-icons/fi';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_SURAHS: SurahResponse[] = [
    { id: '1', number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatiha', revelationType: 'Meccan', verseCount: 7 },
    { id: '2', number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', revelationType: 'Medinan', verseCount: 286 },
    { id: '3', number: 3, nameArabic: 'آل عمران', nameEnglish: 'Aal-E-Imran', revelationType: 'Medinan', verseCount: 200 },
    { id: '36', number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', revelationType: 'Meccan', verseCount: 83 },
    { id: '55', number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', revelationType: 'Medinan', verseCount: 78 },
    { id: '56', number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqi\'ah', revelationType: 'Meccan', verseCount: 96 },
    { id: '67', number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', revelationType: 'Meccan', verseCount: 30 },
    { id: '78', number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', revelationType: 'Meccan', verseCount: 40 },
    { id: '96', number: 96, nameArabic: 'العلق', nameEnglish: 'Al-Alaq', revelationType: 'Meccan', verseCount: 19 },
    { id: '110', number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', revelationType: 'Medinan', verseCount: 3 },
    { id: '112', number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', revelationType: 'Meccan', verseCount: 4 },
    { id: '113', number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', revelationType: 'Meccan', verseCount: 5 },
    { id: '114', number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', revelationType: 'Meccan', verseCount: 6 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════
const LevelListSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-11 w-40 rounded-xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-3.5 flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div>
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-2 w-16" />
                    </div>
                </div>
            ))}
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />

        {/* List Skeleton */}
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                    <div className="flex items-stretch">
                        <Skeleton className="w-16 h-28" />
                        <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-6 w-40 rounded-full" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_LEVELS: LevelResponse[] = [
    {
        id: 'lv1', name: 'Niveau 1 — Sourates Courtes', order: 1, description: 'Mémorisation des sourates courtes du Juz Amma', isActive: true, groupCount: 3, studentCount: 28,
        startSurah: 114, endSurah: 90,
        createdAt: '2024-09-01'
    },
    {
        id: 'lv2', name: 'Niveau 2 — Juz Amma (suite)', order: 2, description: 'Poursuite du Juz Amma : An-Naba à Ad-Duha', isActive: true, groupCount: 2, studentCount: 18,
        startSurah: 78, endSurah: 1,
        createdAt: '2024-09-01'
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function LevelsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [levels, setLevels] = useState<LevelResponse[]>([]);
    const [surahs, setSurahs] = useState<SurahResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create/Edit modal
    const [showModal, setShowModal] = useState(false);
    const [editingLevel, setEditingLevel] = useState<LevelResponse | null>(null);
    const [form, setForm] = useState({
        name: '', description: '', order: 1, isActive: true,
        startSurah: undefined as number | undefined,
        endSurah: undefined as number | undefined
    });

    // Delete
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [levelsRes, surahsRes] = await Promise.all([levelApi.getAll(), mushafApi.getSurahs()]);
            setLevels(levelsRes.data);
            setSurahs(surahsRes.data);
        } catch {
            setLevels(MOCK_LEVELS);
            setSurahs(MOCK_SURAHS);
        } finally { setLoading(false); }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return levels
            .filter(lv => !q || lv.name.toLowerCase().includes(q) || lv.description?.toLowerCase().includes(q))
            .sort((a, b) => a.order - b.order);
    }, [levels, search]);

    // Stats
    const stats = useMemo(() => ({
        total: levels.length,
        active: levels.filter(l => l.isActive).length,
        totalGroups: levels.reduce((s, l) => s + (l.groupCount || 0), 0),
        totalStudents: levels.reduce((s, l) => s + (l.studentCount || 0), 0),
    }), [levels]);

    // ── Modal helpers ────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingLevel(null);
        setForm({
            name: '', description: '', order: levels.length + 1, isActive: true,
            startSurah: undefined, endSurah: undefined
        });
        setShowModal(true);
    };

    const openEditModal = (lv: LevelResponse) => {
        setEditingLevel(lv);
        setForm({
            name: lv.name, description: lv.description || '', order: lv.order, isActive: lv.isActive,
            startSurah: lv.startSurah, endSurah: lv.endSurah
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        const payload = { ...form };
        try {
            if (editingLevel) await levelApi.update(editingLevel.id, payload);
            else await levelApi.create(payload);
            loadData();
        } catch { }
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        try { await levelApi.delete(id); loadData(); } catch { }
        setDeleteConfirm(null);
    };

    const getSurahName = (num?: number) => {
        if (!num) return '—';
        const s = surahs.find(s => s.number === num);
        return s ? `${s.number}. ${s.nameArabic}` : `#${num}`;
    };

    if (loading) return <LevelListSkeleton />;

    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-6">

            {/* ══ Header ══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><FiLayers className="text-primary-600" /> Gestion des Niveaux</h1>
                    <p className="text-dark-400 mt-1 text-sm">Définissez les paliers de progression coranique pour vos groupes</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/20">
                    <FiPlus size={15} /> Créer un niveau
                </button>
            </div>

            {/* ══ Stats ══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { icon: <FiLayers size={16} />, label: 'Total niveaux', value: stats.total, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                    { icon: <FiCheck size={16} />, label: 'Actifs', value: stats.active, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { icon: <FiUsers size={16} />, label: 'Groupes', value: stats.totalGroups, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { icon: <FiTarget size={16} />, label: 'Élèves', value: stats.totalStudents, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-3.5 flex items-center gap-3 transition-all hover:shadow-sm">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} flex-shrink-0`}>{s.icon}</div>
                        <div className="min-w-0">
                            <p className={`text-base sm:text-lg font-bold ${s.color} truncate`}>{s.value}</p>
                            <p className="text-[9px] text-dark-400 uppercase tracking-wider font-bold truncate">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ Search ══ */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un niveau..." className="input pl-10 w-full text-sm py-2.5 max-w-md" />
            </div>

            {/* ══ Levels list ══ */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 py-16 text-center">
                        <FiLayers size={48} className="mx-auto text-dark-200 mb-4" />
                        <p className="text-dark-500 font-medium">Aucun niveau trouvé</p>
                        <p className="text-dark-400 text-xs mt-1">Créez votre premier niveau de progression</p>
                    </div>
                ) : filtered.map((lv, idx) => (
                    <div key={lv.id}
                        className={`bg-white dark:bg-dark-900 rounded-2xl border ${lv.isActive ? 'border-dark-100 dark:border-dark-800' : 'border-dark-200 dark:border-dark-700 opacity-60'} overflow-hidden hover:shadow-md transition-all duration-300`}>
                        <div className="flex items-stretch">
                            {/* Order badge */}
                            <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary-500 to-primary-600 text-white">
                                <span className="text-2xl font-black">{lv.order}</span>
                                <span className="text-[8px] uppercase tracking-widest font-bold opacity-70">Niveau</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-dark-900 dark:text-white">{lv.name}</h3>
                                            {!lv.isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-dark-200 text-dark-500">Inactif</span>}
                                        </div>
                                        {lv.description && <p className="text-xs text-dark-500 mb-2 line-clamp-1">{lv.description}</p>}

                                        {/* Content pill */}
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/15 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                                📖 Obj. : {getSurahName(lv.startSurah)} → {getSurahName(lv.endSurah)}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-dark-400">
                                            <span className="flex items-center gap-1"><FiUsers size={10} /> {lv.groupCount || 0} groupes</span>
                                            <span className="flex items-center gap-1"><FiTarget size={10} /> {lv.studentCount || 0} élèves</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => openEditModal(lv)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-dark-600 transition-colors" title="Modifier">
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(lv.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-500 transition-colors" title="Supprimer">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next level arrow */}
                        {idx < filtered.length - 1 && lv.isActive && (
                            <div className="flex justify-center -mb-3 relative z-10">
                                <div className="w-6 h-6 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center border border-white dark:border-dark-900 shadow-sm">
                                    <FiArrowDown size={10} className="text-dark-400" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ══ Create/Edit Modal ══ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-dark-100 dark:border-dark-800 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold">{editingLevel ? 'Modifier le niveau' : 'Créer un nouveau niveau'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"><FiX size={16} /></button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {/* Name + Order */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="label text-xs mb-1">Nom du niveau *</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Niveau 1 — Sourates Courtes" className="input w-full text-sm" />
                                </div>
                                <div>
                                    <label className="label text-xs mb-1">Ordre *</label>
                                    <input type="number" min={1} value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                                        className="input w-full text-sm" />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="label text-xs mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Décrivez le contenu et les objectifs de ce niveau…" rows={2} className="input w-full text-sm resize-none" />
                            </div>

                            {/* Quranic Range */}
                            <div className="p-4 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
                                <label className="label text-xs font-bold mb-3 flex items-center gap-2 text-primary-600 uppercase tracking-wider">
                                    <FiBookOpen size={12} /> Objectif Coranique (Plage)
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label text-[10px] text-dark-400 mb-1">Sourate de début</label>
                                        <select
                                            value={form.startSurah || ''}
                                            onChange={e => setForm({ ...form, startSurah: parseInt(e.target.value) || undefined })}
                                            className="input w-full text-sm py-2"
                                        >
                                            <option value="">Sélectionner</option>
                                            {surahs.map(s => <option key={s.id} value={s.number}>{s.number}. {s.nameArabic} ({s.nameEnglish})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label text-[10px] text-dark-400 mb-1">Sourate de fin</label>
                                        <select
                                            value={form.endSurah || ''}
                                            onChange={e => setForm({ ...form, endSurah: parseInt(e.target.value) || undefined })}
                                            className="input w-full text-sm py-2"
                                        >
                                            <option value="">Sélectionner</option>
                                            {surahs.map(s => <option key={s.id} value={s.number}>{s.number}. {s.nameArabic} ({s.nameEnglish})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <p className="mt-3 text-[10px] text-dark-400 italic">
                                    Cette plage définit les sourates que les élèves de ce niveau devront mémoriser en priorité.
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between w-full py-1">
                                <span className="text-sm font-medium">Niveau actif</span>
                                <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.isActive ? 'bg-green-500' : 'bg-dark-300'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 border-t border-dark-100 dark:border-dark-800 flex items-center justify-end gap-3 flex-shrink-0">
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost px-5 py-2.5 rounded-xl text-sm">Annuler</button>
                            <button onClick={handleSubmit} className="btn btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary-500/20">
                                <FiCheck size={14} /> {editingLevel ? 'Enregistrer' : 'Créer le niveau'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Delete Modal ══ */}
            {deleteConfirm && (() => {
                const lv = levels.find(l => l.id === deleteConfirm);
                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-dark-100 dark:border-dark-800">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 size={22} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Supprimer ce niveau ?</h3>
                                <p className="text-sm text-dark-500 mb-1">« {lv?.name} »</p>
                                {(lv?.groupCount || 0) > 0 && (
                                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg mb-3">
                                        ⚠️ Ce niveau est utilisé par {lv!.groupCount} groupe(s).
                                    </p>
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn btn-ghost py-2.5 rounded-xl text-sm">Annuler</button>
                                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">Supprimer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
