import VolunteerDetailClient from './VolunteerDetailClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function VolunteerDetailPage({ params }: { params: { id: string } }) {
    return <VolunteerDetailClient id={params.id} />;
}
