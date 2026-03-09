'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { FiAward, FiStar, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';

interface LeaderboardStudent {
    id: string;
    fullName: string;
    totalXP: number;
    currentStreak: number;
    badges: string[];
}

export default function LeaderboardPage() {
    const { user } = useAuthStore();
    const [students, setStudents] = useState<LeaderboardStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setIsLoading(true);
        try {
            // Amina Zahra (student2@example.com) schoolId should be found in her profile
            // If schoolId is not in the top-level user object, we might need to find it from data.studentProfile
            const schoolId = user?.schoolId || '00000000-0000-0000-0000-000000000000';

            // Explicitly use relative path for axios to work with internal /api/ logic
            const response = await api.get('/api/gamification/leaderboard', {
                params: { schoolId, take: 20 }
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to load leaderboard', error);
            toast.error("Erreur lors du chargement du classement réel. Chargement des données de démo...");

            // Fallback for demo
            setStudents([
                { id: '1', fullName: 'Youssef B.', totalXP: 1450, currentStreak: 12, badges: ['🔥', '⭐'] },
                { id: '2', fullName: 'Amina S.', totalXP: 1200, currentStreak: 5, badges: ['⭐'] },
                { id: '3', fullName: 'Ibrahim M.', totalXP: 950, currentStreak: 8, badges: [] },
                { id: '4', fullName: 'Sara K.', totalXP: 840, currentStreak: 3, badges: [] },
                { id: '5', fullName: 'Omar A.', totalXP: 700, currentStreak: 2, badges: [] },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            {/* ══ Header ══ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -z-0" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <FiAward className="text-amber-400" />
                        Classement Général
                    </h1>
                    <p className="text-indigo-100 mt-2 font-medium">Les élèves les plus assidus et performants de l'école.</p>
                </div>
            </div>

            {/* ══ Podium (Top 3) ══ */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 pt-8 pb-4">
                {/* 2nd Place */}
                {students[1] && (
                    <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-48 group">
                        <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white dark:border-dark-900 shadow-xl flex items-center justify-center text-slate-500 font-black text-xl mb-3 group-hover:-translate-y-2 transition-transform">
                            {students[1].fullName.charAt(0)}
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 w-full rounded-t-3xl p-4 text-center border-t-4 border-slate-300 dark:border-slate-600 shadow-lg h-32 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                            <h3 className="font-bold text-dark-900 dark:text-white truncate relative z-10">{students[1].fullName}</h3>
                            <div className="relative z-10">
                                <span className="text-2xl font-black text-slate-600 dark:text-slate-400">#2</span>
                                <div className="text-xs font-bold text-slate-500 mt-1">{students[1].totalXP} XP</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {students[0] && (
                    <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-56 group z-10 md:-mx-4">
                        <div className="relative mb-3 group-hover:-translate-y-2 transition-transform">
                            <div className="absolute -top-6 -right-4 text-4xl animate-bounce">👑</div>
                            <div className="w-20 h-20 rounded-full bg-amber-200 border-4 border-white dark:border-dark-900 shadow-2xl flex items-center justify-center text-amber-600 font-black text-2xl">
                                {students[0].fullName.charAt(0)}
                            </div>
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/40 w-full rounded-t-3xl p-5 text-center border-t-4 border-amber-400 shadow-xl h-40 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent"></div>
                            <h3 className="font-bold text-dark-900 dark:text-white text-lg truncate relative z-10">{students[0].fullName}</h3>
                            <div className="relative z-10">
                                <span className="text-4xl font-black text-amber-500 drop-shadow-sm">#1</span>
                                <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1">{students[0].totalXP} XP</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {students[2] && (
                    <div className="order-3 flex flex-col items-center w-full md:w-48 group">
                        <div className="w-16 h-16 rounded-full bg-orange-200 border-4 border-white dark:border-dark-900 shadow-xl flex items-center justify-center text-orange-600 font-black text-xl mb-3 group-hover:-translate-y-2 transition-transform">
                            {students[2].fullName.charAt(0)}
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 w-full rounded-t-3xl p-4 text-center border-t-4 border-orange-300 dark:border-orange-700 shadow-lg h-24 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                            <h3 className="font-bold text-dark-900 dark:text-white truncate relative z-10">{students[2].fullName}</h3>
                            <div className="relative z-10">
                                <span className="text-xl font-black text-orange-500">#3</span>
                                <div className="text-[10px] font-bold text-orange-600/70 dark:text-orange-400 mt-1">{students[2].totalXP} XP</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ List (4th+) ══ */}
            <div className="bg-white dark:bg-dark-900 rounded-[2rem] p-6 shadow-sm border border-dark-100 dark:border-dark-800">
                <div className="space-y-3">
                    {students.slice(3).map((student, idx) => (
                        <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-100 dark:hover:border-dark-700">
                            <div className="flex items-center gap-4">
                                <div className="w-8 flex justify-center text-dark-400 font-black">
                                    #{idx + 4}
                                </div>
                                <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center font-bold text-dark-600 dark:text-dark-300 uppercase">
                                    {student.fullName.charAt(0)}
                                </div>
                                <h3 className="font-bold text-dark-900 dark:text-white">{student.fullName}</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                {student.currentStreak >= 3 && (
                                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                        🔥 {student.currentStreak} j
                                    </div>
                                )}
                                <div className="text-right">
                                    <span className="font-black text-lg text-primary-600 dark:text-primary-400 block leading-none">{student.totalXP}</span>
                                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {students.length <= 3 && (
                        <p className="text-center text-dark-400 py-8 text-sm font-medium">Bientôt d'autres élèves dans le classement, continuez comme ça !</p>
                    )}
                </div>
            </div>
        </div>
    );
}
