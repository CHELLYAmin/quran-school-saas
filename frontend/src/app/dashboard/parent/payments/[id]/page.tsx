import PaymentClient from './PaymentClient';

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function PaymentPage() {
    return <PaymentClient />;
}
