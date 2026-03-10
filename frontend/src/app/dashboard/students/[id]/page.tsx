import StudentDetailsClient from './StudentDetailsClient';


export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function StudentDetailsPage() {
    return <StudentDetailsClient />;
}
