import GroupDetailsClient from './GroupDetailsClient';


export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function GroupDetailsPage() {
    return <GroupDetailsClient />;
}
