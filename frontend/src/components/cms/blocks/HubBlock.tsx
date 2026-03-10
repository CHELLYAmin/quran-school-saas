'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import Link from 'next/link';

export default function HubBlock({ data }: { data: any }) {
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/api/cms/pages?published=true');
                // Filter out system pages and limit results
                const filtered = res.data
                    .filter((p: any) => !p.isSystemPage && p.category !== 'page')
                    .slice(0, data.limit || 6);
                setContent(filtered);
            } catch (e) {
                console.error('Failed to load hub content', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [data.limit]);

    if (loading) return (
        <div className="py-24 text-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="size-12 rounded-full border-4 border-accent-gold/20 border-t-accent-gold animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-primary-900/40">Synchronisation du Hub...</p>
            </div>
        </div>
    );

    return (
        <section className="py-24 bg-white dark:bg-dark-900 overflow-hidden relative">
            {/* Subtle background element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                    <div className="border-l-4 border-accent-gold pl-8">
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-primary-900 dark:text-white cinzel-title italic">
                            {data.title || 'Hub de Vie'}
                        </h2>
                        <p className="text-dark-900/40 dark:text-pearl/40 font-bold uppercase tracking-[0.2em] mt-2 text-[10px]">
                            Actualités & Missions Communautaires
                        </p>
                    </div>
                    <Link href="/site/hub" className="flex items-center gap-3 text-[11px] font-black text-accent-gold hover:text-primary-900 dark:hover:text-white transition-all uppercase tracking-[0.3em] group">
                        Explorer le Hub
                        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {content.length > 0 ? content.map((item) => (
                        <Link key={item.id} href={`/site/${item.slug}`} className="group relative bg-pearl dark:bg-dark-950/20 p-8 rounded-[2rem] border border-dark-50 dark:border-dark-900/10 hover:border-accent-gold/50 transition-all duration-500 shadow-xl shadow-black/5 hover:-translate-y-2 flex flex-col h-full">
                             <div className="mb-6 flex justify-between items-start">
                                <span className="inline-block px-3 py-1 rounded-lg bg-primary-900/5 text-primary-900 dark:text-accent-gold text-[9px] font-black uppercase tracking-widest border border-primary-900/10">
                                    {item.category}
                                </span>
                                <span className="text-[10px] font-bold text-dark-900/20 dark:text-pearl/20">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                             </div>
                             
                             <h4 className="text-2xl font-serif font-black text-primary-900 dark:text-white leading-tight mb-4 group-hover:text-accent-gold transition-colors italic">
                                {item.title}
                             </h4>
                             
                             <p className="text-sm text-dark-900/60 dark:text-pearl/50 line-clamp-3 mb-8 font-medium leading-relaxed">
                                {item.excerpt || (item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : '')}
                             </p>
                             
                             <div className="mt-auto flex items-center text-accent-gold text-[10px] font-black uppercase tracking-[0.2em] gap-3">
                                Consulter
                                <div className="h-[1px] w-8 bg-accent-gold/30 group-hover:w-16 transition-all duration-500" />
                                <span className="material-symbols-outlined text-sm">north_east</span>
                             </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-dark-50 dark:bg-dark-900/50 rounded-[3rem] border-2 border-dashed border-dark-200 dark:border-dark-800">
                             <span className="material-symbols-outlined text-5xl text-dark-200 dark:text-dark-700 mb-4">newspaper</span>
                             <p className="text-dark-400 font-bold uppercase tracking-widest text-xs">Aucune publication récente</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
