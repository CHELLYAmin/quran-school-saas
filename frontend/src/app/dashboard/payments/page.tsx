'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { PaymentStatus } from '@/types';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiClock, FiPlus, FiCreditCard, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockPayments = [
    { id: '1', studentName: 'Youssef Zahra', amount: 150, dueDate: '2025-01-01', paidDate: '2025-01-03', status: PaymentStatus.Paid, description: 'Janvier 2025' },
    { id: '2', studentName: 'Amina Zahra', amount: 150, dueDate: '2025-01-01', paidDate: '2025-01-03', status: PaymentStatus.Paid, description: 'Janvier 2025', discount: 30, discountReason: 'Réduction fratrie' },
    { id: '3', studentName: 'Mohamed Ali', amount: 180, dueDate: '2025-01-01', status: PaymentStatus.Overdue, description: 'Janvier 2025' },
    { id: '4', studentName: 'Youssef Zahra', amount: 150, dueDate: '2025-02-01', status: PaymentStatus.Pending, description: 'Février 2025' },
    { id: '5', studentName: 'Amina Zahra', amount: 120, dueDate: '2025-02-01', status: PaymentStatus.Pending, description: 'Février 2025', discount: 30, discountReason: 'Réduction fratrie' },
    { id: '6', studentName: 'Ibrahim Hassan', amount: 180, dueDate: '2025-01-01', paidDate: '2024-12-28', status: PaymentStatus.Paid, description: 'Janvier 2025' },
];

