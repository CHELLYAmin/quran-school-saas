'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { roleApi } from '@/lib/api/client';
import { RoleResponse, PermissionResponse, CreateRoleRequest } from '@/types/role';
import RequirePermission from '@/components/auth/RequirePermission';
import { Permissions } from '@/hooks/usePermission';
import { FiShield, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiSettings, FiLock } from 'react-icons/fi';

export default function RolesPage() {
    const { locale } = useUIStore();
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermModal, setShowPermModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form states
    const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
    const [roleForm, setRoleForm] = useState<CreateRoleRequest>({ name: '', description: '' });

    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<RoleResponse | null>(null);
    const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                roleApi.getAll(),
                roleApi.getAllPermissions()
            ]);
            setRoles(rolesRes.data);
            setAllPermissions(permsRes.data);
        } catch (e) {
            console.error('Failed to load roles/permissions', e);
        } finally {
            setLoading(false);
        }
    };

    // Group permissions by Module for the UI
    const permissionsByModule = useMemo(() => {
        const groups: Record<string, PermissionResponse[]> = {};
        allPermissions.forEach(p => {
            const mod = p.module || 'Autre';
            if (!groups[mod]) groups[mod] = [];
            groups[mod].push(p);
        });
        return groups;
    }, [allPermissions]);

    // Role Methods
    const openCreateRole = () => {
        setEditingRole(null);
        setRoleForm({ name: '', description: '' });
        setShowRoleModal(true);
    };

    const openEditRole = (role: RoleResponse) => {
        if (role.isSystemRole) return; // Prevent editing system roles names
        setEditingRole(role);
        setRoleForm({ name: role.name, description: role.description || '' });
        setShowRoleModal(true);
    };

    const handleRoleSubmit = async () => {
        if (!roleForm.name.trim()) return;
        try {
            if (editingRole) {
                await roleApi.update(editingRole.id, roleForm);
            } else {
                await roleApi.create(roleForm);
            }
            loadData();
            setShowRoleModal(false);
        } catch (e) { console.error('Role save failed', e); }
    };

    const handleDeleteRole = async (id: string) => {
        try {
            await roleApi.delete(id);
            loadData();
        } catch (e) { console.error('Delete failed', e); }
        setDeleteConfirm(null);
    };

    // Permission Methods
    const openAssignPermissions = (role: RoleResponse) => {
        setSelectedRoleForPerms(role);
        setSelectedPermIds(new Set(role.permissions?.map(p => p.id) || []));
        setShowPermModal(true);
    };

    const togglePermission = (permId: string) => {
        const newSet = new Set(selectedPermIds);
        if (newSet.has(permId)) newSet.delete(permId);
        else newSet.add(permId);
        setSelectedPermIds(newSet);
    };

    const handleAssignPermissions = async () => {
        if (!selectedRoleForPerms) return;
        try {
            await roleApi.assignPermissions(selectedRoleForPerms.id, {
                permissionIds: Array.from(selectedPermIds)
            });
            loadData();
            setShowPermModal(false);
        } catch (e) { console.error('Assign perms failed', e); }
    };


    if (loading) return <PageSkeleton variant="table" />;

    return (
        <RequirePermission requiredPermission={Permissions.RolesManage} fallback={
            <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800">
                <FiShield size={48} className="mx-auto text-dark-200 mb-4" />
                <h2 className="text-xl font-bold mb-2">Accès restreint</h2>
                <p className="text-dark-500">Vous n'avez pas la permission de gérer les Rôles et Permissions.</p>
            </div>
        }>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Gestion des Rôles</h1>
                        <p className="text-dark-500 mt-2 font-medium">{roles.length} rôle(s) avec {allPermissions.length} permission(s) configurables</p>
                    </div>
                    <button onClick={openCreateRole} className="relative z-10 bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-extrabold shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest">
                        <FiPlus size={18} /> Nouveau Rôle
                    </button>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white dark:bg-dark-900 rounded-[2rem] border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                            {role.isSystemRole && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-400 to-accent-600" />}

                            <div className="p-6 relative">
                                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${role.isSystemRole ? 'bg-accent-500' : 'bg-primary-500'}`} />
                                <div className="flex items-start justify-between relative z-10 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-sm ${role.isSystemRole ? 'gradient-accent' : 'gradient-primary'}`}>
                                        {role.isSystemRole ? <FiLock size={24} /> : <FiShield size={24} />}
                                    </div>
                                    {role.isSystemRole && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent-50 text-accent-700 border border-accent-100 dark:bg-accent-900/30 dark:text-accent-400 dark:border-accent-800/50 uppercase tracking-widest">
                                            Système
                                        </span>
                                    )}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-extrabold text-2xl text-dark-900 dark:text-white">{role.name}</h3>
                                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mt-1">{(role.permissions?.length || 0)} permissions actives</p>
                                </div>
                            </div>

                            <div className="px-6 pb-6 flex-1 text-sm text-dark-500 dark:text-dark-400 font-medium leading-relaxed">
                                {role.description ? <p>{role.description}</p> : <p className="italic opacity-60">Aucune description disponible pour ce rôle.</p>}
                            </div>

                            <div className="p-4 bg-dark-50/50 dark:bg-dark-950/50 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                <button onClick={() => openAssignPermissions(role)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                                    <FiSettings size={14} /> Configurer droits
                                </button>

                                {!role.isSystemRole && (
                                    <div className="flex gap-1.5">
                                        <button onClick={() => openEditRole(role)} className="w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-dark-800 border border-transparent hover:border-dark-200 dark:hover:border-dark-700 shadow-sm text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 flex items-center justify-center transition-all">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(role.id)} className="w-9 h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-dark-400 hover:text-rose-500 flex items-center justify-center transition-all">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Role Creation/Edition Modal */}
                {showRoleModal && (
                    <div className="fixed inset-0 bg-dark-900/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRoleModal(false)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2rem] shadow-2xl w-full max-w-md mx-4 border border-dark-100 dark:border-dark-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/50 dark:bg-dark-950/50">
                                <div>
                                    <h2 className="text-xl font-extrabold text-dark-900 dark:text-white">{editingRole ? 'Modifier le Rôle' : 'Créer un Rôle'}</h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-dark-500 mt-1">{editingRole ? "Modifiez les informations" : "Définissez un nouveau rôle"}</p>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 flex items-center justify-center text-dark-500 hover:text-dark-900 dark:hover:text-white transition-colors shadow-sm"><FiX size={18} /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 pl-1">Nom du rôle *</label>
                                    <input type="text" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="Ex: Assistant" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-4 py-3 outline-none font-medium transition-all text-dark-900 dark:text-white text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-dark-500 pl-1">Description</label>
                                    <textarea value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Détail du rôle..." className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-4 py-3 outline-none font-medium transition-all text-dark-900 dark:text-white text-sm h-28 resize-none" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-dark-100 dark:border-dark-800 flex items-center justify-end gap-3 bg-dark-50/50 dark:bg-dark-950/50">
                                <button onClick={() => setShowRoleModal(false)} className="px-6 py-3 rounded-xl font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-sm">Annuler</button>
                                <button onClick={handleRoleSubmit} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-primary-500/20 transition-transform hover:-translate-y-0.5">
                                    <FiCheck size={16} /> {editingRole ? 'Enregistrer' : 'Créer le rôle'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Permissions Modal */}
                {showPermModal && selectedRoleForPerms && (
                    <div className="fixed inset-0 bg-dark-900/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowPermModal(false)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2rem] shadow-2xl w-full max-w-5xl mx-4 border border-dark-100 dark:border-dark-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/50 dark:bg-dark-950/50">
                                <div>
                                    <h2 className="text-xl font-extrabold text-dark-900 dark:text-white">Permissions : <span className="text-primary-600 dark:text-primary-400">{selectedRoleForPerms.name}</span></h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-dark-500 mt-1">Gérez les accès de ce rôle dans le système</p>
                                </div>
                                <button onClick={() => setShowPermModal(false)} className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 flex items-center justify-center text-dark-500 hover:text-dark-900 dark:hover:text-white transition-colors shadow-sm"><FiX size={18} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-dark-50/30 dark:bg-dark-950/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(permissionsByModule).map(([module, perms]) => (
                                        <div key={module} className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                            <div className="bg-dark-50/80 dark:bg-dark-950/80 px-5 py-4 border-b border-dark-100 dark:border-dark-800">
                                                <h3 className="font-extrabold text-sm text-dark-800 dark:text-dark-200 uppercase tracking-widest">{module}</h3>
                                            </div>
                                            <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
                                                {perms.map(p => (
                                                    <label key={p.id} className={`flex items-start gap-4 p-5 cursor-pointer transition-colors ${selectedPermIds.has(p.id) ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'hover:bg-dark-50/50 dark:hover:bg-dark-800/30'}`}>
                                                        <div className="mt-0.5">
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${selectedPermIds.has(p.id) ? 'bg-primary-500 border-primary-500 text-white' : 'border-dark-300 dark:border-dark-600'}`}>
                                                                {selectedPermIds.has(p.id) && <FiCheck size={12} strokeWidth={4} />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={selectedPermIds.has(p.id)}
                                                                onChange={() => togglePermission(p.id)}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-extrabold leading-tight ${selectedPermIds.has(p.id) ? 'text-primary-700 dark:text-primary-400' : 'text-dark-900 dark:text-white'}`}>{p.name}</p>
                                                            {p.description && <p className="text-xs font-medium text-dark-500 mt-1">{p.description}</p>}
                                                            <p className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-dark-100 dark:bg-dark-800 text-dark-500 uppercase">{p.code}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/50 dark:bg-dark-950/50">
                                <p className="text-sm font-medium text-dark-500">
                                    <span className="text-primary-600 dark:text-primary-400 font-extrabold text-lg mr-1">{selectedPermIds.size}</span>
                                    droits accordés
                                </p>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowPermModal(false)} className="px-6 py-3 rounded-xl font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-sm">Annuler</button>
                                    <button onClick={handleAssignPermissions} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-primary-500/20 transition-transform hover:-translate-y-0.5">
                                        <FiCheck size={16} /> Enregistrer les droits
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-dark-900/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirm(null)}>
                        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm mx-4 p-8 border border-dark-100 dark:border-dark-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiTrash2 size={28} className="text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-2">Supprimer ce rôle ?</h3>
                                <p className="text-sm font-medium text-dark-500 mb-8 leading-relaxed">Les utilisateurs assignés à ce rôle perdront ces accès immédiatement. Cette action est irréversible.</p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => handleDeleteRole(deleteConfirm)} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl text-sm font-extrabold shadow-lg shadow-rose-500/20 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                        <FiTrash2 size={16} /> Oui, supprimer
                                    </button>
                                    <button onClick={() => setDeleteConfirm(null)} className="w-full bg-dark-50 dark:bg-dark-900 border-2 border-transparent hover:border-dark-100 dark:hover:border-dark-800 text-dark-600 dark:text-dark-300 py-3 rounded-2xl text-sm font-bold transition-colors">
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RequirePermission>
    );
}
