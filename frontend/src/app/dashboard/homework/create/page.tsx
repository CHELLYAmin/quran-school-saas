'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { groupApi, homeworkApi } from '@/lib/api/client';
import { useAuthStore, useUIStore } from '@/lib/store';
import { format } from 'date-fns';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/translations';

export default function CreateHomeworkPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const { user } = useAuthStore();
    const [groups, setGroups] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]); // To show student name if studentId exists
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 0, // Memorization by default
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        groupId: searchParams.get('groupId') || '',
        studentIds: searchParams.get('studentId') ? [searchParams.get('studentId')] : [] as string[],
        attachmentUrl: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, [searchParams]);

    const fetchGroups = async () => {
        try {
            const res = await groupApi.getAll();
            setGroups(res.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await homeworkApi.create({
                ...formData,
                type: Number(formData.type),
                dueDate: new Date(formData.dueDate).toISOString(), // Ensure ISO format
                studentIds: formData.studentIds.length > 0 ? formData.studentIds : undefined
            });
            router.push('/dashboard/homework');
        } catch (error) {
            console.error('Failed to create homework', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <PageSkeleton variant="form" />;

    return (
        <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Link
                href="/dashboard/homework"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-xl text-dark-500 hover:text-dark-900 dark:hover:text-white hover:shadow-md transition-all font-bold text-sm"
            >
                <FaArrowLeft /> {t.homework.backToList}
            </Link>

            <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl overflow-hidden relative">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500" />

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">
                        {t.homework.create}
                    </h1>
                    <p className="text-dark-500 mt-2 font-medium">Assignez un nouveau devoir à un groupe ou un élève spécifique.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.title}</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="ex: Mémorisation de Surat Al-Baqarah (Versets 1-5)"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.description}</label>
                        <textarea
                            name="description"
                            className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white resize-none"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Détails et consignes pour les élèves..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.type}</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-bold transition-all text-dark-900 dark:text-white appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value={0}>{t.homework.types.memorization}</option>
                                    <option value={1}>{t.homework.types.revision}</option>
                                    <option value={2}>{t.homework.types.tajwid}</option>
                                    <option value={3}>{t.homework.types.reading}</option>
                                    <option value={4}>{t.homework.types.written}</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.dueDate}</label>
                            <input
                                type="date"
                                name="dueDate"
                                required
                                className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 bg-dark-50 dark:bg-dark-950/50 p-6 rounded-[2rem] border border-dark-100 dark:border-dark-800">
                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.group}</label>
                        <div className="relative">
                            <select
                                name="groupId"
                                className="w-full bg-white dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 rounded-xl px-4 py-3 outline-none font-bold transition-all text-dark-900 dark:text-white appearance-none cursor-pointer shadow-sm"
                                value={formData.groupId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t.homework.selectGroup}</option>
                                {groups.map((g: any) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 bg-white dark:bg-dark-800 p-3 rounded-xl border border-dark-100 dark:border-dark-700 w-fit">
                            <div className={`w-2.5 h-2.5 rounded-full ${formData.studentIds.length > 0 ? 'bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(var(--color-primary-500),0.6)]' : 'bg-dark-300 dark:bg-dark-600'}`}></div>
                            {formData.studentIds.length > 1 ? (
                                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{t.homework.assignment.multiple.replace('{count}', formData.studentIds.length.toString())}</p>
                            ) : formData.studentIds.length === 1 ? (
                                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{t.homework.assignment.single}</p>
                            ) : (
                                <p className="text-sm font-medium text-dark-500">{t.homework.assignment.group}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-dark-500">{t.homework.attachmentUrl} (Optionnel)</label>
                        <input
                            type="url"
                            name="attachmentUrl"
                            className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white"
                            placeholder="https://example.com/resource.pdf"
                            value={formData.attachmentUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaSave className="text-lg" />
                            )}
                            {loading ? 'Création en cours...' : t.homework.create}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
