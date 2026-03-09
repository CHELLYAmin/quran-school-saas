'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { groupApi, levelApi, userApi } from '@/lib/api/client';
import { GroupResponse, LevelResponse, UserRole } from '@/types';
import {
    FiPlus, FiUsers, FiEdit2, FiTrash2, FiBookOpen, FiEye,
    FiSearch, FiCalendar, FiClock, FiBarChart2, FiActivity,
    FiX, FiCheck, FiChevronRight, FiFilter, FiPlay,
    FiTrendingUp, FiPercent, FiTarget
} from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { missionsService } from '@/lib/services/missions';
import AssignMissionModal from '@/components/missions/AssignMissionModal';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type LevelFilter = string; // 'all' or a levelId

interface GroupSlot {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
}

interface EnrichedGroup extends GroupResponse {
    slots: GroupSlot[];
    avgScore: number;
    attendanceRate: number;
    sessionsThisWeek: number;
    nextSession?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAY_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const LEVEL_CFG: Record<string, { bg: string; text: string; dot: string }> = {
    'Débutant': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    'Intermédiaire': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    'Avancé': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
};

function enrichGroup(g: GroupResponse): EnrichedGroup {
    const slotTemplates: Record<string, GroupSlot[]> = {
        '1': [{ day: 'Lundi', startTime: '10:00', endTime: '12:00' }, { day: 'Mercredi', startTime: '10:00', endTime: '12:00' }, { day: 'Vendredi', startTime: '14:00', endTime: '16:00' }],
        '2': [{ day: 'Mardi', startTime: '09:00', endTime: '11:00' }, { day: 'Jeudi', startTime: '09:00', endTime: '11:00' }],
        '3': [{ day: 'Lundi', startTime: '14:00', endTime: '16:00' }, { day: 'Mercredi', startTime: '14:00', endTime: '16:00' }, { day: 'Samedi', startTime: '09:00', endTime: '11:00' }],
        '4': [{ day: 'Mardi', startTime: '14:00', endTime: '16:00' }, { day: 'Vendredi', startTime: '10:00', endTime: '12:00' }],
    };
    const hash = parseInt(g.id, 10) || (g.id.charCodeAt(0) % 4) + 1;
    return {
        ...g,
        slots: slotTemplates[g.id] || slotTemplates[String((hash % 4) + 1)] || [],
        avgScore: 65 + Math.floor((hash * 7) % 30),
        attendanceRate: 80 + Math.floor((hash * 3) % 18),
        sessionsThisWeek: 1 + (hash % 3),
        nextSession: hash % 2 === 0 ? 'Demain 09:00' : "Aujourd'hui 14:00",
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function GroupsPage() {
    const { locale, viewPreferences, setViewPreference } = useUIStore();
    const { t } = useTranslation(locale);

    const [groups, setGroups] = useState<EnrichedGroup[]>([]);
    const [levels, setLevels] = useState<LevelResponse[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // View Preferences & Sorting
    const viewMode = viewPreferences.groups || 'grid';
    const [sortKey, setSortKey] = useState<'name' | 'level' | 'capacity' | 'sessions' | 'active'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<EnrichedGroup | null>(null);
    const [form, setForm] = useState({
        name: '', level: 'Débutant', levelId: '', maxCapacity: 20, description: '',
        teacherId: '', isActive: true,
        slots: [] as { day: string; startTime: string; endTime: string }[],
    });
    const [newSlotDay, setNewSlotDay] = useState('Lundi');
    const [newSlotStart, setNewSlotStart] = useState('10:00');
    const [newSlotEnd, setNewSlotEnd] = useState('12:00');

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Assignment Modal State
    const [assignTarget, setAssignTarget] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => { loadGroups(); }, []);

    const loadGroups = async () => {
        try {
            const [groupsRes, levelsRes, teachersRes] = await Promise.all([
                groupApi.getAll(), levelApi.getAll(), userApi.getByRoles([UserRole.Teacher] as any)
            ]);
            setGroups(groupsRes.data.map(enrichGroup));
            setLevels(levelsRes.data);
            setTeachers(teachersRes.data);
        } catch {
            setGroups([
                { id: '1', name: 'Groupe Al-Fatiha', level: 'Débutant', levelId: 'lv1', levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1, maxCapacity: 20, description: 'Juz 30 – Mémorisation des petites sourates', isActive: true, teacherName: 'Mohamed Al-Husseini', studentCount: 18, createdAt: '2024-09-01' },
                { id: '2', name: 'Groupe Al-Baqara', level: 'Intermédiaire', levelId: 'lv2', levelName: 'Niveau 2 — Juz Amma (suite)', levelOrder: 2, maxCapacity: 15, description: 'Juz 1-5 – Révision et Tajwid', isActive: true, teacherName: 'Ahmed Benali', studentCount: 12, createdAt: '2024-09-01' },
                { id: '3', name: 'Groupe Al-Imran', level: 'Avancé', levelId: 'lv3', levelName: 'Niveau 3 — Sourate Al-Mulk & Ya-Sin', levelOrder: 3, maxCapacity: 12, description: 'Juz 6-15 – Hifdh intensif', isActive: true, teacherName: 'Fatima Zahra', studentCount: 10, createdAt: '2024-09-01' },
                { id: '4', name: 'Groupe An-Nisa', level: 'Débutant', levelId: 'lv1', levelName: 'Niveau 1 — Sourates Courtes', levelOrder: 1, maxCapacity: 25, description: 'Juz 30 – Tajwid et lecture', isActive: true, teacherName: 'Khadija Mansour', studentCount: 22, createdAt: '2024-10-01' },
                { id: '5', name: 'Groupe Al-Maidah', level: 'Intermédiaire', levelId: 'lv4', levelName: 'Niveau 4 — Début Al-Baqarah', levelOrder: 4, maxCapacity: 18, description: 'Juz 3-7 – Consolidation', isActive: false, teacherName: 'Mohamed Al-Husseini', studentCount: 0, createdAt: '2024-06-01' },
            ].map(enrichGroup));
            setLevels([
                { id: 'lv1', name: 'Niveau 1 — Sourates Courtes', order: 1, isActive: true, createdAt: '2024-09-01' },
                { id: 'lv2', name: 'Niveau 2 — Juz Amma (suite)', order: 2, isActive: true, createdAt: '2024-09-01' },
                { id: 'lv3', name: 'Niveau 3 — Sourate Al-Mulk & Ya-Sin', order: 3, isActive: true, createdAt: '2024-09-15' },
                { id: 'lv4', name: 'Niveau 4 — Début Al-Baqarah', order: 4, isActive: true, createdAt: '2024-10-01' },
            ]);
            setTeachers([
                { id: '1', email: 'ahmed.b@example.com', firstName: 'Ahmed', lastName: 'Benali', fullName: 'Ahmed Benali', roles: [UserRole.Teacher], isExaminer: true, phone: '+33 6 12 34 56 78', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
                { id: '2', email: 'khadija.m@example.com', firstName: 'Khadija', lastName: 'Mansour', fullName: 'Khadija Mansour', roles: [UserRole.Teacher], isExaminer: false, phone: '+212 6 00 11 22 33', isActive: true, preferredLanguage: 'ar', createdAt: new Date().toISOString() },
                { id: '3', email: 'ibrahim.k@example.com', firstName: 'Ibrahim', lastName: 'Khalil', fullName: 'Cheikh Ibrahim', roles: [UserRole.Teacher], isExaminer: true, phone: '', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
                { id: '4', email: 'fatima.z@example.com', firstName: 'Fatima', lastName: 'Zahra', fullName: 'Fatima Zahra', roles: [UserRole.Teacher], isExaminer: false, phone: '+33 7 88 99 00 11', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
            ]);
        } finally { setLoading(false); }
    };

    // ── Filtered groups ──────────────────────────────────────────────────────
    const filteredGroups = useMemo(() => {
        let result = groups.filter(g => {
            const q = searchQuery.trim().toLowerCase();
            if (q && !g.name.toLowerCase().includes(q) && !g.teacherName?.toLowerCase().includes(q) && !g.description?.toLowerCase().includes(q) && !g.levelName?.toLowerCase().includes(q)) return false;
            if (levelFilter !== 'all' && g.levelId !== levelFilter) return false;
            if (statusFilter === 'active' && !g.isActive) return false;
            if (statusFilter === 'inactive' && g.isActive) return false;
            return true;
        });

        result.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortKey === 'level') cmp = (a.levelOrder || 0) - (b.levelOrder || 0);
            else if (sortKey === 'capacity') cmp = (a.studentCount / a.maxCapacity) - (b.studentCount / b.maxCapacity);
            else if (sortKey === 'sessions') cmp = a.sessionsThisWeek - b.sessionsThisWeek;
            else if (sortKey === 'active') cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);

            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [groups, searchQuery, levelFilter, statusFilter, sortKey, sortDir]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        totalGroups: groups.filter(g => g.isActive).length,
        totalStudents: groups.reduce((a, g) => a + g.studentCount, 0),
        avgCapacity: groups.length > 0 ? Math.round(groups.filter(g => g.isActive).reduce((a, g) => a + (g.studentCount / g.maxCapacity) * 100, 0) / groups.filter(g => g.isActive).length) : 0,
        sessionsWeek: groups.reduce((a, g) => a + g.sessionsThisWeek, 0),
    }), [groups]);

    // ── Form helpers ─────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingGroup(null);
        setForm({ name: '', level: '', levelId: levels.length > 0 ? levels[0].id : '', maxCapacity: 20, description: '', teacherId: '', isActive: true, slots: [] });
        setShowCreateModal(true);
    };

    const openEditModal = (g: EnrichedGroup) => {
        setEditingGroup(g);
        setForm({
            name: g.name,
            level: g.level || '',
            levelId: g.levelId || '',
            maxCapacity: g.maxCapacity,
            description: g.description || '',
            teacherId: teachers.find(t => t.fullName === g.teacherName)?.id || g.teacherId || '',
            isActive: g.isActive,
            slots: g.slots.map(s => ({ day: s.day, startTime: s.startTime, endTime: s.endTime })),
        });
        setShowCreateModal(true);
    };

    const addSlot = () => {
        setForm(prev => ({
            ...prev,
            slots: [...prev.slots, { day: newSlotDay, startTime: newSlotStart, endTime: newSlotEnd }],
        }));
    };

    const removeSlot = (idx: number) => {
        setForm(prev => ({ ...prev, slots: prev.slots.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Le nom du groupe est obligatoire");
            return;
        }

        // Prepare the payload, converting empty strings to null for Guids
        const payload = {
            ...form,
            levelId: form.levelId || null,
            teacherId: form.teacherId || null,
        };

        try {
            if (editingGroup) {
                await groupApi.update(editingGroup.id, payload);
                toast.success("Groupe modifié avec succès");
            } else {
                await groupApi.create(payload);
                toast.success("Groupe créé avec succès");
            }
            loadGroups();
            setShowCreateModal(false);
        } catch (e: any) {
            toast.error(e?.response?.data?.title || e?.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await groupApi.delete(id);
            loadGroups();
        } catch { }
        setDeleteConfirm(null);
    };

    const handleAssignMission = async (data: any) => {
        if (!assignTarget) return;
        try {
            await missionsService.createGroupMission(assignTarget.id, data);
            toast.success(`Mission assignée à tout le ${assignTarget.name}`);
        } catch (error) {
            toast.error("Erreur lors de l'assignation");
            throw error;
        }
    };

    // ── Sort helper ──────────────────────────────────────────────────────────
    const toggleSort = (key: typeof sortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    // ── Capacity bar ─────────────────────────────────────────────────────────
    const getCapacityInfo = (count: number, max: number) => {
        const ratio = count / max;
        if (ratio >= 0.9) return { color: 'bg-red-500', text: 'text-red-600', label: 'Complet' };
        if (ratio >= 0.7) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Presque rempli' };
        return { color: 'bg-green-500', text: 'text-green-600', label: 'Places disponibles' };
    };


    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">

            {/* ══ Header ══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Gestion des Groupes</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">{groups.length} groupes <span className="mx-2">•</span> {stats.totalStudents} élèves au total</p>
                </div>
                <button onClick={openCreateModal} className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 w-full sm:w-auto">
                    <FiPlus size={20} /> Créer un groupe
                </button>
            </div>

            {/* ══ Stats Cards ══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <FiUsers size={24} />, label: 'Groupes actifs', value: stats.totalGroups, color: 'text-primary-600 dark:text-primary-400', iconBg: 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800/50' },
                    { icon: <FiTarget size={24} />, label: 'Élèves inscrits', value: stats.totalStudents, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50' },
                    { icon: <FiPercent size={24} />, label: 'Remplissage', value: `${stats.avgCapacity}%`, color: stats.avgCapacity >= 85 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400', iconBg: stats.avgCapacity >= 85 ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50' },
                    { icon: <FiCalendar size={24} />, label: 'Séances / sem', value: stats.sessionsWeek, color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50' },
                ].map((s, i) => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md group relative overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.iconBg.split(' ')[0]}/50 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-110 transition-transform`}></div>
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${s.iconBg} border flex items-center justify-center ${s.color} flex-shrink-0 relative z-10`}>{s.icon}</div>
                        <div className="min-w-0 relative z-10">
                            <p className="text-xs text-dark-400 uppercase tracking-wider font-bold truncate mb-1">{s.label}</p>
                            <p className={`text-2xl sm:text-3xl font-extrabold ${s.color} truncate tracking-tight`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ Search & Filters ══ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un groupe, professeur…"
                        className="input pl-10 w-full text-sm py-2.5" />
                </div>
                <div className="flex items-center gap-2">
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
                        className="input text-sm py-2.5 w-44">
                        <option value="all">Tous les niveaux</option>
                        {levels.sort((a, b) => a.order - b.order).map(lv => (
                            <option key={lv.id} value={lv.id}>{lv.order}. {lv.name}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                        className="input text-sm py-2.5 w-28">
                        <option value="all">Tous</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </select>
                    <div className="flex border border-dark-200 dark:border-dark-700 rounded-lg overflow-hidden ml-1">
                        <button onClick={() => setViewPreference('groups', 'list')} className={`p-2 text-xs ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-dark-400 hover:text-dark-600'}`} title="Vue liste">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="3" rx="0.5" /><rect x="9" y="1" width="6" height="3" rx="0.5" /><rect x="1" y="6" width="6" height="3" rx="0.5" /><rect x="9" y="6" width="6" height="3" rx="0.5" /><rect x="1" y="11" width="6" height="3" rx="0.5" /><rect x="9" y="11" width="6" height="3" rx="0.5" /></svg>
                        </button>
                        <button onClick={() => setViewPreference('groups', 'grid')} className={`p-2 text-xs ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-dark-400 hover:text-dark-600'}`} title="Vue grille">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ Groups Grid / List ══ */}
            {filteredGroups.length === 0 ? (
                <div className="text-center py-20 bg-dark-50 dark:bg-dark-900 rounded-4xl border border-dashed border-dark-200 dark:border-dark-700">
                    <FiUsers size={48} className="mx-auto text-dark-300 mb-4" />
                    <p className="text-dark-500 font-bold text-lg">Aucun groupe trouvé</p>
                    <p className="text-dark-400 text-sm mt-1">Ajustez vos filtres ou créez un nouveau groupe</p>
                </div>
            ) : viewMode === 'list' ? (
                /* ══ TABLE VIEW ══ */
                <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-dark-50/80 dark:bg-dark-800/80 border-b border-dark-100 dark:border-dark-800 text-dark-500 text-[11px] uppercase tracking-wider font-extrabold">
                                    <th className="py-4 px-6 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                                        Groupes {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-4 px-6 cursor-pointer select-none hidden sm:table-cell" onClick={() => toggleSort('level')}>
                                        Niveau {sortKey === 'level' && (sortDir === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-4 px-6 cursor-pointer select-none" onClick={() => toggleSort('capacity')}>
                                        Remplissage {sortKey === 'capacity' && (sortDir === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-4 px-6 cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('sessions')}>
                                        Séances {sortKey === 'sessions' && (sortDir === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-4 px-6 cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('active')}>
                                        Statut {sortKey === 'active' && (sortDir === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                                {filteredGroups.map(group => {
                                    const levelCfg = LEVEL_CFG[group.level || 'Débutant'] || { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500' };
                                    const cap = getCapacityInfo(group.studentCount, group.maxCapacity);
                                    return (
                                        <tr key={group.id} className={`hover:bg-dark-50/50 dark:hover:bg-dark-800/50 transition-colors group/row ${!group.isActive && 'opacity-70'}`}>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-dark-900 dark:text-white flex items-center gap-2 text-base">
                                                        {group.name}
                                                    </span>
                                                    <span className="text-xs font-semibold text-dark-500 mt-1">{group.teacherName || 'Non assigné'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden sm:table-cell">
                                                {group.levelName ? (
                                                    <Link href={`/dashboard/levels/${group.levelId}`} className={`text-xs font-bold px-3 py-1 rounded-xl ${levelCfg.bg} ${levelCfg.text} hover:opacity-80 transition-opacity inline-flex`}>
                                                        {group.levelOrder}. {group.level}
                                                    </Link>
                                                ) : group.level ? (
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${levelCfg.bg} ${levelCfg.text} inline-flex`}>
                                                        {group.level}
                                                    </span>
                                                ) : <span className="text-xs text-dark-400">-</span>}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5 max-w-[140px]">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className={cap.text}>{group.studentCount}/{group.maxCapacity}</span>
                                                        <span className="text-dark-500">{Math.round((group.studentCount / group.maxCapacity) * 100)}%</span>
                                                    </div>
                                                    <div className="bg-dark-100 dark:bg-dark-800 rounded-full h-2 overflow-hidden">
                                                        <div className={`h-full rounded-full ${cap.color}`} style={{ width: `${Math.min((group.studentCount / group.maxCapacity) * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden md:table-cell">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-dark-800 dark:text-dark-200">{group.sessionsThisWeek} <span className="text-[11px] text-dark-400 font-semibold uppercase tracking-wider">/sem</span></span>
                                                    {group.nextSession && <span className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">{group.nextSession}</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 hidden lg:table-cell">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-xl inline-flex ${group.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400'}`}>
                                                    {group.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                    <Link href={`/dashboard/groups/${group.id}`} className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Voir détails">
                                                        <FiEye size={18} />
                                                    </Link>
                                                    <button onClick={() => setAssignTarget({ id: group.id, name: group.name })}
                                                        className="p-2 rounded-xl text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Assigner un devoir au groupe">
                                                        <FiBookOpen size={16} />
                                                    </button>
                                                    <button onClick={() => openEditModal(group)} className="p-2 rounded-xl text-dark-500 hover:text-dark-900 hover:bg-dark-100 dark:text-dark-400 dark:hover:text-white dark:hover:bg-dark-800 transition-colors" title="Modifier">
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(group.id)} className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:bg-red-50 dark:text-dark-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ══ GRID VIEW ══ */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredGroups.map(group => {
                        const levelCfg = LEVEL_CFG[group.level || 'Débutant'] || { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500' };
                        const cap = getCapacityInfo(group.studentCount, group.maxCapacity);
                        return (
                            <div key={group.id} className={`bg-white dark:bg-dark-900 rounded-4xl border ${group.isActive ? 'border-dark-100 dark:border-dark-800' : 'border-dark-200 dark:border-dark-700 opacity-70'} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col`}>
                                {/* Card header */}
                                <div className="p-6 pb-4 flex-1">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-dark-900 dark:text-white truncate">{group.name}</h3>
                                                {!group.isActive && (
                                                    <span className="text-[10px] bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wide">Inactif</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {group.levelName ? (
                                                    <Link href={`/dashboard/levels/${group.levelId}`} className={`text-xs font-bold px-2.5 py-1 rounded-xl ${levelCfg.bg} ${levelCfg.text} hover:opacity-80 transition-opacity`}>
                                                        Niv. {group.levelOrder} — {group.levelName}
                                                    </Link>
                                                ) : group.level ? (
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${levelCfg.bg} ${levelCfg.text}`}>
                                                        {group.level}
                                                    </span>
                                                ) : null}
                                            </div>
                                            {group.description && <p className="text-sm font-medium text-dark-500 mt-2 line-clamp-2">{group.description}</p>}
                                        </div>
                                    </div>

                                    {/* Teacher */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                            {group.teacherName?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-sm font-bold text-dark-700 dark:text-dark-300">{group.teacherName || 'Non assigné'}</span>
                                    </div>

                                    {/* Capacity bar */}
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className={`font-extrabold ${cap.text}`}>{group.studentCount}/{group.maxCapacity} élèves</span>
                                            <span className="text-dark-500 font-bold">{Math.round((group.studentCount / group.maxCapacity) * 100)}%</span>
                                        </div>
                                        <div className="bg-dark-100 dark:bg-dark-800 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full rounded-full ${cap.color} transition-all duration-1000`}
                                                style={{ width: `${Math.min((group.studentCount / group.maxCapacity) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Mini stats row */}
                                <div className="px-6 py-3 grid grid-cols-3 gap-2 border-t border-dark-100/50 dark:border-dark-800/50 bg-dark-50/50 dark:bg-dark-950/30">
                                    <div className="text-center">
                                        <p className="text-sm font-extrabold text-dark-900 dark:text-white">{group.avgScore}%</p>
                                        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Score moy.</p>
                                    </div>
                                    <div className="text-center border-x border-dark-200/50 dark:border-dark-700/50">
                                        <p className="text-sm font-extrabold text-dark-900 dark:text-white">{group.attendanceRate}%</p>
                                        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Assiduité</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-extrabold text-dark-900 dark:text-white">{group.sessionsThisWeek}</p>
                                        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Séances/sem</p>
                                    </div>
                                </div>

                                {/* Schedule pills */}
                                {group.slots.length > 0 && (
                                    <div className="px-6 py-3 border-t border-dark-100/50 dark:border-dark-800/50">
                                        <div className="flex flex-wrap gap-2">
                                            {group.slots.map((slot, i) => (
                                                <span key={i} className="text-[11px] font-bold bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-dark-200 dark:border-dark-700">
                                                    <FiClock size={10} /> {slot.day.substring(0, 3)} {slot.startTime}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="px-6 py-4 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                    <Link href={`/dashboard/groups/${group.id}`}
                                        className="text-sm font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 transition-all hover:gap-2">
                                        <FiEye size={16} /> Voir le groupe <FiChevronRight size={14} />
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setAssignTarget({ id: group.id, name: group.name })}
                                            className="p-2 rounded-xl border border-orange-200 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-orange-600 dark:text-orange-400 transition-colors" title="Assigner un devoir">
                                            <FiBookOpen size={14} />
                                        </button>
                                        <button onClick={() => openEditModal(group)}
                                            className="p-2 rounded-xl border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-colors" title="Modifier">
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(group.id)}
                                            className="p-2 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors" title="Supprimer">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══ Create/Edit Modal ══ */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-dark-100 dark:border-dark-800 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold">{editingGroup ? 'Modifier le groupe' : 'Créer un nouveau groupe'}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"><FiX size={16} /></button>
                        </div>

                        {/* Modal body */}
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="label text-xs mb-1">Nom du groupe *</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Groupe Al-Fatiha" className="input w-full text-sm" />
                            </div>

                            {/* Level + Capacity */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label text-xs mb-1">Niveau</label>
                                    <select value={form.levelId} onChange={e => {
                                        const lv = levels.find(l => l.id === e.target.value);
                                        setForm({ ...form, levelId: e.target.value, level: lv?.name || '' });
                                    }} className="input w-full text-sm">
                                        <option value="">Aucun niveau</option>
                                        {levels.sort((a, b) => a.order - b.order).map(lv => (
                                            <option key={lv.id} value={lv.id}>{lv.order}. {lv.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs mb-1">Capacité max</label>
                                    <input type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: +e.target.value })}
                                        min={1} max={50} className="input w-full text-sm" />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="label text-xs mb-1">Description / Objectif</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Ex: Juz 30 – Mémorisation des petites sourates" className="input w-full text-sm h-20 resize-none" />
                            </div>

                            {/* Teacher */}
                            <div>
                                <label className="label text-xs mb-1">Professeur / Examinateur</label>
                                <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} className="input w-full text-sm">
                                    <option value="">Sélectionner un professeur</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.roles?.[0] || 'Professeur'})</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium">Groupe actif</span>
                                <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.isActive ? 'bg-green-500' : 'bg-dark-300'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Slots */}
                            <div>
                                <label className="label text-xs mb-2">Créneaux hebdomadaires</label>
                                <div className="space-y-2">
                                    {form.slots.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 p-2.5 rounded-xl text-sm">
                                            <FiClock size={12} className="text-dark-400" />
                                            <span className="font-medium">{slot.day}</span>
                                            <span className="text-dark-400">{slot.startTime} – {slot.endTime}</span>
                                            <button onClick={() => removeSlot(i)} className="ml-auto text-dark-400 hover:text-red-500 transition-colors"><FiX size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <select value={newSlotDay} onChange={e => setNewSlotDay(e.target.value)} className="input text-xs py-1.5 w-24">
                                        {DAY_FULL.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} className="input text-xs py-1.5 w-24" />
                                    <span className="text-dark-400 text-xs">–</span>
                                    <input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} className="input text-xs py-1.5 w-24" />
                                    <button onClick={addSlot} className="btn btn-outline text-xs py-1.5 px-3 rounded-lg"><FiPlus size={12} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="p-5 border-t border-dark-100 dark:border-dark-800 flex items-center justify-end gap-3 flex-shrink-0">
                            <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost px-5 py-2.5 rounded-xl text-sm">Annuler</button>
                            <button onClick={handleSubmit} className="btn btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary-500/20">
                                <FiCheck size={14} /> {editingGroup ? 'Enregistrer' : 'Créer le groupe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Delete Confirmation Modal ══ */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-dark-100 dark:border-dark-800">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 size={22} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Supprimer ce groupe ?</h3>
                            <p className="text-sm text-dark-500 mb-5">Cette action est irréversible. Les élèves seront retirés du groupe.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn btn-ghost py-2.5 rounded-xl text-sm">Annuler</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AssignMissionModal
                isOpen={!!assignTarget}
                onClose={() => setAssignTarget(null)}
                targetName={assignTarget?.name}
                onAssign={handleAssignMission}
                isGroup={true}
            />
        </div>
    );
}
