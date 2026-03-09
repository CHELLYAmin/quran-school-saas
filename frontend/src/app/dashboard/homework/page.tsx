'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { homeworkApi, dashboardApi } from '@/lib/api/client';
import { UserRole } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { FaPlus, FaBookOpen, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface Homework {
    id: string;
    title: string;
    dueDate: string;
    groupName?: string;
    assignmentsCount?: number;
    submittedCount?: number;
    status?: string;
    grade?: number;
    studentName?: string;
    assignmentId?: string;
}

export default function HomeworkPage() {
    const router = useRouter();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const { user } = useAuthStore();
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchHomeworks();
    }, [user]);

    const fetchHomeworks = async () => {
        try {
            setLoading(true);
            let data;
            const roles = user?.roles || [];
            if (roles.includes(UserRole.Teacher) || roles.includes(UserRole.Admin) || roles.includes(UserRole.SuperAdmin)) {
                const res = await homeworkApi.getByTeacher();
                data = res.data;
            } else if (roles.includes(UserRole.Student)) {
                const res = await homeworkApi.getMyAssignments();
                data = res.data.map((a: any) => ({
                    id: a.homeworkId,
                    assignmentId: a.id,
                    title: a.homeworkTitle,
                    dueDate: a.dueDate,
                    status: a.status,
                    grade: a.grade,
                    teacherFeedback: a.teacherFeedback
                }));
            } else if (roles.includes(UserRole.Parent)) {
                const res = await dashboardApi.getParent(user!.userId);
                const childrenData = res.data.children || [];
                const allHomeworks: any[] = [];

                childrenData.forEach((child: any) => {
                    child.pendingHomeworks.forEach((hw: any) => {
                        allHomeworks.push({
                            ...hw,
                            studentName: child.fullName
                        });
                    });
                });
                data = allHomeworks;
            }
            setHomeworks(data || []);
        } catch (error) {
            console.error('Failed to fetch homeworks', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    const isTeacher = user?.roles?.some(r => [UserRole.Teacher, UserRole.Admin, UserRole.SuperAdmin].includes(r));
    const isStudent = user?.roles?.includes(UserRole.Student);

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.homework.listTitle}</h1>
                    <p className="text-dark-500 mt-2 text-lg">Suivi des travaux et évaluations</p>
                </div>
                {isTeacher && (
                    <Link
                        href="/dashboard/homework/create"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:-translate-y-1 transition-all"
                    >
                        <FaPlus size={16} /> {t.homework.create}
                    </Link>
                )}
            </div>

            <div className="space-y-4">
                {homeworks.length === 0 ? (
                    <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-16 text-center text-dark-500 shadow-xl flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <FaBookOpen className="text-4xl text-dark-300 dark:text-dark-600" />
                        </div>
                        <p className="text-xl font-bold">{t.homework.noRecords}</p>
                        <p className="mt-2 text-dark-400 max-w-sm mx-auto">Aucun devoir n'est assigné pour le moment. Profitez de ce temps libre !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {homeworks.map((hw) => (
                            <div
                                key={hw.id || hw.assignmentId}
                                className="bg-white dark:bg-dark-900 p-6 sm:p-8 rounded-[2rem] shadow-lg border border-dark-100 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-xl transition-all group relative overflow-hidden"
                            >
                                {/* Aesthetic side accent */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-400 to-accent-500 opacity-80" />

                                <div className="pl-4">
                                    <h3 className="text-2xl font-extrabold text-dark-900 dark:text-white tracking-tight leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {hw.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-sm font-medium text-dark-600 dark:text-dark-400">
                                        <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg">
                                            <FaClock className="text-accent-500" />
                                            <span>{t.homework.due}: {format(new Date(hw.dueDate), 'PPP', { locale: locale === 'fr' ? fr : undefined })}</span>
                                        </div>

                                        {isTeacher && hw.groupName && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                                <span>{t.homework.group}: <strong className="text-dark-900 dark:text-white">{hw.groupName}</strong></span>
                                            </div>
                                        )}

                                        {user?.roles?.includes(UserRole.Parent) && hw.studentName && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span>{t.homework.student}: <strong className="text-dark-900 dark:text-white">{hw.studentName}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    {isStudent && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <span
                                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm ${hw.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                    hw.status === 'Graded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                    }`}
                                            >
                                                {hw.status === 'Submitted' || hw.status === 'Graded' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                                {hw.status} {hw.grade !== null && `(${t.homework.grade}: ${hw.grade}/20)`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-start sm:justify-end shrink-0 pl-4 sm:pl-0">
                                    <Link
                                        href={isTeacher ? `/dashboard/homework/${hw.id}` : `/dashboard/homework/${hw.assignmentId}`}
                                        className="bg-dark-50 hover:bg-dark-100 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-900 dark:text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors border border-dark-200 dark:border-dark-700"
                                    >
                                        <FaBookOpen className="text-primary-500" /> {t.homework.view}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
