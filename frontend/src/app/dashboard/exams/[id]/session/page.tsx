import ExamSessionClient from './ExamSessionClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ExamSessionPage() {
    return <ExamSessionClient />;
}
