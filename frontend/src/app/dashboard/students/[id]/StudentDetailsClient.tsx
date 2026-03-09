'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { studentApi, groupApi } from '@/lib/api/client';
import { StudentResponse, GroupResponse, ExamResponse, SessionResponse, HomeworkAssignmentResponse } from '@/types';
import {
    FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiMail, FiPhone,
    FiCalendar, FiHash, FiTarget, FiActivity,
    FiBookOpen, FiPlus, FiChevronRight, FiCheckCircle, FiClock as FiClockIcon,
    FiXCircle, FiAlertCircle
} from 'react-icons/fi';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA (if API fails)
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_STUDENT: StudentResponse = {
    id: 's1', firstName: 'Ahmed', lastName: 'Al-Farsi', fullName: 'Ahmed Al-Farsi', email: 'ahmed@example.com',
    phoneNumber: '+33 6 12 34 56 78', dateOfBirth: '2012-05-15', gender: 'Male',
    groupId: 'g1', groupName: 'Groupe Al-Fatiha', enrollmentDate: '2024-09-01',
    level: 'Débutant', isActive: true, notes: 'Élève très motivé, progresse rapidement.',
    createdAt: '2024-09-01T10:00:00Z'
};

const MOCK_EXAMS: ExamResponse[] = [
    {
        id: 'ex1', title: 'Hifdh — Sourate Al-Mulk', type: 'Hifdh' as any, examDate: '2026-02-10',
        finalScore: 88, surahName: 'Al-Mulk', studentId: 's1', studentName: 'Ahmed Al-Farsi',
        examinerId: 'u1', examinerName: 'Cheikh Ibrahim', finalStatus: 'Completed' as any,
        isLevelProgressionExam: false, createdAt: '2026-02-10T10:00:00Z'
    } as any,
    {
        id: 'ex2', title: 'Révision — Juz Amma', type: 'Revision' as any, examDate: '2026-01-20',
        finalScore: 92, surahName: 'Juz Amma', studentId: 's1', studentName: 'Ahmed Al-Farsi',
        examinerId: 'u1', examinerName: 'Cheikh Ibrahim', finalStatus: 'Completed' as any,
        isLevelProgressionExam: false, createdAt: '2026-01-20T10:00:00Z'
    } as any,
];

