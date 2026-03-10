import DonationDetailClient from './DonationDetailClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function DonationDetailPage({ params }: { params: { id: string } }) {
    return <DonationDetailClient id={params.id} />;
}
