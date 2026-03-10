'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { userApi, roleApi } from '@/lib/api/client';
import { UserResponse, UserRole } from '@/types';
import { RoleResponse } from '@/types/role';
import RequirePermission from '@/components/auth/RequirePermission';
import { Permissions } from '@/hooks/usePermission';
import { useUIStore } from '@/lib/store';
import {
    FiUsers, FiSearch, FiEdit2, FiShield, FiX, FiCheck, FiUser,
    FiPlus, FiTrash2, FiUserPlus, FiChevronDown, FiChevronUp, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'name' | 'email' | 'role' | 'status';
type SortDir = 'asc' | 'desc';

export default function AdminUsersPage() {
    const { viewPreferences, setViewPreference } = useUIStore();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sort
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Modals state
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // User Form
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', role: UserRole.Teacher,
        phone: '', preferredLanguage: 'fr', isActive: true
    });

    const viewMode = viewPreferences.users || 'table';

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                userApi.getAll(),
                roleApi.getAll()
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (e) {
            console.error('Failed to load users', e);
            // mock data for the UI interaction if backend is offline
            setUsers([
                { id: '1', email: 'admin@quran.com', firstName: 'Admin', lastName: 'Global', fullName: 'Admin Global', roles: [UserRole.SuperAdmin, UserRole.Teacher], isActive: true, preferredLanguage: 'fr', createdAt: '2024-01-01' },
                { id: '2', email: 'teacher@quran.com', firstName: 'Professeur', lastName: 'A', fullName: 'Professeur A', roles: [UserRole.Teacher], isActive: true, preferredLanguage: 'fr', createdAt: '2024-01-02' },
                { id: '3', email: 'parent@quran.com', firstName: 'Parent', lastName: 'B', fullName: 'Parent B', roles: [UserRole.Parent], isActive: false, preferredLanguage: 'fr', createdAt: '2024-02-01' },
            ] as UserResponse[]);
            setRoles([
                { id: '1', name: 'SuperAdmin', isSystemRole: true, permissions: [] },
                { id: '2', name: 'Teacher', isSystemRole: true, permissions: [] },
                { id: '3', name: 'Parent', isSystemRole: true, permissions: [] },
                { id: '4', name: 'Student', isSystemRole: true, permissions: [] },
                { id: '5', name: 'Admin', isSystemRole: true, permissions: [] },
            ] as RoleResponse[]);
        } finally {
            setLoading(false);
        }
    };

    // ── Filtered & sorted ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = users.filter(u => {
            const q = search.toLowerCase();
            const fullName = u.fullName || `${u.firstName} ${u.lastName}`.trim() || '—';
            const rolesStr = u.roles ? u.roles.join(',') : '';

            if (q && !u.email.toLowerCase().includes(q) && !fullName.toLowerCase().includes(q) && !rolesStr.toLowerCase().includes(q)) return false;
            if (roleFilter !== 'all' && !u.roles?.includes(roleFilter as UserRole)) return false;
            if (statusFilter === 'active' && !u.isActive) return false;
            if (statusFilter === 'inactive' && u.isActive) return false;
            return true;
        });

        list.sort((a, b) => {
            let cmp = 0;
            const nameA = a.fullName || `${a.firstName} ${a.lastName}`;
            const nameB = b.fullName || `${b.firstName} ${b.lastName}`;

            switch (sortKey) {
                case 'name': cmp = nameA.localeCompare(nameB); break;
                case 'email': cmp = a.email.localeCompare(b.email); break;
                case 'role': cmp = (a.roles?.[0] || '').localeCompare(b.roles?.[0] || ''); break;
                case 'status': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return list;
    }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

    const stats = useMemo(() => {
        const active = users.filter(u => u.isActive);
        return {
            total: users.length,
            active: active.length,
            inactive: users.length - active.length,
            adminCount: users.filter(u => u.roles?.includes(UserRole.SuperAdmin) || u.roles?.includes(UserRole.Admin)).length
        };
    }, [users]);

    // ── Sort helper ──────────────────────────────────────────────────────────
    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <FiChevronDown size={10} className="text-dark-300" />;
        return sortDir === 'asc' ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />;
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingUser(null);
        setForm({ firstName: '', lastName: '', email: '', password: '', role: UserRole.Teacher, phone: '', preferredLanguage: 'fr', isActive: true });
        setShowUserModal(true);
    };

    const openEditModal = (user: UserResponse) => {
        setEditingUser(user);
        setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            password: '', // blank on edit
            role: user.roles?.[0] || UserRole.Teacher,
            phone: user.phone || '',
            preferredLanguage: user.preferredLanguage || 'fr',
            isActive: user.isActive
        });
        setShowUserModal(true);
    };

    const handleUserSubmit = async () => {
        if (!form.email || !form.firstName || !form.lastName) return;

        try {
            if (editingUser) {
                await userApi.update(editingUser.id, {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    preferredLanguage: form.preferredLanguage,
                    isActive: form.isActive
                    // email is typically read-only or requires special endpoint to change
                });
                toast.success('Utilisateur mis à jour');
            } else {
                if (!form.password) {
                    toast.error('Mot de passe requis pour la création');
                    return;
                }
                // Normally we'd use an admin creation endpoint. using authApi.register for now if that's what backend supports or userApi.create. Assuming userApi.create exists
                await userApi.create({
                    email: form.email,
                    password: form.password,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    role: form.role,
                    phone: form.phone,
                    preferredLanguage: form.preferredLanguage,
                    isActive: form.isActive
                });
                toast.success('Utilisateur créé avec succès');
            }
            setShowUserModal(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la sauvegarde du compte');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await userApi.delete(id);
            toast.success('Utilisateur supprimé');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleteConfirm(null);
        }
    };

    // ── Roles Handlers ───────────────────────────────────────────────────────
    const openRolesModal = (user: UserResponse) => {
        setEditingUser(user);
        const ids = new Set<string>();
        (user.roles || []).forEach((rn: string) => {
            const matched = roles.find(r => r.name === rn);
            if (matched) ids.add(matched.id);
            else {
                const matchedId = roles.find(r => r.id === rn);
                if (matchedId) ids.add(matchedId.id);
            }
        });
        setSelectedRoleIds(ids);
        setShowRolesModal(true);
    };

    const toggleRole = (roleId: string) => {
        const newSet = new Set(selectedRoleIds);
        if (newSet.has(roleId)) newSet.delete(roleId);
        else newSet.add(roleId);
        setSelectedRoleIds(newSet);
    };

    const handleSaveRoles = async () => {
        if (!editingUser) return;
        try {
            const roleNames = Array.from(selectedRoleIds).map(id => {
                const r = roles.find(ro => ro.id === id);
                return r ? r.name : id;
            });
            await userApi.updateRoles(editingUser.id, roleNames);
            toast.success('Rôles mis à jour');
            setShowRolesModal(false);
            setEditingUser(null);
            loadData();
        } catch (e) {
            console.error('Update roles failed', e);
            toast.error('Erreur lors de la mise à jour des rôles');
        }
    };


    if (loading) return <PageSkeleton variant="table" />;

    return (
        <RequirePermission requiredPermission={Permissions.UsersManage} fallback={
            <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800">
                <FiUsers size={48} className="mx-auto text-dark-200 mb-4" />
                <h2 className="text-xl font-bold mb-2">Accès restreint</h2>
                <p className="text-dark-500">Vous n'avez pas la permission de gérer les utilisateurs du système.</p>
            </div>
        }>
            <div className="space-y-8 font-sans">
                {/* ══ Header ══ */}
                <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Comptes Utilisateurs</h1>
                        <p className="text-dark-500 mt-2 font-medium text-lg">{stats.total} compte(s) enregistré(s) dans le système</p>
                    </div>
                    <button onClick={openCreateModal} className="relative z-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-extrabold shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest whitespace-nowrap">
                        <FiUserPlus size={18} /> Ajouter un utilisateur
                    </button>
                </div>

                {/* ══ Stats Cards ══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full blur-2xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20 flex items-center justify-center text-white relative z-10">
                            <FiUsers size={24} />
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{stats.total}</p>
                            <p className="text-[10px] text-dark-400 uppercase tracking-widest font-extrabold mt-1">Total comptes</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white relative z-10">
                            <FiCheck size={24} />
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{stats.active}</p>
                            <p className="text-[10px] text-dark-400 uppercase tracking-widest font-extrabold mt-1">Actifs</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-colors pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20 flex items-center justify-center text-white relative z-10">
                            <FiX size={24} />
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{stats.inactive}</p>
                            <p className="text-[10px] text-dark-400 uppercase tracking-widest font-extrabold mt-1">Inactifs</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-50 dark:bg-accent-900/20 rounded-full blur-2xl group-hover:bg-accent-100 dark:group-hover:bg-accent-900/30 transition-colors pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20 flex items-center justify-center text-white relative z-10">
                            <FiShield size={24} />
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{stats.adminCount}</p>
                            <p className="text-[10px] text-dark-400 uppercase tracking-widest font-extrabold mt-1">Administrateurs</p>
                        </div>
                    </div>
                </div>

                {/* ══ Search & Filters ══ */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white dark:bg-dark-900 p-4 rounded-[2rem] border border-dark-100 dark:border-dark-800 shadow-sm relative z-20">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, email..."
                            className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-[1.5rem] pl-14 pr-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-[180px] bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-[1.5rem] px-6 py-4 outline-none font-bold transition-all text-dark-900 dark:text-white appearance-none cursor-pointer">
                                <option value="all">Tous les rôles</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="w-[160px] bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-[1.5rem] px-6 py-4 outline-none font-bold transition-all text-dark-900 dark:text-white appearance-none cursor-pointer">
                                <option value="all">Tous statuts</option>
                                <option value="active">Actifs</option>
                                <option value="inactive">Inactifs</option>
                            </select>
                            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                        </div>
                        <div className="flex bg-dark-50 dark:bg-dark-950 border-2 border-transparent rounded-[1.5rem] p-1.5 overflow-hidden ml-auto sm:ml-0">
                            <button onClick={() => setViewPreference('users', 'table')} className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-dark-800 text-primary-600 shadow-md' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`} title="Vue tableau">
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="3" rx="0.5" /><rect x="9" y="1" width="6" height="3" rx="0.5" /><rect x="1" y="6" width="6" height="3" rx="0.5" /><rect x="9" y="6" width="6" height="3" rx="0.5" /><rect x="1" y="11" width="6" height="3" rx="0.5" /><rect x="9" y="11" width="6" height="3" rx="0.5" /></svg>
                            </button>
                            <button onClick={() => setViewPreference('users', 'cards')} className={`p-3 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-dark-800 text-primary-600 shadow-md' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`} title="Vue cartes">
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ Results Count ══ */}
                <div className="text-xs text-dark-400">
                    {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                </div>

                {/* ══ VIEW ROUTES ══ */}
                {viewMode === 'table' ? (
                    <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-dark-100 dark:border-dark-800 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-dark-50/50 dark:bg-dark-950/20 border-b border-dark-100 dark:border-dark-800">
                                        <th className="px-8 py-6 text-left cursor-pointer text-[10px] font-extrabold uppercase tracking-widest text-dark-500 hover:text-primary-600 transition-colors" onClick={() => toggleSort('name')}><span className="flex items-center gap-2">Utilisateur <SortIcon col="name" /></span></th>
                                        <th className="px-8 py-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-dark-500">Profil Lié</th>
                                        <th className="px-8 py-6 text-left cursor-pointer text-[10px] font-extrabold uppercase tracking-widest text-dark-500 hover:text-primary-600 transition-colors" onClick={() => toggleSort('role')}><span className="flex items-center gap-2">Rôles <SortIcon col="role" /></span></th>
                                        <th className="px-8 py-6 text-center cursor-pointer text-[10px] font-extrabold uppercase tracking-widest text-dark-500 hover:text-primary-600 transition-colors" onClick={() => toggleSort('status')}><span className="flex items-center justify-center gap-2">Statut <SortIcon col="status" /></span></th>
                                        <th className="px-8 py-6 text-right text-[10px] font-extrabold uppercase tracking-widest text-dark-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                                    {filtered.map(user => {
                                        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—';
                                        const initial = (fullName !== '—' ? fullName : user.email).charAt(0).toUpperCase();

                                        return (
                                            <tr key={user.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 flex-shrink-0 rounded-[1.25rem] bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-primary-500/20">
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-lg tracking-tight text-dark-900 dark:text-white mb-0.5">{fullName}</p>
                                                            <p className="text-xs font-bold text-dark-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-dark-600 dark:text-dark-400 font-medium whitespace-nowrap">
                                                    {(user as UserResponse & { linkedProfileType?: string }).linkedProfileType ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 text-xs font-bold uppercase tracking-widest shadow-sm">
                                                            <FiUser size={14} className="text-dark-400" /> {(user as UserResponse & { linkedProfileType?: string }).linkedProfileType}
                                                        </span>
                                                    ) : <span className="text-xs font-bold text-dark-400 italic">Aucun profil lié</span>}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(user.roles || []).map((r: string, idx: number) => (
                                                            <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm border border-primary-100 text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800/50 dark:text-primary-400 uppercase tracking-widest">
                                                                {r}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm border ${user.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400'}`}>
                                                        {user.isActive ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                        <button onClick={() => openRolesModal(user)} className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-dark-300 dark:hover:border-dark-600 text-dark-400 hover:text-dark-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1" title="Modifier rôles">
                                                            <FiShield size={16} />
                                                        </button>
                                                        <button onClick={() => openEditModal(user)} className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-dark-300 dark:hover:border-dark-600 text-dark-400 hover:text-dark-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1" title="Modifier infos">
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(user.id)} className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-dark-400 hover:text-rose-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1" title="Supprimer">
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center text-dark-400">
                                                    <div className="w-20 h-20 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 border border-dark-100 dark:border-dark-700">
                                                        <FiUsers size={32} className="text-dark-300" />
                                                    </div>
                                                    <p className="font-extrabold text-lg text-dark-900 dark:text-white">Aucun utilisateur trouvé</p>
                                                    <p className="text-sm font-medium mt-1">Modifiez vos filtres ou ajoutez un nouvel utilisateur.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-dark-50 dark:bg-dark-900 rounded-[3rem] border border-dark-100 dark:border-dark-800">
                                <div className="w-24 h-24 bg-dark-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-200 dark:border-dark-700 shadow-inner">
                                    <FiUsers size={40} className="text-dark-300" />
                                </div>
                                <p className="text-dark-900 dark:text-white font-extrabold text-2xl tracking-tight">Aucun utilisateur trouvé</p>
                                <p className="text-dark-500 font-medium mt-2">Essayez de modifier vos filtres.</p>
                            </div>
                        ) : filtered.map(user => {
                            const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—';
                            return (
                                <div key={user.id} className={`bg-white dark:bg-dark-900 rounded-[2.5rem] border ${user.isActive ? 'border-dark-100 dark:border-dark-800 hover:shadow-2xl' : 'border-dark-200 dark:border-dark-700 opacity-70'} overflow-hidden transition-all duration-300 hover:-translate-y-1 group flex flex-col`}>
                                    <div className="p-8 relative flex-1">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/10 rounded-bl-[4rem] group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors pointer-events-none" />

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
                                                {(fullName !== '—' ? fullName : user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border shadow-sm ${user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50'} uppercase tracking-widest`}>
                                                {user.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>

                                        <div className="mb-6 relative z-10">
                                            <p className="font-extrabold text-2xl text-dark-900 dark:text-white tracking-tight mb-1 truncate" title={fullName}>{fullName}</p>
                                            <p className="text-sm font-bold text-dark-500 truncate" title={user.email}>{user.email}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                            {(user.roles || []).map((r: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm border border-primary-100 text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800/50 dark:text-primary-400 uppercase tracking-widest">
                                                    {r}
                                                </span>
                                            ))}
                                            {(!user.roles || user.roles.length === 0) && <span className="text-xs text-dark-400 italic font-bold">Aucun rôle</span>}
                                        </div>
                                        <p className="text-[10px] font-extrabold text-dark-400 uppercase tracking-widest relative z-10">Inscrit le {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                                    </div>

                                    <div className="px-8 py-5 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/50 dark:bg-dark-950/50">
                                        <button onClick={() => openRolesModal(user)} className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-2 transition-colors uppercase tracking-widest bg-white dark:bg-dark-900 px-4 py-2 rounded-xl shadow-sm border border-dark-100 dark:border-dark-800 hover:shadow-md">
                                            <FiShield size={14} /> Gérer
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openEditModal(user)} className="w-9 h-9 rounded-xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-dark-300 dark:hover:border-dark-700 shadow-sm text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 flex items-center justify-center transition-all hover:shadow-md hover:-translate-y-0.5"><FiEdit2 size={14} /></button>
                                            <button onClick={() => setDeleteConfirm(user.id)} className="w-9 h-9 rounded-xl bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-dark-400 hover:text-rose-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"><FiTrash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══ Create/Edit User Modal ══ */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-dark-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4 sm:p-6" onClick={() => setShowUserModal(false)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-dark-100 dark:border-dark-800 flex flex-col max-h-[90vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                            <div className="p-8 sm:px-10 sm:pt-10 sm:pb-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-dark-900 dark:text-white">{editingUser ? `Modifier l'utilisateur` : 'Nouvel utilisateur'}</h2>
                                    <p className="text-sm font-medium text-dark-500 mt-1">{editingUser ? editingUser.email : 'Remplissez les informations ci-dessous'}</p>
                                </div>
                                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 rounded-2xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-500 hover:bg-dark-100 hover:text-dark-900 dark:hover:bg-dark-700 dark:hover:text-white transition-all"><FiX size={20} /></button>
                            </div>

                            <div className="p-8 sm:p-10 overflow-y-auto flex-1 space-y-8 relative z-10 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Prénom *</label>
                                        <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" placeholder="Ex: Ahmed" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Nom *</label>
                                        <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" placeholder="Ex: Al-Farsi" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editingUser} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-dark-400" placeholder="email@exemple.com" />
                                </div>

                                {!editingUser && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Mot de passe *</label>
                                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Rôle initial</label>
                                            <div className="relative">
                                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all text-dark-900 dark:text-white appearance-none cursor-pointer">
                                                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                                </select>
                                                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-2 block pl-2">Téléphone</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white placeholder:text-dark-400" placeholder="+33 6 XX XX XX XX" />
                                </div>

                                <div className="bg-dark-50 dark:bg-dark-950 p-6 rounded-[2rem] border border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                    <div>
                                        <span className="text-base font-extrabold text-dark-900 dark:text-white block tracking-tight">Compte actif</span>
                                        <span className="text-xs font-medium text-dark-500 mt-1">Un compte inactif ne peut pas se connecter</span>
                                    </div>
                                    <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${form.isActive ? 'bg-emerald-500 shadow-inner' : 'bg-dark-200 dark:bg-dark-700'}`}>
                                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 sm:px-10 sm:py-6 border-t border-dark-100 dark:border-dark-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 flex-shrink-0 relative z-10 bg-white/50 dark:bg-dark-900/50 backdrop-blur-md">
                                <button onClick={() => setShowUserModal(false)} className="w-full sm:w-auto bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-extrabold py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-sm text-center">Annuler</button>
                                <button onClick={handleUserSubmit} className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-4 px-10 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                                    <FiCheck size={18} /> {editingUser ? 'Enregistrer' : 'Créer l&apos;utilisateur'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ Role Assignment Modal ══ */}
                {showRolesModal && editingUser && (
                    <div className="fixed inset-0 bg-dark-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4 sm:p-6" onClick={() => setShowRolesModal(false)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-dark-100 dark:border-dark-800 flex flex-col max-h-[90vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                            <div className="p-8 pb-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0 relative z-10">
                                <div>
                                    <h2 className="text-xl font-extrabold tracking-tight text-dark-900 dark:text-white">Gérer les Rôles</h2>
                                    <p className="text-sm font-medium text-dark-500 mt-1">{editingUser.email}</p>
                                </div>
                                <button onClick={() => setShowRolesModal(false)} className="w-10 h-10 rounded-2xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-500 hover:bg-dark-100 hover:text-dark-900 dark:hover:bg-dark-700 dark:hover:text-white transition-all"><FiX size={20} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-3 flex-1 relative z-10 custom-scrollbar">
                                {roles.map(role => {
                                    const hasRole = editingUser.roles?.includes(role.name as any);
                                    return (
                                        <label key={role.id} className={`flex items-start gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all ${hasRole ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-dark-100 dark:border-dark-800 hover:border-primary-200 dark:hover:border-primary-900/50 bg-white dark:bg-dark-900'}`}>
                                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${hasRole ? 'bg-primary-500 border-primary-500 text-white' : 'border-dark-300 dark:border-dark-600 bg-transparent'}`}>
                                                {hasRole && <FiCheck size={14} />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={hasRole}
                                                onChange={(e) => {
                                                    let newRoles = [...(editingUser.roles || [])];
                                                    if (e.target.checked) newRoles.push(role.name as any);
                                                    else newRoles = newRoles.filter(r => r !== role.name as any);
                                                    setEditingUser({ ...editingUser, roles: newRoles });
                                                }}
                                            />
                                            <div>
                                                <p className={`font-extrabold text-base ${hasRole ? 'text-primary-700 dark:text-primary-400' : 'text-dark-900 dark:text-white'} mb-0.5`}>{role.name}</p>
                                                <p className="text-sm font-medium text-dark-500 line-clamp-2">{role.description || 'Aucune description disponible'}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="p-8 pt-6 border-t border-dark-100 dark:border-dark-800 flex items-center justify-end gap-4 flex-shrink-0 relative z-10 bg-white/50 dark:bg-dark-900/50 backdrop-blur-md">
                                <button onClick={() => setShowRolesModal(false)} className="w-full sm:w-auto bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-extrabold py-3 px-6 rounded-2xl transition-all uppercase tracking-widest text-sm text-center">Annuler</button>
                                <button onClick={handleUserSubmit} className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-3 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
                                    <FiCheck size={18} /> Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ Delete Confirmation Modal ══ */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-dark-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in p-4 sm:p-6" onClick={() => setDeleteConfirm(null)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-md mx-4 border border-dark-100 dark:border-dark-800 p-8 sm:p-10 text-center relative overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-[4rem] pointer-events-none" />
                            <div className="w-20 h-20 rounded-[1.5rem] bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10 border border-rose-100 dark:border-rose-800">
                                <FiTrash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-2 relative z-10 tracking-tight">Supprimer l&apos;utilisateur ?</h2>
                            <p className="text-dark-500 font-medium mb-8 relative z-10 text-base">Cette action est irréversible. L&apos;utilisateur ne pourra plus se connecter et ses accès seront révoqués.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <button onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-extrabold py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-sm text-center">
                                    Annuler
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                    <FiTrash2 size={18} /> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RequirePermission>
    );
}
