import CmsPageClient from './CmsPageClient';

export function generateStaticParams() {
    return [{ slug: 'accueil' }];
}

export default function SiteSlugPage({ params }: { params: { slug: string } }) {
    return <CmsPageClient slug={params.slug} />;
}
