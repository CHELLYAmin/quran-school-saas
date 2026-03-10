import HomeworkDetailsClient from './HomeworkDetailsClient';


export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function HomeworkDetailsPage() {
    return <HomeworkDetailsClient />;
}
