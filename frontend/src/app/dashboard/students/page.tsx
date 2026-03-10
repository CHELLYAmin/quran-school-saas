'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { studentApi, groupApi, parentApi } from '@/lib/api/client';
import { StudentListResponse, GroupResponse } from '@/types';
import { ParentResponse } from '@/types/parent';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiBookOpen,
    FiUsers, FiX, FiCheck, FiChevronRight, FiDownload,
    FiUserPlus, FiTrendingUp, FiActivity, FiTarget, FiCalendar,
    FiPhone, FiUser, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { missionsService } from '@/lib/services/missions';
import AssignMissionModal from '@/components/missions/AssignMissionModal';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'name' | 'group' | 'date' | 'score' | 'attendance';
type SortDir = 'asc' | 'desc';

interface EnrichedStudent extends StudentListResponse {
    phone?: string;
    dateOfBirth?: string;
    parentName?: string;
    avgScore: number;
    attendanceRate: number;
    totalRecitations: number;
    lastSession?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_PARENTS = [
    { id: 'p1', fullName: 'Khalil Al-Farsi' },
    { id: 'p2', fullName: 'Amina Mansour' },
    { id: 'p3', fullName: 'Said Khayyam' },
    { id: 'p4', fullName: 'Nadia Benali' },
    { id: 'p5', fullName: 'Rachid Kettani' },
];

function enrichStudent(s: StudentListResponse, idx: number): EnrichedStudent {
    const hash = parseInt(s.id, 10) || (s.id.charCodeAt(0) % 10) + idx;
    return {
        ...s,
        phone: `06${(10000000 + hash * 73 % 90000000).toString().padStart(8, '0')}`,
        dateOfBirth: `201${1 + (hash % 3)}-${String(1 + (hash * 3) % 12).padStart(2, '0')}-${String(1 + (hash * 7) % 28).padStart(2, '0')}`,
        parentName: MOCK_PARENTS[hash % MOCK_PARENTS.length]?.fullName,
        avgScore: 55 + Math.floor((hash * 7 + idx * 3) % 42),
        attendanceRate: 65 + Math.floor((hash * 5 + idx * 2) % 33),
        totalRecitations: 5 + Math.floor((hash * 4 + idx) % 30),
        lastSession: hash % 3 === 0 ? undefined : `2026-02-${String(15 + (hash % 7)).padStart(2, '0')}`,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentsPage() {
    const { locale, viewPreferences, setViewPreference } = useUIStore();
    const { t } = useTranslation(locale);

    const [students, setStudents] = useState<EnrichedStudent[]>([]);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [parents, setParents] = useState<ParentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Sort
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<EnrichedStudent | null>(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', dateOfBirth: '', phone: '',
        groupId: '', parentId: '', address: '', isActive: true,
    });

    // Delete
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Assignment Modal State
    const [assignTarget, setAssignTarget] = useState<{ id: string, name: string } | null>(null);

    // View mode
    const viewMode = viewPreferences.students || 'table';

    useEffect(() => { loadStudents(); }, []);

    const loadStudents = async () => {
        try {
            const [studentsRes, groupsRes, parentsRes] = await Promise.all([
                studentApi.getAll(), groupApi.getAll(), parentApi.getAll(),
            ]);
            setStudents(studentsRes.data.map((s: StudentListResponse, i: number) => enrichStudent(s, i)));
            setGroups(groupsRes.data);
            setParents(parentsRes.data);
        } catch {
            const mockGroups: GroupResponse[] = [
                { id: '1', name: 'Groupe Al-Fatiha', level: 'Débutant', maxCapacity: 20, isActive: true, studentCount: 18, createdAt: '2024-09-01' },
                { id: '2', name: 'Groupe Al-Baqara', level: 'Intermédiaire', maxCapacity: 15, isActive: true, studentCount: 12, createdAt: '2024-09-01' },
                { id: '3', name: 'Groupe Al-Imran', level: 'Avancé', maxCapacity: 12, isActive: true, studentCount: 10, createdAt: '2024-09-01' },
            ];
            setGroups(mockGroups);
            setParents(MOCK_PARENTS as any);
            setStudents([
                { id: '1', fullName: 'Ahmed Al-Farsi', groupId: '1', groupName: 'Groupe Al-Fatiha', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '2', fullName: 'Sara Mansour', groupId: '1', groupName: 'Groupe Al-Fatiha', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '3', fullName: 'Omar Khayyam', groupId: '1', groupName: 'Groupe Al-Fatiha', isActive: true, enrollmentDate: '2024-09-15' },
                { id: '4', fullName: 'Fatima Zahra', groupId: '2', groupName: 'Groupe Al-Baqara', isActive: true, enrollmentDate: '2024-10-01' },
                { id: '5', fullName: 'Youssef Benali', groupId: '2', groupName: 'Groupe Al-Baqara', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '6', fullName: 'Amina Kettani', groupId: '2', groupName: 'Groupe Al-Baqara', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '7', fullName: 'Hassan Nouri', groupId: '3', groupName: 'Groupe Al-Imran', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '8', fullName: 'Meryem Idrissi', groupId: '3', groupName: 'Groupe Al-Imran', isActive: true, enrollmentDate: '2024-09-15' },
                { id: '9', fullName: 'Khalid Bouazzaoui', groupId: '3', groupName: 'Groupe Al-Imran', isActive: false, enrollmentDate: '2024-06-01' },
                { id: '10', fullName: 'Noura El-Amrani', groupId: '1', groupName: 'Groupe Al-Fatiha', isActive: true, enrollmentDate: '2024-11-01' },
                { id: '11', fullName: 'Bilal Tazi', groupId: '1', groupName: 'Groupe Al-Fatiha', isActive: true, enrollmentDate: '2024-09-01' },
                { id: '12', fullName: 'Leila Cherkaoui', groupId: '2', groupName: 'Groupe Al-Baqara', isActive: true, enrollmentDate: '2025-01-15' },
            ].map((s, i) => enrichStudent(s, i)));
        } finally { setLoading(false); }
    };

    // ── Filtered & sorted ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = students.filter(s => {
            const q = search.trim().toLowerCase();
            if (q && !s.fullName.toLowerCase().includes(q) && !s.groupName?.toLowerCase().includes(q) && !s.parentName?.toLowerCase().includes(q)) return false;
            if (groupFilter !== 'all' && s.groupId !== groupFilter) return false;
            if (statusFilter === 'active' && !s.isActive) return false;
            if (statusFilter === 'inactive' && s.isActive) return false;
            return true;
        });
        list.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'name': cmp = a.fullName.localeCompare(b.fullName); break;
                case 'group': cmp = (a.groupName || '').localeCompare(b.groupName || ''); break;
                case 'date': cmp = a.enrollmentDate.localeCompare(b.enrollmentDate); break;
                case 'score': cmp = a.avgScore - b.avgScore; break;
                case 'attendance': cmp = a.attendanceRate - b.attendanceRate; break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });
        return list;
    }, [students, search, groupFilter, statusFilter, sortKey, sortDir]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const active = students.filter(s => s.isActive);
        return {
            total: students.length,
            active: active.length,
            inactive: students.length - active.length,
            avgScore: active.length > 0 ? Math.round(active.reduce((a, s) => a + s.avgScore, 0) / active.length) : 0,
            avgAttendance: active.length > 0 ? Math.round(active.reduce((a, s) => a + s.attendanceRate, 0) / active.length) : 0,
            groupCount: new Set(students.map(s => s.groupId).filter(Boolean)).size,
        };
    }, [students]);

    // ── Sort helper ──────────────────────────────────────────────────────────
    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };
    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <FiChevronDown size={10} className="text-dark-300" />;
        return sortDir === 'asc' ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />;
    };

    // ── Form helpers ─────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingStudent(null);
        setForm({ firstName: '', lastName: '', dateOfBirth: '', phone: '', groupId: '', parentId: '', address: '', isActive: true });
        setShowCreateModal(true);
    };

    const openEditModal = (s: EnrichedStudent) => {
        setEditingStudent(s);
        const nameParts = s.fullName.split(' ');
        setForm({
            firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '',
            dateOfBirth: s.dateOfBirth || '', phone: s.phone || '',
            groupId: s.groupId || '', parentId: '', address: '', isActive: s.isActive,
        });
        setShowCreateModal(true);
    };

    const handleSubmit = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return;
        try {
            if (editingStudent) await studentApi.update(editingStudent.id, form);
            else await studentApi.create(form);
            loadStudents();
        } catch { }
        setShowCreateModal(false);
    };

    const handleDelete = async (id: string) => {
        try { await studentApi.delete(id); loadStudents(); } catch { }
        setDeleteConfirm(null);
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


    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-6">

            {/* ══ Header ══ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Gestion des Élèves</h1>
                    <p className="text-dark-500 mt-2 font-medium">{stats.total} élèves répartis dans {stats.groupCount} groupes d&apos;apprentissage</p>
                </div>
                <button onClick={openCreateModal} className="relative z-10 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                    <FiUserPlus size={18} /> Inscrire un élève
                </button>
            </div>

            {/* ══ Stats Cards ══ */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { icon: <FiUsers size={20} />, label: 'Total Inscrits', value: stats.total, color: 'text-primary-600 dark:text-primary-400', iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20' },
                    { icon: <FiCheck size={20} />, label: 'Actifs', value: stats.active, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' },
                    { icon: <FiX size={20} />, label: 'Inactifs', value: stats.inactive, color: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800' },
                    { icon: <FiTrendingUp size={20} />, label: 'Moy. Globale', value: `${stats.avgScore}%`, color: stats.avgScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400', iconBg: stats.avgScore >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 border border-amber-100 dark:border-amber-800' },
                    { icon: <FiActivity size={20} />, label: 'Assiduité', value: `${stats.avgAttendance}%`, color: stats.avgAttendance >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400', iconBg: stats.avgAttendance >= 85 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 border border-amber-100 dark:border-amber-800' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 p-5 sm:p-6 flex flex-col items-center sm:items-start sm:flex-row gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${s.iconBg}`}>{s.icon}</div>
                        <div className="text-center sm:text-left min-w-0">
                            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${s.color} truncate`}>{s.value}</p>
                            <p className="text-[10px] sm:text-xs text-dark-500 font-bold uppercase tracking-widest truncate mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ Search & Filters ══ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 p-3 rounded-[2rem] shadow-sm border border-dark-100 dark:border-dark-800">
                <div className="relative flex-1 min-w-[250px]">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher par nom d&apos;élève ou parent..."
                        className="w-full bg-dark-50 dark:bg-dark-950 border-none rounded-2xl pl-12 pr-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
                        className="bg-dark-50 dark:bg-dark-950 border-none rounded-2xl px-5 py-4 outline-none font-bold text-sm text-dark-600 dark:text-dark-300 appearance-none cursor-pointer flex-1 sm:flex-none">
                        <option value="all">Tous les groupes</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                        className="bg-dark-50 dark:bg-dark-950 border-none rounded-2xl px-5 py-4 outline-none font-bold text-sm text-dark-600 dark:text-dark-300 appearance-none cursor-pointer flex-1 sm:flex-none">
                        <option value="all">Statut : Tous</option>
                        <option value="active">Actifs uniquement</option>
                        <option value="inactive">Inactifs</option>
                    </select>

                    {/* View Toggles */}
                    <div className="flex bg-dark-50 dark:bg-dark-950 p-1.5 rounded-2xl shrink-0">
                        <button onClick={() => setViewPreference('students', 'table')} className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'}`} title="Vue Tableau">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="3" rx="0.5" /><rect x="9" y="1" width="6" height="3" rx="0.5" /><rect x="1" y="6" width="6" height="3" rx="0.5" /><rect x="9" y="6" width="6" height="3" rx="0.5" /><rect x="1" y="11" width="6" height="3" rx="0.5" /><rect x="9" y="11" width="6" height="3" rx="0.5" /></svg>
                        </button>
                        <button onClick={() => setViewPreference('students', 'cards')} className={`p-3 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'}`} title="Vue Cartes">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ Results count ══ */}
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-dark-400 px-2 pl-4">
                <span>{filtered.length} élève{filtered.length > 1 ? 's' : ''} correspondant{filtered.length > 1 ? 's' : ''}</span>
            </div>

            {/* ══ TABLE VIEW ══ */}
            {viewMode === 'table' ? (
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-dark-50/80 dark:bg-dark-950/80 text-dark-500 text-[10px] uppercase tracking-widest font-extrabold border-b border-dark-100 dark:border-dark-800">
                                    <th className="px-6 py-5 text-left cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors" onClick={() => toggleSort('name')}>
                                        <span className="flex items-center gap-2">Élève {SortIcon({ col: 'name' })}</span>
                                    </th>
                                    <th className="px-5 py-5 text-left cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors" onClick={() => toggleSort('group')}>
                                        <span className="flex items-center gap-2">Groupe d&apos;assignation {SortIcon({ col: 'group' })}</span>
                                    </th>
                                    <th className="px-5 py-5 text-center cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors" onClick={() => toggleSort('score')}>
                                        <span className="flex items-center justify-center gap-2">Moyenne {SortIcon({ col: 'score' })}</span>
                                    </th>
                                    <th className="px-5 py-5 text-center cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors" onClick={() => toggleSort('attendance')}>
                                        <span className="flex items-center justify-center gap-2">Assiduité {SortIcon({ col: 'attendance' })}</span>
                                    </th>
                                    <th className="px-5 py-5 text-center hidden lg:table-cell">Récitations</th>
                                    <th className="px-5 py-5 text-center hidden md:table-cell cursor-pointer select-none hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors" onClick={() => toggleSort('date')}>
                                        <span className="flex items-center justify-center gap-2">Inscription {SortIcon({ col: 'date' })}</span>
                                    </th>
                                    <th className="px-5 py-5 text-center">Statut</th>
                                    <th className="px-6 py-5 text-right w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                                {filtered.map(student => {
                                    const scoreColor = student.avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : student.avgScore >= 60 ? 'text-amber-500' : 'text-rose-500';
                                    const attendColor = student.attendanceRate >= 90 ? 'text-emerald-600 dark:text-emerald-400' : student.attendanceRate >= 75 ? 'text-amber-500' : 'text-rose-500';
                                    return (
                                        <tr key={student.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-extrabold shadow-sm shadow-primary-500/20 flex-shrink-0">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-base text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{student.fullName}</p>
                                                        {student.parentName && <p className="text-xs font-semibold text-dark-400">Parent: {student.parentName}</p>}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4">
                                                {student.groupName ? (
                                                    <Link href={`/dashboard/groups/${student.groupId}`} className="text-xs font-bold text-primary-700 dark:text-primary-300 hover:text-primary-800 bg-primary-50 border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800/50 px-3 py-1.5 rounded-xl inline-block transition-colors">
                                                        {student.groupName}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs font-bold uppercase tracking-widest text-dark-400 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-xl border border-dark-100 dark:border-dark-700">Non assigné</span>
                                                )}
                                            </td>
                                            <td className={`px-5 py-4 text-center font-extrabold text-lg ${scoreColor}`}>{student.avgScore}%</td>
                                            <td className={`px-5 py-4 text-center font-extrabold text-lg ${attendColor}`}>{student.attendanceRate}%</td>
                                            <td className="px-5 py-4 text-center font-bold text-dark-600 dark:text-dark-300 hidden lg:table-cell">{student.totalRecitations}</td>
                                            <td className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-dark-500 hidden md:table-cell">
                                                {new Date(student.enrollmentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border ${student.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/50'}`}>
                                                    {student.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/dashboard/students/${student.id}`}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors" title="Voir profil">
                                                        <FiEye size={16} />
                                                    </Link>
                                                    <button onClick={() => setAssignTarget({ id: student.id, name: student.fullName })}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors" title="Assigner un devoir">
                                                        <FiBookOpen size={16} />
                                                    </button>
                                                    <button onClick={() => openEditModal(student)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-dark-800 border border-transparent hover:border-dark-200 dark:hover:border-dark-700 shadow-sm text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-all" title="Modifier">
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(student.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-dark-400 hover:text-rose-500 transition-all" title="Supprimer">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-16 text-dark-400">
                                        <div className="w-20 h-20 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-100 dark:border-dark-700">
                                            <FiUsers size={32} className="text-dark-300" />
                                        </div>
                                        <p className="font-extrabold text-lg text-dark-900 dark:text-white">Aucun élève trouvé</p>
                                        <p className="text-sm font-medium mt-1">Ajustez vos filtres ou inscrivez un nouvel élève au système.</p>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ══ CARDS VIEW ══ */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-16 text-dark-400">
                            <div className="w-20 h-20 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-100 dark:border-dark-700">
                                <FiUsers size={32} className="text-dark-300" />
                            </div>
                            <p className="font-extrabold text-lg text-dark-900 dark:text-white">Aucun élève trouvé</p>
                            <p className="text-sm font-medium mt-1">Ajustez vos filtres ou inscrivez un nouvel élève au système.</p>
                        </div>
                    ) : filtered.map(student => {
                        const scoreColor = student.avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : student.avgScore >= 60 ? 'text-amber-500' : 'text-rose-500';
                        return (
                            <div key={student.id} className={`bg-white dark:bg-dark-900 rounded-[2rem] border ${student.isActive ? 'border-dark-100 dark:border-dark-800' : 'border-dark-200 dark:border-dark-700 opacity-70'} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}>
                                <div className="p-6 flex-1">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-primary-500/20">
                                            {student.fullName.charAt(0)}
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${student.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/50'}`}>
                                            {student.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <div className="mb-5">
                                        <p className="font-extrabold text-xl text-dark-900 dark:text-white tracking-tight mb-1 line-clamp-1">{student.fullName}</p>
                                        {student.groupName ? (
                                            <Link href={`/dashboard/groups/${student.groupId}`} className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">
                                                {student.groupName}
                                            </Link>
                                        ) : (
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-dark-400">Non assigné</p>
                                        )}
                                    </div>

                                    {/* Mini stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-5">
                                        <div className="bg-dark-50 dark:bg-dark-950 rounded-2xl p-3 border border-dark-100 dark:border-dark-800 text-center shadow-sm">
                                            <p className={`text-base font-extrabold ${scoreColor}`}>{student.avgScore}%</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-dark-500 mt-1">Score</p>
                                        </div>
                                        <div className="bg-dark-50 dark:bg-dark-950 rounded-2xl p-3 border border-dark-100 dark:border-dark-800 text-center shadow-sm">
                                            <p className="text-base font-extrabold text-dark-700 dark:text-dark-200">{student.attendanceRate}%</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-dark-500 mt-1">Assiduité</p>
                                        </div>
                                        <div className="bg-dark-50 dark:bg-dark-950 rounded-2xl p-3 border border-dark-100 dark:border-dark-800 text-center shadow-sm">
                                            <p className="text-base font-extrabold text-dark-700 dark:text-dark-200">{student.totalRecitations}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-dark-500 mt-1">Récit.</p>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2.5">
                                        {student.parentName && (
                                            <p className="text-xs font-bold text-dark-500 flex items-center gap-2">
                                                <FiUsers size={14} className="text-dark-400" />
                                                <span className="truncate">{student.parentName}</span>
                                            </p>
                                        )}
                                        <p className="text-xs font-bold text-dark-500 flex items-center gap-2">
                                            <FiCalendar size={14} className="text-dark-400" />
                                            <span>Inscr. le {new Date(student.enrollmentDate).toLocaleDateString('fr-FR')}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-6 py-4 border-t border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/20 flex items-center justify-between">
                                    <Link href={`/dashboard/students/${student.id}`}
                                        className="text-xs font-extrabold uppercase tracking-widest text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors">
                                        <FiEye size={14} /> Voir profil
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setAssignTarget({ id: student.id, name: student.fullName })} className="w-8 h-8 flex items-center justify-center rounded-xl text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 transition-all" title="Assigner un devoir"><FiBookOpen size={13} /></button>
                                        <button onClick={() => openEditModal(student)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-sm text-dark-500 hover:text-dark-900 dark:hover:text-white transition-all"><FiEdit2 size={13} /></button>
                                        <button onClick={() => setDeleteConfirm(student.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-sm text-dark-500 hover:text-rose-500 transition-all"><FiTrash2 size={13} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══ Create/Edit Modal ══ */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-dark-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4 sm:p-6" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-dark-100 dark:border-dark-800 flex flex-col max-h-[90vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                        <div className="p-8 sm:px-10 sm:pt-10 sm:pb-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0 relative z-10">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-dark-900 dark:text-white">{editingStudent ? 'Modifier l&apos;élève' : 'Inscrire un nouvel élève'}</h2>
                                <p className="text-sm font-medium text-dark-500 mt-1">{editingStudent ? 'Mettez à jour les informations de cet élève.' : 'Remplissez ce formulaire pour ajouter un élève au système.'}</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-2xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-500 hover:bg-dark-100 hover:text-dark-900 dark:hover:bg-dark-700 dark:hover:text-white transition-all"><FiX size={20} /></button>
                        </div>

                        <div className="p-8 sm:p-10 overflow-y-auto flex-1 space-y-8 relative z-10 custom-scrollbar">
                            {/* Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Prénom *</label>
                                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                                        placeholder="Ex: Ahmed" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Nom *</label>
                                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                                        placeholder="Ex: Al-Farsi" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                                </div>
                            </div>

                            {/* DOB + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Date de naissance</label>
                                    <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                                        className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white appearance-none min-h-[56px] color-scheme-light dark:color-scheme-dark" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Téléphone</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="06 XX XX XX XX" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                                </div>
                            </div>

                            {/* Group + Parent */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Groupe</label>
                                    <select value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white appearance-none cursor-pointer">
                                        <option value="">Sélectionner un groupe</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Parent</label>
                                    <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white appearance-none cursor-pointer">
                                        <option value="">Sélectionner un parent</option>
                                        {parents.map((p: ParentResponse) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Adresse</label>
                                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="Adresse complète (optionnel)" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                            </div>

                            {/* Status toggle */}
                            <div className="bg-dark-50 dark:bg-dark-950 p-6 rounded-[2rem] border border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                <div>
                                    <span className="text-base font-extrabold text-dark-900 dark:text-white block tracking-tight">Compte actif</span>
                                    <p className="text-xs font-medium text-dark-500 mt-1">L&apos;élève pourra accéder à son espace et participer aux sessions.</p>
                                </div>
                                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${form.isActive ? 'bg-emerald-500 shadow-inner' : 'bg-dark-200 dark:bg-dark-700'}`}>
                                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 sm:px-10 sm:py-6 border-t border-dark-100 dark:border-dark-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 flex-shrink-0 relative z-10 bg-white/50 dark:bg-dark-900/50 backdrop-blur-md">
                            <button onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-extrabold py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-sm text-center">
                                Annuler
                            </button>
                            <button onClick={handleSubmit} className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-4 px-10 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                                <FiCheck size={18} /> {editingStudent ? 'Enregistrer' : 'Inscrire l&apos;élève'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Delete Confirmation Modal ══ */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-dark-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm mx-auto p-8 border border-dark-100 dark:border-dark-800 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-2xl -z-0 pointer-events-none" />

                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white dark:border-dark-900 shadow-lg">
                            <FiTrash2 size={28} className="text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold mb-3 tracking-tight text-dark-900 dark:text-white relative z-10">Supprimer cet élève ?</h3>
                        <p className="text-sm font-medium text-dark-500 mb-8 leading-relaxed relative z-10">Cette action est irréversible. L&apos;élève sera retiré de son groupe et ses données liées seront supprimées.</p>
                        <div className="flex flex-col gap-3 relative z-10">
                            <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                                Confirmer la suppression
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="w-full bg-dark-50 hover:bg-dark-100 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-extrabold py-4 rounded-2xl transition-all uppercase tracking-widest text-sm">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AssignMissionModal
                isOpen={!!assignTarget}
                onClose={() => setAssignTarget(null)}
                targetName={assignTarget?.name}
                onAssign={handleAssignMission}
            />
        </div>
    );
}