const MOCK_SESSIONS: SessionResponse[] = [
    { id: 'ses1', date: '2026-02-15T14:00', durationMinutes: 60, status: 'Completed', groupName: 'Groupe Al-Fatiha', startTime: '2026-02-15T14:00', endTime: '2026-02-15T15:00', groupId: 'g1', teacherId: 't1', teacherName: 'Oustadh Ahmad', isOnline: false },
    { id: 'ses2', date: '2026-02-12T14:00', durationMinutes: 60, status: 'Completed', groupName: 'Groupe Al-Fatiha', startTime: '2026-02-12T14:00', endTime: '2026-02-12T15:00', groupId: 'g1', teacherId: 't1', teacherName: 'Oustadh Ahmad', isOnline: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentDetailsClient() {
    const { id } = useParams();
    const router = useRouter();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [student, setStudent] = useState<StudentResponse | null>(null);
    const [exams, setExams] = useState<ExamResponse[]>([]);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [homeworks, setHomeworks] = useState<HomeworkAssignmentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'homework' | 'exams'>('overview');

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [studentRes] = await Promise.all([
                studentApi.getById(id as string)
            ]);
            setStudent(studentRes.data);
            // Fetch related data
            setExams(MOCK_EXAMS);
            setSessions(MOCK_SESSIONS);
        } catch {
            setStudent(MOCK_STUDENT);
            setExams(MOCK_EXAMS);
            setSessions(MOCK_SESSIONS);
        } finally { setLoading(false); }
    };

    if (!student) return <div className="text-center py-12 text-dark-400">Élève non trouvé.</div>;

    if (loading) return <PageSkeleton variant="detail" />;

    return (
        <div className="space-y-5">
            {/* ══ Header ══ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/dashboard/students" className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-primary-600 font-medium">
                    <FiArrowLeft size={14} /> Retour à la liste
                </Link>
                <div className="flex items-center gap-2">
                    <button className="btn btn-outline px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                        <FiEdit2 size={13} /> Modifier
                    </button>
                    <button className="p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-red-500 hover:bg-red-50 transition-colors">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            {/* ══ Student Hero ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{student.firstName} {student.lastName}</h1>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.isActive ? 'bg-green-100 text-green-700' : 'bg-dark-100 text-dark-500'}`}>
                                {student.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dark-500">
                            {student.groupName && <span className="flex items-center gap-1.5"><FiBookOpen size={13} className="text-primary-600" />{student.groupName}</span>}
                            {student.level && <span className="flex items-center gap-1.5"><FiTarget size={13} className="text-purple-600" />{student.level}</span>}
                            {student.email && <span className="flex items-center gap-1.5"><FiMail size={13} />{student.email}</span>}
                            {student.phoneNumber && <span className="flex items-center gap-1.5"><FiPhone size={13} />{student.phoneNumber}</span>}
                        </div>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/20 text-center min-w-[120px]">
                        <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold mb-1">Score Moyen</p>
                        <p className="text-2xl font-black text-primary-600">85%</p>
                    </div>
                </div>
            </div>

            {/* ══ Tabs ══ */}
            <div className="flex gap-1 bg-white dark:bg-dark-900 p-1 rounded-xl border border-dark-100 dark:border-dark-800">
                {[
                    { id: 'overview', label: 'Vue d\'ensemble', icon: <FiActivity size={14} /> },
                    { id: 'sessions', label: 'Historique des cours', icon: <FiClockIcon size={14} /> },
                    { id: 'homework', label: 'Devoirs', icon: <FiBookOpen size={14} /> },
                    { id: 'exams', label: 'Examens', icon: <FiTarget size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-800'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ══ Tab Content ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {activeTab === 'overview' && (
                    <>
                        <div className="lg:col-span-2 space-y-5">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Assiduité', value: '95%', icon: <FiCheckCircle className="text-emerald-500" />, sub: 'Excellent' },
                                    { label: 'Vitesse', value: '2 p/sem', icon: <FiActivity className="text-blue-500" />, sub: 'Stable' },
                                    { label: 'Dernier Cours', value: '15 Fév', icon: <FiCalendar className="text-amber-500" />, sub: 'Hifdh' },
                                    { label: 'Points', value: '1,250', icon: <FiTarget className="text-purple-500" />, sub: 'Bronze' },
                                ].map(s => (
                                    <div key={s.label} className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            {s.icon} <span className="text-[10px] uppercase font-bold text-dark-400">{s.label}</span>
                                        </div>
                                        <p className="text-xl font-bold dark:text-white">{s.value}</p>
                                        <p className="text-[10px] text-dark-400">{s.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bio / Info */}
                            <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-2xl p-5">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-dark-900 dark:text-white"><FiUser className="text-primary-600" /> Informations complémentaires</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mb-0.5">Date de naissance</p>
                                        <p className="text-sm dark:text-white">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mb-0.5">Inscription</p>
                                        <p className="text-sm dark:text-white">{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('fr-FR') : '-'}</p>
                                    </div>
                                    <div className="col-span-2 pt-2">
                                        <p className="text-[10px] text-dark-400 uppercase font-bold tracking-wider mb-1">Notes</p>
                                        <p className="text-sm dark:text-dark-300 italic bg-dark-50 dark:bg-dark-800 p-3 rounded-xl border border-dark-100 dark:border-dark-700">
                                            {student.notes || "Aucune note particulière."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Sidebar */}
                        <div className="space-y-5">
                            <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold mb-4 flex items-center justify-between text-dark-900 dark:text-white">
                                    Activités récentes
                                    <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Derniers 30 jours</span>
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { type: 'Exam', title: 'Examen réussi Al-Mulk', date: 'il y a 2 jours', score: '88%' },
                                        { type: 'Session', title: 'Cours d\'Hifdh', date: 'il y a 5 jours', score: 'Présent' },
                                        { type: 'Homework', title: 'Devoir rendu Tajwid', date: 'il y a 1 sem', score: 'Note: 18' },
                                    ].map((act, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold dark:text-white">{act.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-dark-400">
                                                    <span>{act.date}</span>
                                                    <span>•</span>
                                                    <span className="text-primary-600 font-bold">{act.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 text-[10px] font-bold text-dark-400 hover:text-primary-600 border-t border-dark-50 dark:border-dark-800 transition-colors">
                                    VOIR TOUT L&apos;HISTORIQUE
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'exams' && (
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center">
                                <h3 className="font-bold text-dark-900 dark:text-white">Examens passés</h3>
                                <button className="btn btn-primary px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5"><FiPlus size={12} /> Planifier</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-dark-50 dark:bg-dark-800/50 text-[10px] uppercase tracking-widest text-dark-400 font-bold text-left">
                                            <th className="px-6 py-3">Titre / Surah</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3 text-center">Score</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
                                        {exams.map(ex => (
                                            <tr key={ex.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold dark:text-white">{ex.title}</p>
                                                    <p className="text-[10px] text-dark-400">{ex.surahName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">{ex.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs dark:text-dark-300">{new Date(ex.examDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-sm font-bold ${ex.finalScore! >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{ex.finalScore}%</span>
                                                        <div className="w-16 h-1 bg-dark-100 dark:bg-dark-800 rounded-full mt-1 overflow-hidden">
                                                            <div className={`h-full ${ex.finalScore! >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${ex.finalScore}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/dashboard/exams/${ex.id}/report`} className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center justify-end gap-1">
                                                        Rapport <FiChevronRight size={14} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
