'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { paymentApi } from '@/lib/api/client';
import { stripePromise } from '@/lib/stripe';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

export default function PaymentPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [payment, setPayment] = useState<any>(null);

    useEffect(() => {
        if (id) {
            paymentApi.getById(id as string).then(res => setPayment(res.data));
        }
    }, [id]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const successUrl = `${window.location.origin}/dashboard/parent/payments/success`;
            const cancelUrl = `${window.location.origin}/dashboard/parent/payments/cancel`;

            const { data } = await paymentApi.createCheckoutSession(id as string, successUrl, cancelUrl);

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Erreur lors de la création de la session de paiement.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (!payment) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Règlement des Frais Scolaires</h1>

            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-dark-200 dark:border-dark-700 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-dark-500">Étudiant</span>
                    <span className="font-semibold">{payment.studentName}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-dark-500">Description</span>
                    <span>{payment.description}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-dark-500">Date d'échéance</span>
                    <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="border-t border-dark-100 dark:border-dark-700 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">Montant Total</span>
                    <span className="text-2xl font-bold text-primary-600">{payment.amount} €</span>
                </div>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
                {loading ? 'Redirection vers Stripe...' : 'Payer maintenant avec Stripe'}
            </button>

            <p className="text-center text-dark-400 text-sm mt-4">
                Paiement sécurisé via Stripe. Aucune coordonnée bancaire n'est stockée sur nos serveurs.
            </p>
        </div>
    );
}
