'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    isPublished: boolean;
    excerpt?: string;
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
        let html = md
            .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-dark-900 dark:text-white mt-8 mb-3">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-dark-900 dark:text-white mt-10 mb-4">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-serif font-black text-dark-900 dark:text-white mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^\| (.+) \|$/gm, (match) => {
                const cells = match.split('|').filter(c => c.trim()).map(c => `<td class="px-4 py-2 border border-dark-100 dark:border-dark-700">${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            })
            .replace(/^- (.+)$/gm, '<li class="ml-6 text-dark-600 dark:text-dark-300 list-disc mb-1.5">$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 text-dark-600 dark:text-dark-300 list-decimal mb-1.5">$1</li>')
            .replace(/\n\n/g, '</p><p class="text-dark-600 dark:text-dark-300 leading-relaxed mb-4">')
            .replace(/\n/g, '<br/>');
        return `<p class="text-dark-600 dark:text-dark-300 leading-relaxed mb-4">${html}</p>`;
    };

    if (loading) return (
        <div className="flex justify-center py-32">
            <div className="spinner w-10 h-10 border-primary-600" />
        </div>
    );

    if (notFound || !page) return (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-3xl font-serif font-black text-dark-900 dark:text-white mb-4">Page introuvable</h1>
            <p className="text-dark-50 mb-8">La page &laquo; {slug} &raquo; n&apos;existe pas ou n&apos;est pas encore publiée.</p>
            <Link href="/site" className="bg-primary-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm">
                Retour à l&apos;accueil
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 font-sans relative">
            <div className="absolute top-0 inset-x-0 h-[50vh] bg-primary-950 -z-10" />
            <div className="absolute top-0 inset-x-0 h-[50vh] islamic-pattern opacity-5 -z-10" />

            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-32 relative">
                <Link href="/site" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-accent-gold uppercase tracking-[0.3em] transition-all mb-12 group">
                    <span className="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </span>
                    Retour au Hub
                </Link>

                <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-dark-800 overflow-hidden">
                    <div className="p-8 md:p-16 border-b border-slate-50 dark:border-dark-800 bg-slate-50/50">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <span className="bg-primary-950 text-accent-gold px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/5">
                                {page.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif font-black text-primary-950 dark:text-white leading-[0.95] tracking-tighter cinzel-title uppercase">
                                {page.title}
                            </h1>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="h-px w-8 bg-slate-200" />
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                                    Mis à jour le {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <div className="h-px w-8 bg-slate-200" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-20">
                        {page.excerpt && (
                            <div className="mb-12 p-8 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] border-l-8 border-accent-gold">
                                <p className="text-xl text-primary-900 dark:text-primary-100 font-medium italic leading-relaxed">
                                    &ldquo;{page.excerpt}&rdquo;
                                </p>
                            </div>
                        )}
                        <article className="prose prose-xl prose-slate dark:prose-invert max-w-none 
                            prose-headings:font-serif prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:cinzel-title 
                            prose-h2:text-4xl prose-h2:text-primary-950 prose-h2:mt-16 prose-h2:mb-6
                            prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
                            prose-strong:text-primary-950 prose-strong:font-black
                            prose-li:text-slate-600 prose-li:font-medium">
                            <div dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
                        </article>
                    </div>
                </div>

                <div className="mt-16 flex justify-center">
                    <Link href="/site" className="inline-flex items-center gap-4 px-10 py-5 bg-primary-950 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-black transition-all hover:-translate-y-1">
                        <span className="material-symbols-outlined text-sm">home</span>
                        Accueil du Centre
                    </Link>
                </div>
            </div>
        </div>
    );
}
