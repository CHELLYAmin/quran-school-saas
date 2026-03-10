import LevelDetailsClient from './LevelDetailsClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function LevelDetailPage() {
    return <LevelDetailsClient />;
}
