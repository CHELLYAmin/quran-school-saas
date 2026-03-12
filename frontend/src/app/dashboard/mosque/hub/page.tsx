'use client';

import React, { useEffect, useState } from 'react';
import { FiGrid, FiFileText, FiHeart, FiUsers, FiTrendingUp, FiArrowRight, FiActivity } from 'react-icons/fi';
import Link from 'next/link';
import { cmsApi } from '@/lib/api/cms';
import { donationApi, volunteerApi } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function HubDashboardPage() {
    const [stats, setStats] = useState({
        pagesCount: 0,
        publishedPagesCount: 0,
        activeCampaigns: 0,
        totalDonations: 0,
        pendingVolunteers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pages, campaigns, records, signups] = await Promise.all([
                cmsApi.getPages(),
                donationApi.getCampaigns(true),
                donationApi.getRecords(),
                volunteerApi.getSignups()
            ]);

            setStats({
                pagesCount: pages.data.length,
                publishedPagesCount: pages.data.filter(p => p.isPublished).length,
                activeCampaigns: campaigns.data.length,
                totalDonations: records.data.filter((r: any) => r.status === 'Validated').reduce((acc: number, r: any) => acc + r.amount, 0),
                pendingVolunteers: signups.data.length
            });
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors du chargement des statistiques du Hub");
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        {
            title: 'Contenu CMS',
            value: stats.pagesCount,
            subValue: `${stats.publishedPagesCount} pages publiées`,
            icon: <FiFileText />,
            color: 'bg-blue-500',
            href: '/dashboard/mosque/pages',
            label: 'Gérer les pages'
        },
        {
            title: 'Collecte de Dons',
            value: `${stats.totalDonations}€`,
            subValue: `${stats.activeCampaigns} campagnes actives`,
            icon: <FiHeart />,
            color: 'bg-rose-500',
            href: '/dashboard/mosque/donations',
            label: 'Suivre les dons'
        },
        {
            title: 'Bénévolat',
            value: stats.pendingVolunteers,
            subValue: 'Inscriptions à valider',
            icon: <FiUsers />,
            color: 'bg-emerald-500',
            href: '/dashboard/mosque/volunteering',
            label: 'Voir les bénévoles'
        }
    ];

    if (loading) return <div className="p-8 flex items-center justify-center"><div className="spinner w-8 h-8 border-primary-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                    <FiGrid className="text-primary-600" /> Dashboard Hub de Vie
                </h1>
                <p className="text-dark-500 font-medium">Gestion centralisée du site vitrine et de l'engagement communautaire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="card p-0 overflow-hidden hover:shadow-xl transition-all group">
                        <div className="p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                                    {React.cloneElement(card.icon as any, { size: 28 })}
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-dark-900 dark:text-white leading-none">{card.value}</p>
                                    <p className="text-sm font-bold text-dark-400 mt-2 uppercase tracking-widest">{card.title}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-dark-50 dark:border-dark-800">
                                <p className="text-sm font-medium text-dark-500 flex items-center gap-2">
                                    <FiActivity className="text-primary-500" /> {card.subValue}
                                </p>
                            </div>
                        </div>
                        <Link href={card.href} className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-800/50 hover:bg-primary-600 hover:text-white transition-all group-hover:px-6">
                            <span className="font-bold text-sm tracking-tight">{card.label}</span>
                            <FiArrowRight />
                        </Link>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-dark-900 dark:text-white tracking-tight">Accès Rapide Configuration</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/mosque/settings" className="p-6 rounded-3xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 hover:border-primary-500 hover:bg-white dark:hover:bg-dark-800 transition-all text-center group">
                            <FiTrendingUp className="mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-bold text-sm block">Réglages Web</span>
                        </Link>
                        <Link href="/dashboard/mosque/menu" className="p-6 rounded-3xl bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 hover:border-primary-500 hover:bg-white dark:hover:bg-dark-800 transition-all text-center group">
                            <FiGrid className="mx-auto mb-3 text-amber-500 group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-bold text-sm block">Menu du site</span>
                        </Link>
                    </div>
                </div>

                <div className="card p-8 bg-primary-900 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-2xl font-black tracking-tight leading-tight">Visibilité Publique</h2>
                        <p className="text-primary-200 font-medium">Votre site vitrine est actuellement synchronisé avec ces données.</p>
                        <Link href="/site" target="_blank" className="btn bg-accent-gold hover:bg-white text-primary-950 font-black px-8 py-4 rounded-2xl w-fit shadow-xl shadow-black/20">
                            Voir le site live
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
