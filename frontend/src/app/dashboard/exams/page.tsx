'use client';

import PageSkeleton from '@/components/ui/PageSkeleton';
import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { examApi, mushafApi, studentApi, groupApi, levelApi, userApi } from '@/lib/api/client';
import { ExamResponse, ExamType, ExamStatus, StudentResponse, StudentListResponse, SurahResponse, GroupResponse, LevelResponse, UserResponse, UserRole } from '@/types';
import {
    FiPlus, FiCalendar, FiAward, FiUsers, FiPlay, FiFileText, FiChevronRight,
    FiSearch, FiFilter, FiX, FiTrash2, FiSlash, FiClock, FiBookOpen,
    FiTrendingUp, FiTarget, FiActivity, FiArrowRight, FiUserCheck
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_CFG: Record<ExamType, { label: string; bg: string; text: string }> = {
    [ExamType.Hifdh]: { label: 'Hifdh', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
    [ExamType.Revision]: { label: 'Révision', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    [ExamType.Tajwid]: { label: 'Tajwid', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
    [ExamType.Reading]: { label: 'Lecture', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
};

const STATUS_CFG: Record<ExamStatus, { label: string; bg: string; text: string; dot: string }> = {
    [ExamStatus.Planned]: { label: 'Planifié', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    [ExamStatus.InProgress]: { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    [ExamStatus.Completed]: { label: 'Terminé', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    [ExamStatus.Cancelled]: { label: 'Annulé', bg: 'bg-dark-100 dark:bg-dark-700', text: 'text-dark-500', dot: 'bg-dark-400' },
};

const MOCK_EXAMS: ExamResponse[] = [
    { id: 'ex1', title: 'Hifdh — Sourate Al-Mulk', type: ExamType.Hifdh, examDate: '2026-02-20T09:00:00', studentId: '1', studentName: 'Ahmed Al-Farsi', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's67', surahName: 'Al-Mulk', startVerse: 1, endVerse: 15, finalStatus: ExamStatus.Completed, finalScore: 88, groupId: '1', groupName: 'Groupe Al-Fatiha', duration: 25, isLevelProgressionExam: false, createdAt: '2026-02-20' },
    { id: 'ex2', title: 'Révision — Juz Amma', type: ExamType.Revision, examDate: '2026-02-21T10:30:00', studentId: '2', studentName: 'Sara Mansour', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's78', surahName: 'An-Naba', startVerse: 1, endVerse: 40, finalStatus: ExamStatus.InProgress, finalScore: 0, groupId: '1', groupName: 'Groupe Al-Fatiha', isLevelProgressionExam: false, createdAt: '2026-02-21' },
    { id: 'ex3', title: 'Tajwid — Sourate Ya-Sin', type: ExamType.Tajwid, examDate: '2026-02-19T14:00:00', studentId: '3', studentName: 'Omar Khayyam', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's36', surahName: 'Ya-Sin', startVerse: 1, endVerse: 30, finalStatus: ExamStatus.Completed, finalScore: 72, groupId: '2', groupName: 'Groupe Al-Baqarah', duration: 35, isLevelProgressionExam: false, createdAt: '2026-02-19' },
    { id: 'ex4', title: 'Hifdh — Sourate Ar-Rahman', type: ExamType.Hifdh, examDate: '2026-02-18T08:30:00', studentId: '4', studentName: 'Fatima Zahra', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's55', surahName: 'Ar-Rahman', startVerse: 1, endVerse: 45, finalStatus: ExamStatus.Completed, finalScore: 95, groupId: '1', groupName: 'Groupe Al-Fatiha', duration: 40, isLevelProgressionExam: false, createdAt: '2026-02-18' },
    { id: 'ex5', title: 'Lecture — Al-Baqarah (début)', type: ExamType.Reading, examDate: '2026-02-17T11:00:00', studentId: '5', studentName: 'Youssef Kettani', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's2', surahName: 'Al-Baqarah', startVerse: 1, endVerse: 20, finalStatus: ExamStatus.Cancelled, finalScore: 0, groupId: '2', groupName: 'Groupe Al-Baqarah', isLevelProgressionExam: false, createdAt: '2026-02-17' },
    { id: 'ex6', title: 'Hifdh — Sourate Al-Kahf', type: ExamType.Hifdh, examDate: '2026-02-22T09:00:00', studentId: '1', studentName: 'Ahmed Al-Farsi', examinerId: 'u1', examinerName: 'Cheikh Ibrahim', surahId: 's18', surahName: 'Al-Kahf', startVerse: 1, endVerse: 10, finalStatus: ExamStatus.InProgress, finalScore: 0, groupId: '1', groupName: 'Groupe Al-Fatiha', isLevelProgressionExam: false, createdAt: '2026-02-22' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ExamsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const router = useRouter();

    const [exams, setExams] = useState<ExamResponse[]>([]);
    const [students, setStudents] = useState<StudentListResponse[]>([]);
    const [surahs, setSurahs] = useState<SurahResponse[]>([]);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [levels, setLevels] = useState<LevelResponse[]>([]);
    const [examiners, setExaminers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Hifdh' | 'Tajwid' | 'Revision' | 'Reading'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'InProgress' | 'Completed' | 'Cancelled' | 'Planned'>('all');

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState<{
        title: string; studentId: string; examinerId: string; surahId: string; examLevel: string; startVerse: number; endVerse: number; type: ExamType; isLevelProgressionExam: boolean; targetLevel: string;
    }>({
        title: '', studentId: '', examinerId: '', surahId: '', examLevel: '', startVerse: 1, endVerse: 1, type: ExamType.Hifdh, isLevelProgressionExam: false, targetLevel: '',
    });

    // Delete/Cancel modal
    const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'delete' | 'cancel' } | null>(null);

    useEffect(() => { loadExams(); }, []);

    const loadExams = async () => {
        try {
            const [examsRes, studentsRes, surahsRes, groupsRes, levelsRes, usersRes] = await Promise.all([
                examApi.getAll(), studentApi.getAll(), mushafApi.getSurahs(), groupApi.getAll(), levelApi.getAll(), userApi.getByRoles([UserRole.Teacher, UserRole.Admin, UserRole.SuperAdmin] as any)
            ]);
            setExams(examsRes.data);
            setStudents(studentsRes.data);
            setSurahs(surahsRes.data);
            setGroups(groupsRes.data);
            setLevels(levelsRes.data.sort((a: LevelResponse, b: LevelResponse) => a.order - b.order));
            setExaminers(usersRes.data);
        } catch {
            setExams(MOCK_EXAMS);
            setStudents([
                { id: '1', firstName: 'Ahmed', lastName: 'Al-Farsi', fullName: 'Ahmed Al-Farsi', dateOfBirth: '2012-03-15', isActive: true, enrollmentDate: '2024-09-01', groupId: '1', groupName: 'Groupe Al-Fatiha', createdAt: '2024-09-01' },
                { id: '2', firstName: 'Sara', lastName: 'Mansour', fullName: 'Sara Mansour', dateOfBirth: '2013-07-22', isActive: true, enrollmentDate: '2024-09-01', groupId: '1', groupName: 'Groupe Al-Fatiha', createdAt: '2024-09-01' },
                { id: '3', firstName: 'Omar', lastName: 'Khayyam', fullName: 'Omar Khayyam', dateOfBirth: '2011-11-03', isActive: true, enrollmentDate: '2024-09-01', groupId: '2', groupName: 'Groupe Al-Baqarah', createdAt: '2024-09-01' },
            ] as StudentResponse[]);
            setSurahs([]);
            setGroups([
                { id: '1', name: 'Groupe Al-Fatiha', maxCapacity: 20, isActive: true, studentCount: 7, createdAt: '2024-09-01' },
                { id: '2', name: 'Groupe Al-Baqarah', maxCapacity: 15, isActive: true, studentCount: 5, createdAt: '2024-09-01' },
            ] as GroupResponse[]);
            setExaminers([
                { id: '1', email: 'ahmed.b@example.com', firstName: 'Ahmed', lastName: 'Benali', fullName: 'Ahmed Benali', roles: [UserRole.Teacher], isExaminer: true, phone: '+33 6 12 34 56 78', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
                { id: '3', email: 'ibrahim.k@example.com', firstName: 'Ibrahim', lastName: 'Khalil', fullName: 'Cheikh Ibrahim', roles: [UserRole.Teacher], isExaminer: true, phone: '', isActive: true, preferredLanguage: 'fr', createdAt: new Date().toISOString() },
            ] as any);
        } finally { setLoading(false); }
    };

    // ── Computed ──────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return exams
            .filter(e => {
                if (q && !e.title.toLowerCase().includes(q) && !e.studentName.toLowerCase().includes(q) && !(e.surahName || '').toLowerCase().includes(q)) return false;
                if (typeFilter !== 'all' && e.type !== typeFilter) return false;
                if (statusFilter !== 'all' && e.finalStatus !== statusFilter) return false;
                return true;
            })
            .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
    }, [exams, searchQuery, typeFilter, statusFilter]);

    const stats = useMemo(() => {
        const completed = exams.filter(e => e.finalStatus === ExamStatus.Completed);
        return {
            total: exams.length,
            inProgress: exams.filter(e => e.finalStatus === ExamStatus.InProgress).length,
            completed: completed.length,
            avgScore: completed.length > 0 ? Math.round(completed.reduce((s, e) => s + e.finalScore, 0) / completed.length) : 0,
        };
    }, [exams]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await examApi.start({ ...formData, type: formData.type });
            toast.success('Examen planifié !');
            setShowCreateModal(false);
            loadExams();
        } catch {
            toast.error('Échec de la planification');
        }
    };

    const handleStartExam = async (examId: string) => {
        try {
            await examApi.markInProgress(examId);
            toast.success('Examen démarré');
            router.push(`/dashboard/exams/${examId}/session`);
        } catch {
            toast.error('Erreur lors du démarrage');
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        try {
            if (confirmAction.action === 'cancel') {
                await examApi.cancel(confirmAction.id);
                setExams(prev => prev.map(e => e.id === confirmAction.id ? { ...e, finalStatus: ExamStatus.Cancelled } : e));
                toast.success('Examen annulé');
            } else {
                await examApi.delete(confirmAction.id);
                setExams(prev => prev.filter(e => e.id !== confirmAction.id));
                toast.success('Examen supprimé');
            }
        } catch {
            toast.error('Échec de l\'opération');
        }
        setConfirmAction(null);
    };

    const scoreColor = (score: number) => score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-blue-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
    const scoreGrade = (score: number) => score >= 90 ? 'Excellent' : score >= 75 ? 'Bien' : score >= 55 ? 'Moyen' : 'Insuffisant';


    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-5">
            {/* ══ Header ══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{t.common.exams}</h1>
                    <p className="text-sm text-dark-400 mt-0.5">{filtered.length} évaluation{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { setFormData({ title: '', studentId: '', examinerId: '', surahId: '', examLevel: '', startVerse: 1, endVerse: 1, type: ExamType.Hifdh, isLevelProgressionExam: false, targetLevel: '' }); setShowCreateModal(true); }}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold">
                    <FiCalendar size={16} /> Planifier une évaluation
                </button>
            </div>

            {/* ══ Stats ══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: '📝', label: 'Total examens', value: stats.total, color: 'text-dark-900 dark:text-white' },
                    { icon: '⏳', label: 'En cours', value: stats.inProgress, color: 'text-blue-600' },
                    { icon: '✅', label: 'Complétés', value: stats.completed, color: 'text-emerald-600' },
                    { icon: '📊', label: 'Score moyen', value: stats.avgScore > 0 ? `${stats.avgScore}%` : '—', color: stats.avgScore >= 75 ? 'text-emerald-600' : 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-4 flex items-center gap-3">
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-dark-400 uppercase tracking-wider font-bold">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ Filters ══ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={15} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher par titre, élève, sourate…"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-dark-900 dark:text-white placeholder:text-dark-300" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm text-dark-700 dark:text-dark-200 min-w-[140px]">
                    <option value="all">Tous les types</option>
                    {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm text-dark-700 dark:text-dark-200 min-w-[140px]">
                    <option value="all">Tous les statuts</option>
                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {/* ══ Exam Cards ══ */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <FiFileText className="mx-auto text-dark-200 mb-3" size={40} />
                    <p className="text-dark-400 text-sm font-medium">Aucun examen trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map(exam => {
                        const typeCfg = TYPE_CFG[exam.type] || TYPE_CFG[ExamType.Hifdh];
                        const statusCfg = STATUS_CFG[exam.finalStatus];
                        const isCompleted = exam.finalStatus === ExamStatus.Completed;
                        const isInProgress = exam.finalStatus === ExamStatus.InProgress;
                        return (
                            <div key={exam.id} className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-5 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
                                {/* Top row: title + status */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-dark-900 dark:text-white truncate">{exam.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Link href={`/dashboard/students/${exam.studentId}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                                {exam.studentName}
                                            </Link>
                                            {exam.groupName && (
                                                <>
                                                    <span className="text-dark-200">·</span>
                                                    <Link href={`/dashboard/groups/${exam.groupId}`} className="text-xs text-dark-400 hover:text-dark-600 font-medium">
                                                        <FiUsers size={10} className="inline mr-0.5" />{exam.groupName}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.text}`}>{typeCfg.label}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.bg} ${statusCfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-2.5 text-center">
                                        <p className="text-[9px] text-dark-400 uppercase tracking-wider font-bold mb-0.5">Sourate</p>
                                        <p className="text-xs font-bold text-dark-700 dark:text-dark-200 truncate">{exam.surahName}</p>
                                    </div>
                                    <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-2.5 text-center">
                                        <p className="text-[9px] text-dark-400 uppercase tracking-wider font-bold mb-0.5">Versets</p>
                                        <p className="text-xs font-bold text-dark-700 dark:text-dark-200">{exam.startVerse}–{exam.endVerse}</p>
                                    </div>
                                    <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-2.5 text-center">
                                        <p className="text-[9px] text-dark-400 uppercase tracking-wider font-bold mb-0.5">Score</p>
                                        {isCompleted ? (
                                            <p className={`text-xs font-bold ${scoreColor(exam.finalScore)}`}>{exam.finalScore}%</p>
                                        ) : (
                                            <p className="text-xs font-bold text-dark-300">—</p>
                                        )}
                                    </div>
                                </div>

                                {/* Score bar for completed */}
                                {isCompleted && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold ${scoreColor(exam.finalScore)}`}>{scoreGrade(exam.finalScore)}</span>
                                            {exam.duration && <span className="text-[10px] text-dark-400"><FiClock size={9} className="inline mr-0.5" />{exam.duration} min</span>}
                                        </div>
                                        <div className="w-full h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${exam.finalScore >= 85 ? 'bg-emerald-500' : exam.finalScore >= 65 ? 'bg-blue-500' : exam.finalScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${exam.finalScore}%` }} />
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-dark-50 dark:border-dark-800">
                                    <div className="flex items-center gap-1.5 text-[11px] text-dark-400">
                                        <FiCalendar size={11} />
                                        {new Date(exam.examDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {exam.finalStatus === ExamStatus.Planned && (
                                            <>
                                                <button onClick={() => setConfirmAction({ id: exam.id, action: 'cancel' })}
                                                    className="p-1.5 rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Annuler">
                                                    <FiSlash size={13} />
                                                </button>
                                                <button onClick={() => handleStartExam(exam.id)}
                                                    className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/15 px-3 py-1.5 rounded-lg transition-colors">
                                                    <FiPlay size={11} /> Démarrer
                                                </button>
                                            </>
                                        )}
                                        {isInProgress && (
                                            <>
                                                <button onClick={() => setConfirmAction({ id: exam.id, action: 'cancel' })}
                                                    className="p-1.5 rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Annuler">
                                                    <FiSlash size={13} />
                                                </button>
                                                <button onClick={() => router.push(`/dashboard/exams/${exam.id}/session`)}
                                                    className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/15 px-3 py-1.5 rounded-lg transition-colors">
                                                    <FiPlay size={11} /> Reprendre
                                                </button>
                                            </>
                                        )}
                                        {isCompleted && (
                                            <button onClick={() => router.push(`/dashboard/exams/${exam.id}/report`)}
                                                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/15 px-3 py-1.5 rounded-lg transition-colors">
                                                <FiFileText size={11} /> Rapport
                                            </button>
                                        )}
                                        {exam.finalStatus === ExamStatus.Cancelled && (
                                            <button onClick={() => setConfirmAction({ id: exam.id, action: 'delete' })}
                                                className="p-1.5 rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
                                                <FiTrash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══ Create Modal ══ */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between p-5 border-b border-dark-100 dark:border-dark-800">
                            <h2 className="text-lg font-bold text-dark-900 dark:text-white flex items-center gap-2"><FiPlay size={16} className="text-primary-600" /> Nouvelle évaluation</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400"><FiX size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Titre *</label>
                                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="ex: Examen Hifdh — Sourate Al-Mulk"
                                    className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Élève *</label>
                                    <select value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white" required>
                                        <option value="">Sélectionner…</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <FiUserCheck className="text-dark-400" /> Examinateur *
                                    </label>
                                    <select value={formData.examinerId} onChange={e => setFormData({ ...formData, examinerId: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white" required>
                                        <option value="">Lui assigner un examinateur…</option>
                                        {examiners.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.roles?.[0] || 'Examinateur'})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Type *</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ExamType })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white">
                                    {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5 flex justify-between">
                                        <span>Sourate</span>
                                        {formData.examLevel && <span className="text-[10px] text-amber-500 normal-case">(Désactivé car Niveau choisi)</span>}
                                    </label>
                                    <select value={formData.surahId} onChange={e => setFormData({ ...formData, surahId: e.target.value, examLevel: e.target.value ? '' : formData.examLevel })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white disabled:opacity-50"
                                        required={!formData.examLevel} disabled={!!formData.examLevel}>
                                        <option value="">Choisir une sourate…</option>
                                        {surahs.map(s => <option key={s.id} value={s.id}>{s.number}. {s.nameEnglish} ({s.nameArabic})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5 flex justify-between">
                                        <span>Niveau de l'examen</span>
                                        {formData.surahId && <span className="text-[10px] text-amber-500 normal-case">(Désactivé car Sourate choisie)</span>}
                                    </label>
                                    <select value={formData.examLevel} onChange={e => setFormData({ ...formData, examLevel: e.target.value, surahId: e.target.value ? '' : formData.surahId })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white disabled:opacity-50"
                                        required={!formData.surahId} disabled={!!formData.surahId}>
                                        <option value="">Choisir un niveau…</option>
                                        {levels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={`grid grid-cols-2 gap-3 transition-opacity ${formData.examLevel ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Verset début</label>
                                    <input type="number" value={formData.startVerse} onChange={e => setFormData({ ...formData, startVerse: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white" min={1} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Verset fin</label>
                                    <input type="number" value={formData.endVerse} onChange={e => setFormData({ ...formData, endVerse: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-dark-900 dark:text-white" min={1} />
                                </div>
                            </div>

                            <div className="bg-dark-50 dark:bg-dark-800 p-3 rounded-xl border border-dark-100 dark:border-dark-700">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input type="checkbox" checked={formData.isLevelProgressionExam} onChange={e => setFormData({ ...formData, isLevelProgressionExam: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 rounded border-dark-300 focus:ring-primary-500" />
                                    <span className="text-sm font-bold text-dark-900 dark:text-white">Cet examen permet-il de passer à un niveau supérieur ?</span>
                                </label>

                                {formData.isLevelProgressionExam && (
                                    <div className="mt-2 pl-6">
                                        <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5">Niveau cible *</label>
                                        <select value={formData.targetLevel} onChange={e => setFormData({ ...formData, targetLevel: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm text-dark-900 dark:text-white" required={formData.isLevelProgressionExam}>
                                            <option value="">Sélectionner le niveau cible…</option>
                                            {levels.map(l => {
                                                const student = students.find(s => s.id === formData.studentId);
                                                const studentLevelIndex = student?.currentLevel ? levels.findIndex(x => x.name === student.currentLevel || x.id === student.currentLevel) : -1;
                                                const studentLevelOrder = studentLevelIndex >= 0 ? levels[studentLevelIndex].order : -1;

                                                const isValidated = l.order <= studentLevelOrder;
                                                const isNext = l.order === studentLevelOrder + 1;

                                                return (
                                                    <option key={l.id} value={l.name} className={isValidated ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : (isNext ? 'font-bold text-primary-600' : '')}>
                                                        {l.name} {isValidated ? '✓ (Validé)' : (isNext ? '(Prochain niveau)' : '')}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-dark-100 dark:border-dark-800">
                                <button type="button" onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-xl btn-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    <FiCalendar size={14} /> Planifier l'examen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ Confirm Modal (Cancel / Delete) ══ */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
                    <div className="relative bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 shadow-2xl w-full max-w-sm p-6 animate-slide-up">
                        <div className="text-center mb-5">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${confirmAction.action === 'delete' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                {confirmAction.action === 'delete' ? <FiTrash2 size={22} /> : <FiSlash size={22} />}
                            </div>
                            <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                                {confirmAction.action === 'delete' ? 'Supprimer cet examen ?' : 'Annuler cet examen ?'}
                            </h3>
                            <p className="text-sm text-dark-400 mt-1">
                                {confirmAction.action === 'delete' ? 'Cette action est irréversible.' : 'L\'examen sera marqué comme annulé.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)}
                                className="flex-1 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-bold text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                                Non, garder
                            </button>
                            <button onClick={handleConfirmAction}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors ${confirmAction.action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                {confirmAction.action === 'delete' ? 'Supprimer' : 'Annuler l\'examen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
