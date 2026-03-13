'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { userApi } from '@/lib/api/client';
import { UserResponse, UserRole } from '@/types';
import {
    FiUsers, FiSearch, FiTarget, FiActivity, FiUserPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiShield, FiPhone, FiMail, FiGrid, FiList
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import RequireRole from '@/components/auth/RequireRole';

export default function TeachersPage() {
    const { locale, viewPreferences, setViewPreference } = useUIStore();
    const { t } = useTranslation(locale);
    const searchParams = useSearchParams();
    const roleFilter = searchParams.get('role');

    const [teachers, setTeachers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const viewMode = viewPreferences.teachers || 'list';

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', role: UserRole.Teacher, isExaminer: roleFilter === 'Examiner'
    });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            const { data } = await userApi.getByRoles([UserRole.Teacher, UserRole.Examiner]);
            setTeachers(data);
        } catch {
            // Mock Data
            setTeachers([
                { id: '1', email: 'ahmed.b@example.com', firstName: 'Ahmad', lastName: 'Benali', fullName: 'Ahmad Benali', roles: [UserRole.Teacher, UserRole.Examiner], isExaminer: true, phone: '+33 6 12 34 56 78', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
                { id: '2', email: 'khadija.m@example.com', firstName: 'Khadija', lastName: 'Mansour', fullName: 'Khadija Mansour', roles: [UserRole.Teacher], isExaminer: false, phone: '+212 6 00 11 22 33', isActive: true, preferredLanguage: 'ar', createdAt: new Date().toISOString() },
                { id: '3', email: 'ibrahim.k@example.com', firstName: 'Ibrahim', lastName: 'Khalil', fullName: 'Cheikh Ibrahim', roles: [UserRole.Teacher, UserRole.Examiner], isExaminer: true, phone: '', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
                { id: '4', email: 'fatima.z@example.com', firstName: 'Fatima', lastName: 'Zahra', fullName: 'Fatima Zahra', roles: [UserRole.Teacher], isExaminer: false, phone: '+33 7 88 99 00 11', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
            ]);
            toast.error('Erreur lors du chargement, affichage des données de test');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userApi.update(editingUser.id, {
                    ...formData,
                    roles: formData.isExaminer ? [UserRole.Teacher, UserRole.Examiner] : [UserRole.Teacher],
                    isActive: true
                });
                toast.success('Enseignant mis à jour');
            } else {
                await userApi.create({
                    ...formData,
                    roles: formData.isExaminer ? [UserRole.Teacher, UserRole.Examiner] : [UserRole.Teacher]
                });
                toast.success('Enseignant ajouté avec succès');
            }
            setShowModal(false);
            loadTeachers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Une erreur est survenue');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await userApi.delete(id);
            toast.success('Enseignant supprimé');
            setDeleteConfirm(null);
            loadTeachers();
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: UserRole.Teacher, isExaminer: roleFilter === 'Examiner' });
        setShowModal(true);
    };

    const openEditModal = (user: UserResponse) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            password: '',
            role: (user.roles?.[0] as UserRole) || UserRole.Teacher,
            isExaminer: user.isExaminer || user.roles?.includes(UserRole.Examiner) || false
        });
        setShowModal(true);
    };

    const filtered = teachers.filter(t => {
        const matchesSearch = (t.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        if (roleFilter === 'Examiner') {
            return matchesSearch && (t.isExaminer || t.roles?.includes(UserRole.Examiner));
        }
        if (roleFilter === 'Teacher') {
            return matchesSearch && (t.roles?.includes(UserRole.Teacher));
        }
        return matchesSearch;
    });

    const pageTitle = roleFilter === 'Examiner' ? t.common.roles.Examiner : (roleFilter === 'Teacher' ? t.common.teachers : 'Équipe Pédagogique');

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{pageTitle}</h1>
                    <p className="text-sm text-dark-400 mt-0.5">{roleFilter === 'Examiner' ? 'Membres habilités aux examens' : 'Gérez votre équipe pédagogique'}</p>
                </div>
                <RequireRole allowedRoles={[UserRole.SuperAdmin, UserRole.Admin]}>
                    <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/25">
                        <FiUserPlus size={16} /> Ajouter {roleFilter === 'Examiner' ? 'un examinateur' : 'un enseignant'}
                    </button>
                </RequireRole>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                        <FiUsers size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{teachers.length}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-dark-400 uppercase tracking-wider truncate">Total Équipe</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <FiShield size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{teachers.filter(t => t.isExaminer || t.roles?.includes(UserRole.Examiner)).length}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-dark-400 uppercase tracking-wider truncate">Examinateurs</p>
                    </div>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex bg-white dark:bg-dark-900 rounded-2xl p-2 border border-dark-100 dark:border-dark-800 flex-1">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par nom ou email…"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border-none bg-transparent text-sm focus:ring-0 text-dark-900 dark:text-white placeholder:text-dark-300" />
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-dark-900 rounded-2xl p-1.5 border border-dark-100 dark:border-dark-800">
                    <button onClick={() => setViewPreference('teachers', 'list')} className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-dark-400 hover:text-dark-600 hover:bg-dark-50 dark:hover:bg-dark-800'}`}>
                        <FiList size={16} /> <span className="text-sm font-bold hidden sm:inline">Liste</span>
                    </button>
                    <button onClick={() => setViewPreference('teachers', 'grid')} className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-dark-400 hover:text-dark-600 hover:bg-dark-50 dark:hover:bg-dark-800'}`}>
                        <FiGrid size={16} /> <span className="text-sm font-bold hidden sm:inline">Grille</span>
                    </button>
                </div>
            </div>

            {/* View Container */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 border-dashed">
                    <div className="w-16 h-16 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-dark-300">
                        <FiUsers size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">Aucun membre trouvé</h3>
                    <p className="text-dark-400 text-sm">Modifiez vos critères de recherche ou ajoutez-en un nouveau.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(teacher => (
                        <div key={teacher.id} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-dark-200/5 dark:hover:shadow-black/20 hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
                            <div className="p-5 flex-1 flex flex-col items-center">
                                <div className="w-20 h-20 mb-4 relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500 to-emerald-400 opacity-20 group-hover:opacity-40 transition-opacity blur-md" />
                                    <div className="absolute inset-0 rounded-full bg-white dark:bg-dark-800 border-2 border-primary-100 dark:border-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold">
                                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-dark-900 dark:text-white text-center line-clamp-1">{teacher.fullName}</h3>
                                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border border-blue-100 text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                                        Enseignant
                                    </div>
                                    {(teacher.isExaminer || teacher.roles?.includes(UserRole.Examiner)) && (
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border border-purple-100 text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
                                            Examinateur
                                        </div>
                                    )}
                                </div>

                                <div className="w-full mt-5 space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-dark-500 bg-dark-50 dark:bg-dark-800/50 px-3 py-2 rounded-xl">
                                        <FiMail className="text-dark-400" size={14} />
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-dark-500 bg-dark-50 dark:bg-dark-800/50 px-3 py-2 rounded-xl">
                                        <FiPhone className="text-dark-400" size={14} />
                                        <span>{teacher.phone || 'Non renseigné'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/20 p-3 flex items-center justify-end gap-2">
                                <RequireRole allowedRoles={[UserRole.SuperAdmin, UserRole.Admin]}>
                                    <button onClick={() => openEditModal(teacher)} className="p-2 rounded-xl text-dark-400 hover:text-primary-600 hover:bg-white dark:hover:bg-dark-700 transition-colors" title="Modifier">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(teacher.id)} className="p-2 rounded-xl text-dark-400 hover:text-red-500 hover:bg-white dark:hover:bg-dark-700 transition-colors" title="Supprimer">
                                        <FiTrash2 size={16} />
                                    </button>
                                </RequireRole>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark-50/50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-800">
                                    <th className="py-4 px-6 text-xs font-bold text-dark-500 uppercase tracking-wider">Membre</th>
                                    <th className="py-4 px-6 text-xs font-bold text-dark-500 uppercase tracking-wider">Contact</th>
                                    <th className="py-4 px-6 text-xs font-bold text-dark-500 uppercase tracking-wider">Rôles</th>
                                    <th className="py-4 px-6 text-xs font-bold text-dark-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                                {filtered.map(teacher => (
                                    <tr key={teacher.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold text-sm">
                                                    {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-dark-900 dark:text-white">{teacher.fullName}</p>
                                                    <p className="text-xs text-dark-400 mt-0.5">Inscrit le {new Date(teacher.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                                                    <FiMail className="text-dark-400" size={12} /> {teacher.email}
                                                </div>
                                                {teacher.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                                                        <FiPhone className="text-dark-400" size={12} /> {teacher.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-100 text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                                                    Enseignant
                                                </div>
                                                {(teacher.isExaminer || teacher.roles?.includes(UserRole.Examiner)) && (
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-purple-100 text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400">
                                                        Examinateur
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <RequireRole allowedRoles={[UserRole.SuperAdmin, UserRole.Admin]}>
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(teacher)} className="p-2 rounded-xl text-dark-400 hover:text-primary-600 hover:bg-white dark:hover:bg-dark-700 transition-colors" title="Modifier">
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(teacher.id)} className="p-2 rounded-xl text-dark-400 hover:text-red-500 hover:bg-white dark:hover:bg-dark-700 transition-colors" title="Supprimer">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </RequireRole>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/50 dark:bg-dark-800/50">
                            <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                                {editingUser ? 'Modifier l\'enseignant' : (roleFilter === 'Examiner' ? 'Ajouter un examinateur' : 'Ajouter un enseignant')}
                            </h2>
                            <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-xl text-dark-400 hover:bg-white dark:hover:bg-dark-700 transition-colors">
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Prénom *</label>
                                    <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Nom *</label>
                                    <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Email *</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Mot de passe provisoire *</label>
                                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Compétences d'Évaluation</label>
                                <label className={`cursor-pointer border rounded-2xl p-4 flex items-center gap-3 transition-all mt-1 ${formData.isExaminer ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800'}`}>
                                    <input type="checkbox" checked={formData.isExaminer} onChange={(e) => setFormData({ ...formData, isExaminer: e.target.checked })} className="w-5 h-5 text-purple-600 rounded border-dark-300 focus:ring-purple-500 transition-all" />
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.isExaminer ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-dark-100 text-dark-400 dark:bg-dark-800'}`}>
                                        <FiShield size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${formData.isExaminer ? 'text-purple-700 dark:text-purple-400' : 'text-dark-700 dark:text-dark-200'}`}>
                                            Certifié Examinateur
                                        </p>
                                        <p className="text-[10px] text-dark-400 mt-0.5 leading-tight">Autorise ce professeur à faire passer des évaluations et des passages de niveaux.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl btn-primary text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25">
                                    <FiCheck size={16} /> Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-dark-900 w-full max-w-sm rounded-3xl shadow-xl border border-dark-100 dark:border-dark-800 p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Supprimer l'enseignant ?</h3>
                        <p className="text-sm text-dark-500 mb-6">Cette action est définitive et affectera les cours qui lui sont assignés.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-dark-50 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all">
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
