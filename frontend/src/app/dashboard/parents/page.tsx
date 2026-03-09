'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { parentApi } from '@/lib/api/client';
import { ParentResponse, CreateParentRequest, UpdateParentRequest } from '@/types/parent';
import RequirePermission from '@/components/auth/RequirePermission';
import { Permissions } from '@/hooks/usePermission';
import { FiSearch, FiEdit2, FiTrash2, FiUsers, FiX, FiCheck, FiUserPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ParentsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    // Fallbacks if transations are missing
    const tParents = (t.common as any).parents || 'Parents';

    const [parents, setParents] = useState<ParentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingParent, setEditingParent] = useState<ParentResponse | null>(null);
    const [form, setForm] = useState<CreateParentRequest>({
        firstName: '', lastName: '', email: '', phone: '', address: '', profession: '', createAccount: false
    });

    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => { loadParents(); }, []);

    const loadParents = async () => {
        try {
            const { data } = await parentApi.getAll();
            setParents(data);
        } catch (e) {
            console.error('Failed to load parents', e);
            // Mock if backend offline
            setParents([
                { id: '1', firstName: 'Ahmed', lastName: 'Benali', fullName: 'Ahmed Benali', email: 'ahmed@test.com', phone: '0612345678', hasUserAccount: true, linkedStudentsCount: 2, createdAt: '2024-01-01' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return parents.filter(p => {
            const q = search.toLowerCase();
            return !q || p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone?.includes(q);
        });
    }, [parents, search]);

    const openCreateModal = () => {
        setEditingParent(null);
        setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', profession: '', createAccount: true });
        setShowModal(true);
    };

    const openEditModal = (p: ParentResponse) => {
        setEditingParent(p);
        setForm({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            phone: p.phone || '',
            address: p.address || '',
            profession: p.profession || '',
            createAccount: false // not used in update
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
        try {
            if (editingParent) {
                const updatePayload: UpdateParentRequest = { ...form };
                await parentApi.update(editingParent.id, updatePayload);
            } else {
                await parentApi.create(form);
            }
            loadParents();
            setShowModal(false);
        } catch (e) {
            console.error('Submit failed', e);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await parentApi.delete(id);
            loadParents();
        } catch (e) {
            console.error('Delete failed', e);
        }
        setDeleteConfirm(null);
    };


    if (loading) return <PageSkeleton variant="table" />;

    return (
        <RequirePermission anyOf={[Permissions.UsersManage, Permissions.UsersView]} fallback={
            <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800">
                <FiUsers size={48} className="mx-auto text-dark-200 mb-4" />
                <h2 className="text-xl font-bold mb-2">Accès restreint</h2>
                <p className="text-dark-500">Vous n'avez pas la permission de gérer les parents.</p>
            </div>
        }>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Gestion des Parents</h1>
                        <p className="text-dark-400 mt-1 text-sm">{filtered.length} parent(s) inscrit(s)</p>
                    </div>
                    <RequirePermission requiredPermission={Permissions.UsersManage}>
                        <button onClick={openCreateModal} className="btn btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/20">
                            <FiUserPlus size={15} /> Nouveau Parent
                        </button>
                    </RequirePermission>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, email, tél..."
                        className="input pl-10 w-full text-sm py-2.5" />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-500 text-[10px] uppercase tracking-wider font-bold">
                                    <th className="px-4 py-3 text-left">Parent</th>
                                    <th className="px-3 py-3 text-left">Contact</th>
                                    <th className="px-3 py-3 text-center">Enfants liés</th>
                                    <th className="px-3 py-3 text-center">Compte Utilisateur</th>
                                    <RequirePermission requiredPermission={Permissions.UsersManage}>
                                        <th className="px-3 py-3 text-right">Actions</th>
                                    </RequirePermission>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
                                {filtered.map(parent => (
                                    <tr key={parent.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                        <td className="px-4 py-3 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {parent.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-dark-900 dark:text-white">{parent.fullName}</p>
                                                    {parent.profession && <p className="text-[10px] text-dark-400">{parent.profession}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-sm">{parent.email}</p>
                                            <p className="text-xs text-dark-400">{parent.phone || 'Non renseigné'}</p>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-dark-50 dark:bg-dark-800 rounded-full font-bold text-xs">
                                                {parent.linkedStudentsCount}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {parent.hasUserAccount ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activé</span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-100 text-dark-500">Aucun</span>
                                            )}
                                        </td>
                                        <RequirePermission requiredPermission={Permissions.UsersManage}>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEditModal(parent)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-dark-600 transition-colors">
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(parent.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-500 transition-colors">
                                                        <FiTrash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </RequirePermission>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-12 text-dark-400 text-sm">Aucun parent trouvé</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-dark-100 dark:border-dark-800 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold">{editingParent ? 'Modifier le parent' : 'Nouveau parent'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"><FiX size={16} /></button>
                            </div>

                            <div className="p-5 overflow-y-auto flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label text-xs mb-1">Prénom *</label>
                                        <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input w-full text-sm" />
                                    </div>
                                    <div>
                                        <label className="label text-xs mb-1">Nom *</label>
                                        <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input w-full text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-xs mb-1">Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input w-full text-sm" />
                                </div>

                                <div>
                                    <label className="label text-xs mb-1">Téléphone</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ex: 06..." className="input w-full text-sm" />
                                </div>

                                <div>
                                    <label className="label text-xs mb-1">Adresse</label>
                                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input w-full text-sm" />
                                </div>

                                <div>
                                    <label className="label text-xs mb-1">Profession</label>
                                    <input type="text" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} className="input w-full text-sm" />
                                </div>

                                {!editingParent && (
                                    <div className="flex items-center justify-between py-2 border-t border-dark-100 dark:border-dark-800 mt-4 pt-4">
                                        <div>
                                            <span className="text-sm font-medium block">Créer un profil Utilisateur</span>
                                            <span className="text-xs text-dark-400">Permet au parent de se connecter</span>
                                        </div>
                                        <button onClick={() => setForm({ ...form, createAccount: !form.createAccount })}
                                            className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.createAccount ? 'bg-green-500' : 'bg-dark-300'}`}>
                                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.createAccount ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 border-t border-dark-100 dark:border-dark-800 flex items-center justify-end gap-3 flex-shrink-0">
                                <button onClick={() => setShowModal(false)} className="btn btn-ghost px-5 py-2.5 rounded-xl text-sm">Annuler</button>
                                <button onClick={handleSubmit} className="btn btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary-500/20">
                                    <FiCheck size={14} /> {editingParent ? 'Enregistrer' : 'Créer le parent'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-dark-100 dark:border-dark-800">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 size={22} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Supprimer ce parent ?</h3>
                                <p className="text-sm text-dark-500 mb-5">Attention, tous les enfants associés perdront leur lien parental.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn btn-ghost py-2.5 rounded-xl text-sm">Annuler</button>
                                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">Supprimer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RequirePermission>
    );
}
