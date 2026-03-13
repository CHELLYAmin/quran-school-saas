'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BlockRenderer from '@/components/cms/BlockRenderer';
import { cmsApi } from '@/lib/api/cms';

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
    }, [slug]);

    const loadPage = async () => {
        try {
            const res = await cmsApi.getPageBySlug(slug);
            if (res.data) setPage(res.data as any);
            else setNotFound(true);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (md: string) => {
        if (!md) return '';
        let html = md
            .replace(/^### (.+)$/gm, '<h3 class="text-xl font-serif font-black text-primary-900 mt-12 mb-4 cinzel-title uppercase">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-serif font-black text-primary-900 mt-16 mb-6 cinzel-title uppercase">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-serif font-black text-primary-900 mt-10 mb-8 cinzel-title uppercase">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary-950 font-black">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em class="italic text-accent-gold font-serif">$1</em>')
            .replace(/^- (.+)$/gm, '<li class="ml-6 text-slate-600 list-disc mb-3 font-medium">$1</li>')
            .replace(/\n\n/g, '</p><p class="text-slate-600 leading-relaxed mb-6 font-medium">')
            .replace(/\n/g, '<br/>');
        return `<p class="text-slate-600 leading-relaxed mb-6 font-medium">${html}</p>`;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="size-16 rounded-[2rem] border-4 border-primary-900/10 border-t-primary-900 animate-spin mb-6" />
            <p className="text-[10px] font-black text-primary-950 uppercase tracking-[0.4em]">Chargement...</p>
        </div>
    );

    if (notFound || !page) return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-serif font-black text-primary-950 mb-6 cinzel-title uppercase">Page Introuvable</h1>
            <Link href="/site" className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Retour</Link>
        </div>
    );

    if (page.blocksJson && page.blocksJson !== "[]" && page.blocksJson !== "" && page.blocksJson !== "null") {
        return <BlockRenderer blocksJson={page.blocksJson} />;
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans relative overflow-hidden">
            {/* Light Premium Hero */}
            <section className="relative overflow-hidden bg-[#FDFCFB] text-primary-950 pt-32 pb-48 px-6 border-b border-slate-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-primary-900/5 rounded-full -z-0" />
                <div className="container mx-auto max-w-4xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 text-primary-950 text-[10px] font-black tracking-[0.3em] uppercase">
                        {page.category}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 tracking-tighter leading-[0.9] cinzel-title uppercase text-primary-950 italic">
                        {page.title}
                    </h1>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-32 relative z-30 -mt-32">
                <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(6,78,59,0.06)] border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-24">
                        {page.excerpt && (
                            <div className="mb-20 p-10 bg-slate-50 rounded-[3rem] border-l-8 border-accent-gold">
                                <p className="text-2xl text-primary-900 font-medium italic leading-relaxed text-center">
                                    {page.excerpt}
                                </p>
                            </div>
                        )}
                        <article className="prose prose-xl prose-emerald max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
                        </article>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/site" className="group flex items-center gap-4 px-12 py-6 bg-primary-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-black transition-all hover:-translate-y-2">
                        Retour au Hub de Vie
                    </Link>
                </div>
            </div>
        </div>
    );
}
