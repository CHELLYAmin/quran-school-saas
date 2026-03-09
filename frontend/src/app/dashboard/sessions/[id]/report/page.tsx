import SessionReportClient from './SessionReportClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function SessionReportPage() {
    return <SessionReportClient />;
}