const statusConfig: Record<PaymentStatus, { color: string; label: string; icon: any }> = {
    [PaymentStatus.Paid]: { color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', label: 'Payé', icon: <FiTrendingUp size={14} /> },
    [PaymentStatus.Pending]: { color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', label: 'En attente', icon: <FiClock size={14} /> },
    [PaymentStatus.Overdue]: { color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300', label: 'En retard', icon: <FiAlertTriangle size={14} /> },
    [PaymentStatus.Cancelled]: { color: 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300', label: 'Annulé', icon: <FiClock size={14} /> },
    [PaymentStatus.Refunded]: { color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', label: 'Remboursé', icon: <FiDollarSign size={14} /> },
};

export default function PaymentsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [filter, setFilter] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedPaymentForInterac, setSelectedPaymentForInterac] = useState<any>(null);

    const filtered = filter === 'all' ? mockPayments : mockPayments.filter(p => p.status === filter);
    const totalRevenue = mockPayments.filter(p => p.status === PaymentStatus.Paid).reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = mockPayments.filter(p => p.status === PaymentStatus.Overdue).reduce((sum, p) => sum + p.amount, 0);
    const totalPending = mockPayments.filter(p => p.status === PaymentStatus.Pending).reduce((sum, p) => sum + p.amount, 0);


    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.common.payments}</h1>
                    <p className="text-dark-500 mt-2 text-lg">Suivi de la facturation et des encaissements</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:-translate-y-1 transition-all"
                >
                    <FiPlus size={18} /> Nouveau paiement
                </button>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-xl border border-dark-100 dark:border-dark-800 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-dark-500 mb-2">Revenus collectés</p>
                        <p className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{totalRevenue} €</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                        <FiTrendingUp size={28} />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-xl border border-dark-100 dark:border-dark-800 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-dark-500 mb-2">En retard</p>
                        <p className="text-4xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">{totalOverdue} €</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform">
                        <FiAlertTriangle size={28} />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-xl border border-dark-100 dark:border-dark-800 flex items-center justify-between group hover:-translate-y-1 transition-transform">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-dark-500 mb-2">En attente</p>
                        <p className="text-4xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">{totalPending} €</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                        <FiClock size={28} />
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                            <FiPlus size={20} />
                        </span>
                        Enregistrer un paiement
                    </h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Élève</label>
                            <select className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all appearance-none cursor-pointer">
                                <option>Sélectionner un élève</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Montant (€)</label>
                            <input type="number" placeholder="ex: 150" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Date d'échéance</label>
                            <input type="date" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all text-dark-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Description</label>
                            <input type="text" placeholder="ex: Frais scolarité Février" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Réduction (€)</label>
                            <input type="number" placeholder="ex: 30" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500">Raison de la réduction</label>
                            <input type="text" placeholder="ex: Fratrie" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-medium transition-all" />
                        </div>

                        <div className="md:col-span-2 flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-500/30 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider">
                                {t.common.save}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-bold py-4 rounded-xl flex items-center justify-center transition-all text-sm uppercase tracking-wider">
                                {t.common.cancel}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Interac Modal */}
            {selectedPaymentForInterac && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPaymentForInterac(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-dark-900 rounded-[2rem] shadow-2xl p-8 border border-dark-100 dark:border-dark-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-600 p-2 rounded-xl">
                                    <FiCreditCard />
                                </span>
                                Paiement Interac
                            </h3>
                            <button onClick={() => setSelectedPaymentForInterac(null)} className="text-dark-400 hover:text-dark-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm mb-8">
                            <p className="font-medium text-dark-600 dark:text-dark-300">Veuillez effectuer votre virement Interac pour le règlement de <strong className="text-dark-900 dark:text-white">{selectedPaymentForInterac.amount} €</strong> ({selectedPaymentForInterac.description}) avec les informations suivantes :</p>

                            <div className="bg-dark-50 dark:bg-dark-950 p-4 rounded-xl border border-dark-100 dark:border-dark-800 font-mono text-xs space-y-3">
                                <div>
                                    <span className="text-dark-400 block mb-1">Email du destinataire :</span>
                                    <span className="font-bold text-dark-900 dark:text-white text-base">paiement@quranschool.com</span>
                                </div>
                                <div>
                                    <span className="text-dark-400 block mb-1">Question de sécurité :</span>
                                    <span className="font-bold text-dark-900 dark:text-white">Matricule élève</span>
                                </div>
                                <div>
                                    <span className="text-dark-400 block mb-1">Réponse (Mot de passe) :</span>
                                    <span className="font-bold text-primary-600 dark:text-primary-400 text-sm tracking-widest">{selectedPaymentForInterac.studentName.replace(/ /g, '').toLowerCase()}2025</span>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                <FiInfo className="shrink-0 mt-0.5" />
                                <p className="text-xs font-medium">Une fois le virement envoyé depuis votre banque, cliquez sur le bouton ci-dessous. L'administration validera la réception manuellement.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    toast.success("Votre déclaration de paiement a été envoyée à l'administration.");
                                    setSelectedPaymentForInterac(null);
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                            >
                                J'ai envoyé le virement
                            </button>
                            <button
                                onClick={() => setSelectedPaymentForInterac(null)}
                                className="px-6 py-3.5 bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300 font-bold rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap bg-dark-50 dark:bg-dark-900 p-2 rounded-3xl border border-dark-100 dark:border-dark-800 w-fit">
                {[
                    { key: 'all', label: 'Tous' },
                    { key: PaymentStatus.Paid, label: 'Payés' },
                    { key: PaymentStatus.Pending, label: 'En attente' },
                    { key: PaymentStatus.Overdue, label: 'En retard' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === f.key
                            ? 'bg-white dark:bg-dark-800 shadow-md text-primary-600 dark:text-primary-400'
                            : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Payments List / Table */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-50 dark:bg-dark-950/50 border-b border-dark-100 dark:border-dark-800">
                            <tr>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Élève</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Description</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Échéance</th>
                                <th className="text-left p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Statut</th>
                                <th className="text-right p-6 text-xs font-bold uppercase tracking-widest text-dark-500">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                            {filtered.map((payment) => (
                                <tr key={payment.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-sm">
                                                {payment.studentName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-extrabold text-dark-900 dark:text-white">{payment.studentName}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-semibold text-dark-700 dark:text-dark-300 block">{payment.description}</span>
                                        {payment.discount && (
                                            <span className="inline-block mt-1 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                                                -{payment.discount}€ ({payment.discountReason})
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-medium text-dark-500 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg">
                                            {new Date(payment.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`${statusConfig[payment.status].color} px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-sm`}>
                                            {statusConfig[payment.status].icon}
                                            {statusConfig[payment.status].label}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            {payment.status === PaymentStatus.Pending && (
                                                <button
                                                    onClick={() => setSelectedPaymentForInterac(payment)}
                                                    className="opacity-0 group-hover:opacity-100 text-xs font-bold text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 dark:bg-purple-900/20 dark:hover:bg-purple-600 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    Payer par Interac
                                                </button>
                                            )}
                                            {payment.status === PaymentStatus.Overdue && (
                                                <button
                                                    onClick={() => setSelectedPaymentForInterac(payment)}
                                                    className="opacity-0 group-hover:opacity-100 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    Régler !
                                                </button>
                                            )}
                                            <span className="text-xl font-extrabold tracking-tight text-dark-900 dark:text-white w-20">
                                                {payment.amount} €
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-dark-400 font-medium">
                            Aucun paiement trouvé pour ce filtre.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
