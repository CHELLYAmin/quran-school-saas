import { Metadata } from 'next';
import CmsPageClient from './CmsPageClient';
import api from '@/lib/api/client';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        // Use the internal client for fetching metadata on server side
        const res = await api.get(`/api/cms/pages/${params.slug}`);
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
    // Keep as empty array to allow dynamic generation or add common slugs
    return [
        { slug: 'home' },
        { slug: 'centre' },
        { slug: 'hub' },
        { slug: 'islam' }
    ];
}

export default function SiteSlugPage({ params }: { params: { slug: string } }) {
    return <CmsPageClient slug={params.slug} />;
}
