import CmsPageClient from './CmsPageClient';

export function generateStaticParams() {
    return [
        { slug: 'accueil' },
        { slug: 'islam' },
        { slug: 'centre' },
        { slug: 'cimetiere' },
        { slug: 'services' },
        { slug: 'ecole' },
        { slug: 'jeunesse' },
        { slug: 'activites' },
        { slug: 'don' },
        { slug: 'benevolat' }
    ];
}

export default function SiteSlugPage({ params }: { params: { slug: string } }) {
    return <CmsPageClient slug={params.slug} />;
}
