'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function SiteSlugPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (slug) loadPage();
    }, [slug]);

    const loadPage = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/cms/pages/${slug}`);
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

    // Simple markdown to HTML
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
            <p className="text-dark-500 mb-8">La page &laquo; {slug} &raquo; n&apos;existe pas ou n&apos;est pas encore publiée.</p>
            <Link href="/site" className="bg-primary-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all">
                Retour à l&apos;accueil
            </Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 md:py-24">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-dark-400 uppercase tracking-widest mb-8">
                <Link href="/site" className="hover:text-primary-600 transition-colors">Accueil</Link>
                <span>/</span>
                <span className="text-primary-600">{page.title}</span>
            </div>

            {/* Category Badge */}
            <span className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.3em] bg-accent-gold/10 px-4 py-1.5 rounded-full border border-accent-gold/20">
                {page.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-serif font-black text-dark-900 dark:text-white mt-6 leading-tight tracking-tight">
                {page.title}
            </h1>

            {/* Date */}
            <p className="text-sm text-dark-400 font-medium mt-4">
                Publié le {new Date(page.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-accent-gold/40 via-accent-gold/10 to-transparent my-8"></div>

            {/* Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
            </article>

            {/* Back Link */}
            <div className="mt-16 pt-8 border-t border-dark-100 dark:border-dark-800">
                <Link href="/site" className="text-sm font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Retour à l&apos;accueil
                </Link>
            </div>
        </div>
    );
}
