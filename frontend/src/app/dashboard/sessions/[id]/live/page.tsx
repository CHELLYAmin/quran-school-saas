import VirtualClassroomClient from './VirtualClassroomClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function VirtualClassroomPage() {
    return <VirtualClassroomClient />;
}
