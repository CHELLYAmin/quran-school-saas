'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { ProgressStatus, UserRole } from '@/types';
import { FiBookOpen, FiStar, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { progressApi, studentApi, mushafApi } from '@/lib/api/client';
import toast from 'react-hot-toast';

const statusConfig: Record<ProgressStatus, { color: string; label: string }> = {
    [ProgressStatus.NotStarted]: { color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600', label: 'Non commencé' },
    [ProgressStatus.InProgress]: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', label: 'En cours' },
    [ProgressStatus.NeedsRevision]: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', label: 'À réviser' },
    [ProgressStatus.Memorized]: { color: 'bg-green-100 dark:bg-green-900/30 text-green-600', label: 'Mémorisé' },
    [ProgressStatus.Mastered]: { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', label: 'Maîtrisé' },
};

export default function ProgressPage() {
    const { user } = useAuthStore();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [filter, setFilter] = useState<string>('all');
    const [progressList, setProgressList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [surahs, setSurahs] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        studentId: '', surahNumber: 1, startVerse: 1, endVerse: '', status: ProgressStatus.InProgress, qualityScore: 5, teacherNotes: ''
    });

    const isTeacher = user?.roles?.some(r => r === UserRole.Teacher || r === UserRole.Admin || r === UserRole.Examiner);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            if (isTeacher) {
                const [progRes, stuRes, surRes] = await Promise.all([
                    progressApi.getAll(),
                    studentApi.getAll(),
                    mushafApi.getSurahs()
                ]);
                setProgressList(progRes.data);
                setStudents(stuRes.data);
                setSurahs(surRes.data);
            } else {
                const studentId = user?.userId;
                if (!studentId) return;

                const [progRes, surRes] = await Promise.all([
                    progressApi.getByStudent(studentId),
                    mushafApi.getSurahs()
                ]);
                setProgressList(progRes.data);
                setSurahs(surRes.data);
            }
        } catch (error: any) {
            console.error(error);
            const status = error.status || 'Inconnu';
            toast.error(`Erreur de chargement (Code ${status}).`);
            
            // Fallback mock data if total failure
            if (progressList.length === 0) {
                setProgressList([
                    { id: '1', studentName: user?.fullName || 'Utilisateur', surahName: 'Al-Fatiha', surahNumber: 1, juzNumber: 1, status: ProgressStatus.Memorized, qualityScore: 9, teacherNotes: 'Excellent', recordDate: '2025-01-10' },
                    { id: '2', studentName: user?.fullName || 'Utilisateur', surahName: 'An-Nas', surahNumber: 114, juzNumber: 30, status: ProgressStatus.Memorized, qualityScore: 8, teacherNotes: 'Bon tajwid', recordDate: '2025-01-12' },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const surah = surahs.find(s => s.number === Number(formData.surahNumber));
            const payload = {
                ...formData,
                surahName: surah?.name,
                juzNumber: surah?.juzs?.[0] || 1,
                surahNumber: Number(formData.surahNumber),
                startVerse: Number(formData.startVerse) || null,
                endVerse: Number(formData.endVerse) || null,
                qualityScore: Number(formData.qualityScore)
            };

            if (editingItem) {
                await progressApi.update(editingItem.id, payload);
                toast.success('Progression mise à jour');
            } else {
                await progressApi.create(payload);
                toast.success('Progression enregistrée');
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cet enregistrement ?')) return;
        try {
            await progressApi.delete(id);
            toast.success('Enregistrement supprimé');
            loadData();
        } catch (error) {
            toast.error('Erreur de suppression');
        }
    };

    const filtered = filter === 'all' ? progressList : progressList.filter(p => p.status.toString() === filter.toString());

    const summary = useMemo(() => {
        const list = progressList;
        if (!list.length) return { memorized: 0, inProgress: 0, needsRevision: 0, avgQuality: 0 };
        return {
            memorized: list.filter(p => p.status === ProgressStatus.Memorized || p.status === ProgressStatus.Mastered).length,
            inProgress: list.filter(p => p.status === ProgressStatus.InProgress).length,
            needsRevision: list.filter(p => p.status === ProgressStatus.NeedsRevision).length,
            avgQuality: Math.round(list.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / list.length * 10) / 10,
        };
    }, [progressList]);


    if (loading) return <PageSkeleton variant="dashboard" />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t.common.progress}</h1>
                    <p className="text-dark-400 mt-1">Suivi pédagogique — Sourate / Juz / Hizb</p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => { setEditingItem(null); setFormData({ studentId: '', surahNumber: 1, startVerse: 1, endVerse: '', status: ProgressStatus.InProgress, qualityScore: 5, teacherNotes: '' }); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/25">
                        <FiPlus size={16} /> Ajouter progression
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <FiBookOpen className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-green-600">{summary.memorized}</p>
                    <p className="text-xs text-dark-400">{t.progress.memorized}</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <FiTrendingUp className="mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-blue-600">{summary.inProgress}</p>
                    <p className="text-xs text-dark-400">{t.progress.inProgress}</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <FiBookOpen className="mx-auto text-amber-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-amber-600">{summary.needsRevision}</p>
                    <p className="text-xs text-dark-400">À réviser</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <FiStar className="mx-auto text-purple-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-purple-600">{summary.avgQuality}/10</p>
                    <p className="text-xs text-dark-400">{t.progress.qualityScore}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'Tous' },
                    { key: ProgressStatus.Memorized, label: 'Mémorisé' },
                    { key: ProgressStatus.InProgress, label: 'En cours' },
                    { key: ProgressStatus.NeedsRevision, label: 'À réviser' },
                    { key: ProgressStatus.Mastered, label: 'Maîtrisé' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Progress List */}
            <div className="space-y-3">
                {filtered.map((item) => (
                    <div key={item.id} className="glass-card p-5 hover:shadow-lg transition-all duration-200 animate-slide-up">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg font-arabic">
                                    {item.surahNumber}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{item.surahName}</h3>
                                    <p className="text-sm text-dark-400">{item.studentName} • {t.progress.juz} {item.juzNumber}</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-4 sm:mt-0 w-full sm:w-auto gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className={`w-2 h-5 rounded-full ${i < (item.qualityScore || 0) ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-700'}`} />
                                        ))}
                                        <span className="ml-2 text-sm font-medium">{item.qualityScore}/10</span>
                                    </div>
                                    <span className={`badge ${statusConfig[item.status as ProgressStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
                                        {statusConfig[item.status as ProgressStatus]?.label || 'Inconnu'}
                                    </span>
                                </div>
                                {isTeacher && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingItem(item); setFormData({ studentId: item.studentId, surahNumber: item.surahNumber || 1, startVerse: item.startVerse || 1, endVerse: item.endVerse || '', status: item.status as any, qualityScore: item.qualityScore || 5, teacherNotes: item.teacherNotes || '' }); setShowModal(true); }} className="p-2 text-dark-400 hover:text-primary-600 transition-colors bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-dark-100 dark:border-dark-700">
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-dark-400 hover:text-red-500 transition-colors bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-dark-100 dark:border-dark-700">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.teacherNotes && (
                            <p className="mt-3 text-sm text-dark-500 bg-white dark:bg-dark-800 p-3 rounded-lg border border-dark-100 dark:border-dark-700">💬 {item.teacherNotes}</p>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 border-dashed text-dark-400">
                    Aucun résultat pour ce filtre.
                </div>
            )}

            {/* Create/Edit Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-dark-900 w-full max-w-lg rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-800 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                                    {editingItem ? 'Modifier progression' : 'Ajouter progression'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 bg-dark-50 dark:bg-dark-800 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition">
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="p-5 overflow-y-auto">
                                <form id="progressForm" onSubmit={handleSubmit} className="space-y-4">
                                    {!editingItem && (
                                        <div>
                                            <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Élève *</label>
                                            <select required className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}>
                                                <option value="">Sélectionner...</option>
                                                {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Sourate</label>
                                            <select className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.surahNumber} onChange={e => setFormData({ ...formData, surahNumber: Number(e.target.value) })}>
                                                {surahs.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Statut *</label>
                                            <select className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ProgressStatus })}>
                                                <option value={ProgressStatus.NotStarted}>Non commencé</option>
                                                <option value={ProgressStatus.InProgress}>En cours</option>
                                                <option value={ProgressStatus.NeedsRevision}>À réviser</option>
                                                <option value={ProgressStatus.Memorized}>Mémorisé</option>
                                                <option value={ProgressStatus.Mastered}>Maîtrisé</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Verset début</label>
                                            <input type="number" min="1" className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.startVerse} onChange={e => setFormData({ ...formData, startVerse: Math.max(1, parseInt(e.target.value)) })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Verset fin (Opt)</label>
                                            <input type="number" min="1" placeholder="Ex: 5" className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.endVerse} onChange={e => setFormData({ ...formData, endVerse: e.target.value })} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center justify-between text-xs font-bold text-dark-500 uppercase mb-1">
                                            <span>Qualité Récitation</span>
                                            <span className="text-primary-600 dark:text-primary-400">{formData.qualityScore} / 10</span>
                                        </label>
                                        <input type="range" min="0" max="10" step="1"
                                            value={formData.qualityScore} onChange={(e) => setFormData({ ...formData, qualityScore: Number(e.target.value) })}
                                            className="w-full accent-primary-500 h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-dark-500 uppercase mb-1">Remarques Prof.</label>
                                        <textarea rows={3} placeholder="Mots accrochés, fluidité..." className="w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800" value={formData.teacherNotes} onChange={e => setFormData({ ...formData, teacherNotes: e.target.value })} />
                                    </div>
                                </form>
                            </div>
                            <div className="p-5 border-t border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/50 flex justify-end gap-3 mt-auto">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:bg-dark-50">Annuler</button>
                                <button form="progressForm" type="submit" className="px-5 py-2.5 rounded-xl font-bold btn-primary flex items-center gap-2"><FiCheck size={16} /> Enregistrer</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
