'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUsers, FiClock, FiMapPin, FiAward, FiSend } from 'react-icons/fi';
import api from '@/lib/api/client';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function VolunteerDetailPage() {
    const { id } = useParams();
    const [mission, setMission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadMission();
    }, [id]);

    const loadMission = async () => {
        try {
            const res = await api.get(`/api/volunteer/missions/${id}`);
            setMission(res.data);
        } catch (e) {
            console.error('Failed to load mission', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-32 text-center animate-pulse">Chargement de la mission...</div>;
    if (!mission) return (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
            <h1 className="text-3xl font-serif font-black mb-4">Mission introuvable</h1>
            <Link href="/site" className="text-primary-600 font-bold uppercase tracking-widest text-sm">Retour</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 font-sans relative">
            {/* Architectural Header Background */}
            <div className="absolute top-0 inset-x-0 h-[45vh] bg-primary-950 -z-10" />
            <div className="absolute top-0 inset-x-0 h-[45vh] islamic-pattern opacity-5 -z-10" />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24 relative">
                <Link href="/site" className="inline-flex items-center gap-3 text-[10px] font-black text-white/40 hover:text-accent-gold uppercase tracking-[0.4em] mb-12 group transition-all">
                    <span className="size-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all">
                        <FiArrowLeft size={14} />
                    </span>
                    Retour au Hub
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 bg-primary-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/5">
                                <span className="size-2 rounded-full bg-accent-gold animate-pulse" />
                                Mission de Bénévolat
                            </span>
                            <h1 className="text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] tracking-tighter cinzel-title uppercase">
                                {mission.title}
                            </h1>
                        </div>

                        {/* White Glass Card for Description */}
                        <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-dark-800 space-y-12">
                            <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
                                    {mission.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-slate-100 dark:border-dark-800">
                                <div className="flex items-center gap-6 group">
                                    <div className="size-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <FiMapPin size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Localisation</p>
                                        <p className="text-2xl font-black text-primary-950 dark:text-white tracking-tighter">
                                            {mission.location || 'Centre Spirituel'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="size-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                                        <FiClock size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Engagement</p>
                                        <p className="text-2xl font-black text-primary-950 dark:text-white tracking-tighter">
                                            {mission.commitment || 'À définir'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {mission.requirements && (
                                <div className="p-10 bg-slate-50 dark:bg-dark-950 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 relative overflow-hidden group/req">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-accent-gold/40 group-hover/req:bg-accent-gold transition-colors" />
                                    <h3 className="text-xl font-black text-primary-950 dark:text-white mb-6 flex items-center gap-4 cinzel-title">
                                        <FiAward className="text-accent-gold scale-125" /> 
                                        Profil Recherché
                                    </h3>
                                    <p className="text-slate-600 dark:text-dark-400 leading-relaxed font-medium">
                                        {mission.requirements}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-32 bg-primary-950 text-white rounded-[3.5rem] p-10 md:p-12 shadow-[0_50px_100px_rgba(6,78,59,0.2)] relative overflow-hidden group border border-white/5">
                            <div className="absolute inset-0 zellige-pattern opacity-5" />
                            
                            <div className="relative z-10 space-y-10">
                                <div className="text-center space-y-6">
                                    <div className="size-24 bg-white/5 rounded-[2rem] mx-auto flex items-center justify-center text-accent-gold border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 backdrop-blur-xl">
                                        <FiUsers size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-serif font-black cinzel-title uppercase tracking-tighter">Rejoignez-nous</h3>
                                        <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em] mt-3">Cultiver l&apos;Excellence Ensemble</p>
                                    </div>
                                </div>

                                <p className="text-center text-white/60 text-lg font-medium leading-relaxed px-4">
                                    Chaque heure offerte est une pierre ajoutée à l&apos;édifice de notre communauté. Rejoignez une équipe dévouée et passionnée.
                                </p>

                                <div className="space-y-4 pt-6">
                                    <button className="flex items-center justify-center w-full py-6 bg-accent-gold text-primary-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-white hover:-translate-y-2 transition-all duration-500">
                                        <FiSend className="mr-3 scale-125 transition-transform" />
                                        Postuler Maintenant
                                    </button>
                                    <Link href="/site" className="flex items-center justify-center w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-500 backdrop-blur-md">
                                        Explorer d&apos;autres missions
                                    </Link>
                                </div>

                                <div className="pt-10 border-t border-white/10 text-center">
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] leading-relaxed italic">
                                        &ldquo;Le meilleur des hommes est celui qui est le plus utile aux autres.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
