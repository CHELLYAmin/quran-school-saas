import { Metadata } from 'next';
import CmsPageClient from './CmsPageClient';
import api from '@/lib/api/client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        // Use the internal client for fetching metadata on server side
        const res = await api.get(`/api/cms/pages/${slug}`);
        const page = res.data;
        
        return {
            title: page.seoTitle || `${page.title} | CCIQ`,
            description: page.seoDescription || page.excerpt || 'Portail officiel du Centre Culturel Islamique de Québec',
            openGraph: {
                title: page.seoTitle || page.title,
                description: page.seoDescription || page.excerpt,
                images: page.metaImage ? [{ url: page.metaImage }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: page.seoTitle || page.title,
                description: page.seoDescription || page.excerpt,
                images: page.metaImage ? [page.metaImage] : [],
            }
        };
    } catch (e) {
        return {
            title: 'CCIQ - École Al-Noor',
            description: 'Centre Culturel Islamique de Québec'
        };
    }
}

export function generateStaticParams() {
    return [
        { slug: 'home' },
        { slug: 'historique' },
        { slug: 'islam' },
        { slug: 'services' },
        { slug: 'cimetiere' },
        { slug: 'ramadan-2026' }
    ];
}

export default async function SiteSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <CmsPageClient slug={slug} />;
}
