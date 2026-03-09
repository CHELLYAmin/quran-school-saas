'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaArrowLeft, FaPaperPlane, FaCheck, FaTimes, FaGraduationCap, FaRegCommentDots } from 'react-icons/fa';
import Link from 'next/link';
import { homeworkApi } from '@/lib/api/client';
import { HomeworkResponse, HomeworkAssignmentResponse, UserRole } from '@/types';
import { useTranslation } from '@/lib/i18n/translations';

export default function HomeworkDetailsClient() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user } = useAuthStore();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [loading, setLoading] = useState(true);
    const [homework, setHomework] = useState<HomeworkResponse | null>(null); // For Teacher
    const [assignment, setAssignment] = useState<HomeworkAssignmentResponse | null>(null); // For Student
    const [assignmentsList, setAssignmentsList] = useState<HomeworkAssignmentResponse[]>([]); // For Teacher (list of students)
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [gradingData, setGradingData] = useState<{ [key: string]: { grade: number, feedback: string } }>({});

    useEffect(() => {
        if (!user || !id) return;
        fetchData();
    }, [user, id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const roles = (user?.roles || []) as unknown as string[];
            if (roles.includes(UserRole.Student) || roles.includes(UserRole.Parent)) {
                // Fetch Assignment
                const res = await homeworkApi.getAssignmentById(id);
                setAssignment(res.data);
            } else {
                // Fetch Homework + List of Assignments
                const hwRes = await homeworkApi.getById(id);
                setHomework(hwRes.data);

                const listRes = await homeworkApi.getAssignments(id);
                setAssignmentsList(listRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAssignment = async () => {
        try {
            await homeworkApi.submitAssignment(id, { notes: submissionNotes });
            // Add a clean toast here ideally, falling back to alert for now
            alert('Devoir soumis avec succès !');
            fetchData(); // Refresh
        } catch (error) {
            console.error('Failed to submit', error);
            alert('Échec de la soumission du devoir.');
        }
    };

    const handleGrade = async (assignmentId: string) => {
        const data = gradingData[assignmentId];
        if (!data) return;

        try {
            await homeworkApi.gradeAssignment(assignmentId, {
                grade: Number(data.grade),
                feedback: data.feedback
            });
            alert('Évaluation enregistrée avec succès !');
            fetchData(); // Refresh
        } catch (error) {
            console.error('Failed to grade', error);
        }
    };

    const handleGradingChange = (assignmentId: string, field: string, value: any) => {
        setGradingData(prev => ({
            ...prev,
            [assignmentId]: {
                ...prev[assignmentId],
                [field]: value
            }
        }));
    };

    if (loading) {
    if (loading) return <PageSkeleton variant="detail" />;

        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    // === STUDENT VIEW ===
    if (user?.roles?.includes(UserRole.Student) || user?.roles?.includes(UserRole.Parent)) {
        if (!assignment) return <div className="p-8 text-center text-dark-500 font-medium">Devoir introuvable.</div>;
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <Link
                    href="/dashboard/homework"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-white hover:shadow-md transition-all font-bold text-sm"
                >
                    <FaArrowLeft /> {/* Add translation later */} Retour aux devoirs
                </Link>

                <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-bl-[6rem] -z-0 opacity-50" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight leading-tight mb-2">
                                    {assignment.homeworkTitle}
                                </h1>
                                <p className="text-sm font-bold uppercase tracking-widest text-dark-500 bg-dark-50 dark:bg-dark-800 inline-block px-3 py-1.5 rounded-lg">
                                    Échéance: {format(new Date(assignment.dueDate), 'PPP', { locale: locale === 'fr' ? fr : undefined })}
                                </p>
                            </div>
                            <span
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm border ${assignment.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50' :
                                    assignment.status === 'Graded' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800/50' :
                                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50'
                                    }`}
                            >
                                {assignment.status}
                            </span>
                        </div>

                        {assignment.teacherFeedback && (
                            <div className="bg-accent-50 dark:bg-accent-900/20 p-6 rounded-3xl border border-accent-100 dark:border-accent-800">
                                <h3 className="font-extrabold text-accent-700 dark:text-accent-300 flex items-center gap-2 mb-3">
                                    <FaRegCommentDots className="text-xl" /> Retour du professeur
                                </h3>
                                <p className="text-dark-700 dark:text-dark-300 font-medium leading-relaxed">{assignment.teacherFeedback}</p>
                                {assignment.grade !== null && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-white dark:bg-dark-800 px-4 py-2 rounded-xl shadow-sm border border-accent-100 dark:border-accent-800/50">
                                        <FaGraduationCap className="text-accent-500" />
                                        <span className="font-extrabold text-dark-900 dark:text-white">Note: {assignment.grade}/20</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {(assignment.status === 'Pending' || assignment.status === 'Late') && user?.roles?.includes(UserRole.Student) ? (
                            <div className="border-t-2 border-dashed border-dark-100 dark:border-dark-800 pt-8 space-y-4">
                                <h3 className="font-extrabold text-xl text-dark-900 dark:text-white mb-2">Soumettre votre devoir</h3>
                                <textarea
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white resize-none"
                                    rows={5}
                                    placeholder="Écrivez vos notes, remarques ou collez un lien..."
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                />
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSubmitAssignment}
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                                    >
                                        <FaPaperPlane /> Soumettre le devoir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t-2 border-dashed border-dark-100 dark:border-dark-800 pt-8">
                                <h3 className="font-extrabold text-xl text-dark-900 dark:text-white mb-4">Votre soumission</h3>
                                <div className="bg-dark-50 dark:bg-dark-950 p-6 rounded-2xl border border-dark-100 dark:border-dark-800">
                                    <p className="text-dark-700 dark:text-dark-300 font-medium whitespace-pre-wrap">
                                        {assignment.studentNotes || "Aucune note textuelle soumise."}
                                    </p>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-dark-400 mt-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Soumis le: {assignment.submittedAt ? format(new Date(assignment.submittedAt), 'PPP p', { locale: locale === 'fr' ? fr : undefined }) : 'N/A'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // === TEACHER VIEW ===
    if (!homework) return <div className="p-8 text-center text-dark-500 font-medium">Devoir introuvable.</div>;
    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <Link
                href="/dashboard/homework"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-white hover:shadow-md transition-all font-bold text-sm"
            >
                <FaArrowLeft /> Retour aux devoirs
            </Link>

            <div className="bg-primary-900 dark:bg-primary-950 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white border border-primary-800">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl mix-blend-screen" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl mix-blend-screen" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">{homework.title}</h1>
                    <p className="text-primary-100 font-medium text-lg max-w-3xl leading-relaxed">{homework.description}</p>

                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-xl">
                            <span className="block text-xs uppercase tracking-widest text-primary-200 font-bold mb-1">Échéance</span>
                            <span className="font-semibold">{format(new Date(homework.dueDate), 'PPP', { locale: locale === 'fr' ? fr : undefined })}</span>
                        </div>
                        {homework.groupName && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-xl">
                                <span className="block text-xs uppercase tracking-widest text-primary-200 font-bold mb-1">Groupe</span>
                                <span className="font-semibold">{homework.groupName}</span>
                            </div>
                        )}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-xl">
                            <span className="block text-xs uppercase tracking-widest text-primary-200 font-bold mb-1">Type</span>
                            <span className="font-semibold">Type {homework.type}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-xl border border-dark-100 dark:border-dark-800 overflow-hidden mt-8">
                <div className="p-8 border-b border-dark-100 dark:border-dark-800">
                    <h2 className="text-2xl font-extrabold text-dark-900 dark:text-white">Soumissions des élèves</h2>
                    <p className="text-dark-500 mt-1 font-medium">Évaluez et commentez les travaux rendus.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-50 dark:bg-dark-950/50">
                            <tr>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Élève</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Statut</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Soumis le</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500 w-1/4">Notes de l'élève</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Évaluation & Retour</th>
                                <th className="text-center p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                            {assignmentsList.map((a: any) => (
                                <tr key={a.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-sm">
                                                {a.studentName?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="font-extrabold text-dark-900 dark:text-white">{a.studentName}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest inline-flex items-center shadow-sm ${a.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                            a.status === 'Graded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm font-medium text-dark-500">
                                        {a.submittedAt ? format(new Date(a.submittedAt), 'MMM d, HH:mm') : '-'}
                                    </td>
                                    <td className="p-6 text-sm text-dark-600 dark:text-dark-400">
                                        <div className="max-w-[15rem] truncate font-medium bg-dark-50 dark:bg-dark-950 px-3 py-2 rounded-lg" title={a.studentNotes}>
                                            {a.studentNotes || <span className="text-dark-400 italic">Aucune note</span>}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {a.status !== 'Pending' && (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold uppercase text-dark-400 w-12 text-right">Note</span>
                                                    <input
                                                        type="number"
                                                        placeholder="/20"
                                                        className="w-20 bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-xl px-3 py-2 outline-none font-bold text-center transition-all text-dark-900 dark:text-white"
                                                        defaultValue={a.grade}
                                                        onChange={(e) => handleGradingChange(a.id, 'grade', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="text-xs font-bold uppercase text-dark-400 w-12 text-right pt-2.5">Avis</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Commentaire..."
                                                        className="w-48 bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-xl px-3 py-2 outline-none font-medium transition-all text-dark-900 dark:text-white text-sm"
                                                        defaultValue={a.teacherFeedback}
                                                        onChange={(e) => handleGradingChange(a.id, 'feedback', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6 text-center">
                                        {a.status === 'Submitted' || a.status === 'Graded' ? (
                                            <button
                                                onClick={() => handleGrade(a.id)}
                                                className="bg-accent-500 hover:bg-accent-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                                                title="Sauvegarder l'évaluation"
                                            >
                                                <FaCheck size={16} />
                                            </button>
                                        ) : (
                                            <span className="w-10 h-10 rounded-full bg-dark-50 dark:bg-dark-800 text-dark-300 dark:text-dark-600 flex items-center justify-center mx-auto">
                                                <FaTimes size={16} />
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {assignmentsList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-dark-400 font-medium">
                                        Aucun élève n'est assigné à ce devoir.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
