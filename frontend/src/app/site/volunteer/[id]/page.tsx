import VolunteerDetailClient from './VolunteerDetailClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <VolunteerDetailClient id={id} />;
}
