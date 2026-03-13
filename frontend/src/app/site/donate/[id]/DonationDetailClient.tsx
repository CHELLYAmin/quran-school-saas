'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiHeart, FiShare2, FiClock, FiTarget, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api/client';

export default function DonationDetailClient({ id }: { id: string }) {
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadCampaign();
    }, [id]);

    const loadCampaign = async () => {
        try {
            const res = await api.get(`/api/donation/campaigns/${id}`);
            setCampaign(res.data);
        } catch (e) {
            console.error('Failed to load campaign', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-32 text-center animate-pulse">Chargement de la campagne...</div>;
    if (!campaign) return (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
            <h1 className="text-3xl font-serif font-black mb-4">Campagne introuvable</h1>
            <Link href="/site" className="text-primary-600 font-bold uppercase tracking-widest text-sm">Retour</Link>
        </div>
    );

    const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans relative">
            <div className="absolute top-0 inset-x-0 h-[45vh] bg-[#FDFCFB] border-b border-slate-100 -z-10" />
            <div className="absolute top-0 inset-x-0 h-[45vh] border-slate-200/50 border-b -z-10" />

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24 relative">
                <Link href="/site" className="inline-flex items-center gap-3 text-[10px] font-black text-primary-900/40 hover:text-accent-gold uppercase tracking-[0.4em] mb-12 group transition-all">
                    <span className="size-9 rounded-full border border-primary-900/10 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all">
                        <FiArrowLeft size={14} />
                    </span>
                    Retour au Hub
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 bg-primary-900/5 border border-primary-900/10 text-primary-950 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                <span className="size-2 rounded-full bg-primary-900 animate-pulse" />
                                Campagne en cours
                            </span>
                            <h1 className="text-5xl md:text-7xl font-serif font-black text-primary-950 leading-[0.9] tracking-tighter cinzel-title uppercase">
                                {campaign.title}
                            </h1>
                        </div>

                        <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-dark-800 space-y-10">
                            <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-dark-300 leading-relaxed font-medium">
                                    {campaign.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-slate-100 dark:border-dark-800">
                                <div className="flex items-center gap-6 group">
                                    <div className="size-16 rounded-[1.5rem] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-900 dark:text-primary-400 group-hover:bg-primary-900 group-hover:text-white transition-all duration-500">
                                        <FiTarget size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Objectif Global</p>
                                        <p className="text-2xl font-black text-primary-950 dark:text-white tracking-tighter">{campaign.targetAmount.toLocaleString()} $</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="size-16 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                        <FiCheckCircle size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Fonds Collectés</p>
                                        <p className="text-2xl font-black text-primary-950 dark:text-white tracking-tighter">{campaign.raisedAmount.toLocaleString()} $</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-32 bg-primary-950 text-white rounded-[3.5rem] p-10 md:p-12 shadow-[0_50px_100px_rgba(6,78,59,0.2)] relative overflow-hidden group border border-white/5">
                            <div className="absolute inset-0 zellige-pattern opacity-5" />
                            <div className="relative z-10 space-y-10">
                                <div className="text-center">
                                    <div className="inline-block text-accent-gold text-7xl font-serif font-black tracking-tighter mb-2 cinzel-title">
                                        {percent}%
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Progression Actuelle</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                                        <div 
                                            className="h-full bg-accent-gold rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <span>Générosité</span>
                                        <span>Accomplissement</span>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6">
                                    <Link href="/donate" className="flex items-center justify-center w-full py-6 bg-accent-gold text-primary-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-white hover:-translate-y-2 transition-all duration-500">
                                        <FiHeart className="mr-3 text-red-600 fill-red-600 scale-125 transition-transform" />
                                        Soutenir ce projet
                                    </Link>
                                    <button className="flex items-center justify-center w-full py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-500 backdrop-blur-md">
                                        <FiShare2 className="mr-3 text-accent-gold" />
                                        Partager l&apos;appel
                                    </button>
                                </div>
                                <div className="pt-10 border-t border-white/10 flex items-center justify-center gap-4 group/timer">
                                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-accent-gold group-hover/timer:scale-110 transition-transform">
                                        <FiClock size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">Temps restant</span>
                                        <span className="text-sm font-black text-white">{Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours précieux</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
