import SessionCockpitClient from './SessionCockpitClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function SessionCockpitPage() {
    return <SessionCockpitClient />;
}
