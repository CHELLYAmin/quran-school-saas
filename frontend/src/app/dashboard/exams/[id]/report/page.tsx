import ExamReportClient from './ExamReportClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function ExamReportPage() {
    return <ExamReportClient />;
}
