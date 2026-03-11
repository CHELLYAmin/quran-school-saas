'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BlockRenderer from '@/components/cms/BlockRenderer';

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    isPublished: boolean;
    excerpt?: string;
    blocksJson?: string;
    createdAt: string;
    updatedAt: string;
}

export default function CmsPageClient({ slug }: { slug: string }) {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (slug) loadPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const loadPage = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/cms/pages/${slug}`);
            if (res.ok) {
                setPage(await res.json());
            } else {
                setNotFound(true);
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (md: string) => {
        if (!md) return '';
        let html = md
            .replace(/^### (.+)$/gm, '<h3 class="text-xl font-serif font-black text-primary-900 dark:text-white mt-12 mb-4 cinzel-title">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-serif font-black text-primary-900 dark:text-white mt-16 mb-6 cinzel-title">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-serif font-black text-primary-900 dark:text-white mt-10 mb-8 cinzel-title">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary-900 dark:text-white font-black">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em class="italic text-accent-gold">$1</em>')
            .replace(/^- (.+)$/gm, '<li class="ml-6 text-dark-900/70 dark:text-pearl/60 list-disc mb-3">$1</li>')
            .replace(/\n\n/g, '</p><p class="text-dark-900/70 dark:text-pearl/60 leading-relaxed mb-6 font-medium">')
            .replace(/\n/g, '<br/>');
        return `<p class="text-dark-900/70 dark:text-pearl/60 leading-relaxed mb-6 font-medium">${html}</p>`;
    };

    if (loading) return (
        <div className="min-h-screen bg-primary-950 flex flex-col items-center justify-center p-6">
            <div className="size-16 rounded-3xl border-4 border-accent-gold/20 border-t-accent-gold animate-spin mb-6" />
            <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em]">Chargement des données sacrées...</p>
        </div>
    );

    if (notFound || !page) return (
        <div className="min-h-screen bg-pearl dark:bg-dark-950 flex flex-col items-center justify-center p-6 text-center" id="not-found-container">
            <span className="material-symbols-outlined text-8xl text-primary-900/10 mb-8">find_in_page</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary-950 dark:text-white mb-6 cinzel-title italic">Page Introuvable</h1>
            <p className="text-dark-900/40 dark:text-pearl/40 mb-12 max-w-md font-medium uppercase tracking-widest text-xs leading-loose">
                Le chemin spécifié ne semble mener à aucune destination connue dans notre portail.
            </p>
            <Link href="/site" className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary-950 transition-all active:scale-95">
                Retour à l&apos;accueil
            </Link>
        </div>
    );

    // If page has blocks, render only blocks (Blank Canvas mode)
    if (page.blocksJson && page.blocksJson !== "[]" && page.blocksJson !== "" && page.blocksJson !== "null") {
        return <BlockRenderer blocksJson={page.blocksJson} />;
    }

    return (
        <div className="min-h-screen bg-pearl dark:bg-dark-950 font-sans relative overflow-hidden" id="cms-page-container">
            {/* Header Background */}
            <div className="absolute top-0 inset-x-0 h-[60vh] bg-primary-950 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-primary-950/80 to-pearl dark:to-dark-950" />
            </div>

            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-32 relative">
                <Link href="/site" id="back-to-portal" className="inline-flex items-center gap-3 text-[10px] font-black text-white/40 hover:text-accent-gold uppercase tracking-[0.3em] transition-all mb-16 group">
                    <span className="size-10 rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all bg-white/5 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </span>
                    Retour au portail
                </Link>

                <div className="bg-white dark:bg-dark-900/40 backdrop-blur-xl rounded-[4rem] shadow-[0_50px_100px_rgba(6,78,59,0.1)] border border-white/20 dark:border-white/5 overflow-hidden animate-slide-up">
                    <div className="p-10 md:p-20 border-b border-primary-900/5 bg-primary-900/5">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <span className="inline-block px-6 py-2 rounded-full bg-primary-900 text-accent-gold text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl border border-white/10">
                                {page.category}
                            </span>
                            <h1 className="text-4xl md:text-7xl font-serif font-black text-primary-950 dark:text-white leading-[0.95] tracking-tight cinzel-title italic">
                                {page.title}
                            </h1>
                            <div className="flex items-center gap-6 pt-6 opacity-40">
                                <div className="h-[2px] w-12 bg-primary-900" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic">
                                    {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <div className="h-[2px] w-12 bg-primary-900" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-24">
                        {page.excerpt && (
                            <div className="mb-20 p-10 bg-primary-900/5 rounded-[2.5rem] border-l-8 border-accent-gold relative">
                                <span className="absolute -top-6 left-6 text-6xl text-accent-gold/20 font-serif">&ldquo;</span>
                                <p className="text-2xl text-primary-900 dark:text-emerald-50 font-medium italic leading-relaxed text-center">
                                    {page.excerpt}
                                </p>
                            </div>
                        )}
                        <article className="prose prose-xl prose-emerald dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
                        </article>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/site" id="home-link-footer" className="group flex items-center gap-4 px-12 py-6 bg-primary-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-black transition-all hover:-translate-y-2 active:scale-95 border border-white/5">
                        <span className="material-symbols-outlined text-lg text-accent-gold group-hover:rotate-12 transition-transform">mosque</span>
                        Explorer d&apos;autres contenus
                    </Link>
                </div>
            </div>
        </div>
    );
}
