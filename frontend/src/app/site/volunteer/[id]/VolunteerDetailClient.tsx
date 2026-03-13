'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUsers, FiClock, FiMapPin, FiAward, FiSend } from 'react-icons/fi';
import api from '@/lib/api/client';

export default function VolunteerDetailClient({ id }: { id: string }) {
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

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
            <div className="size-16 rounded-[2rem] border-4 border-primary-900/10 border-t-primary-900 animate-spin mb-6" />
            <p className="text-[10px] font-black text-primary-950 uppercase tracking-[0.4em]">Chargement de la mission...</p>
        </div>
    );

    if (!mission) return (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
            <h1 className="text-4xl font-serif font-black mb-8 cinzel-title uppercase text-primary-950">Mission introuvable</h1>
            <Link href="/site" className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Retour</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans relative overflow-hidden">
            {/* Light Premium Hero */}
            <section className="relative overflow-hidden bg-[#FDFCFB] text-primary-950 pt-32 pb-48 px-6 border-b border-slate-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-[1px] border-primary-900/5 rounded-full -z-0" />
                <div className="container mx-auto max-w-5xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 text-primary-950 text-[10px] font-black tracking-[0.3em] uppercase">
                        Action Communautaire
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 tracking-tighter leading-[0.9] cinzel-title uppercase text-primary-950 italic">
                        {mission.title}
                    </h1>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-32 relative z-30 -mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-8 flex flex-col gap-12">
                        <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-[0_50px_100px_rgba(6,78,59,0.06)] border border-slate-100">
                            <article className="prose prose-xl prose-slate max-w-none">
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {mission.description}
                                </p>
                            </article>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 pt-16 border-t border-slate-50">
                                <div className="flex items-start gap-6 group">
                                    <div className="size-14 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-primary-900 group-hover:bg-primary-900 group-hover:text-white transition-all duration-500">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Lieu</p>
                                        <p className="text-xl font-black text-primary-950 cinzel-title uppercase">{mission.location || 'Centre CCIQ'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                    <div className="size-14 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-primary-900 group-hover:bg-primary-900 group-hover:text-white transition-all duration-500">
                                        <FiClock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Engagement</p>
                                        <p className="text-xl font-black text-primary-950 cinzel-title uppercase">{mission.commitment || 'À définir'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {mission.requirements && (
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group/req">
                                <div className="absolute top-0 left-0 w-2 h-full bg-accent-gold/40 group-hover/req:bg-accent-gold transition-colors" />
                                <h3 className="text-2xl font-black text-primary-950 mb-6 flex items-center gap-4 cinzel-title uppercase tracking-tighter">
                                    <FiAward className="text-accent-gold" /> Profil Recherché
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{mission.requirements}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-32 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl space-y-8">
                            <div className="text-center space-y-6">
                                <div className="size-20 bg-primary-900/5 rounded-[2rem] mx-auto flex items-center justify-center text-primary-900 border border-primary-900/10">
                                    <FiUsers size={32} />
                                </div>
                                <h3 className="text-3xl font-serif font-black cinzel-title uppercase text-primary-950 leading-none">Agir Ensemble</h3>
                            </div>
                            <p className="text-center text-slate-500 font-medium leading-relaxed">
                                Chaque geste compte. Rejoignez une communauté dévouée.
                            </p>
                            <button className="w-full py-6 bg-primary-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-900/20 transition-all hover:-translate-y-1">
                                Postuler Maintenant
                            </button>
                            <Link href="/site" className="flex items-center justify-center w-full py-6 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:text-primary-900 transition-colors">
                                Retour
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
