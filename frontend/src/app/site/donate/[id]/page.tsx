import DonationDetailClient from './DonationDetailClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function DonationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DonationDetailClient id={id} />;
}
