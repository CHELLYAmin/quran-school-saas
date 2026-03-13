'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiPieChart, FiUsers, FiClock } from 'react-icons/fi';
import { financeApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function FinanceDashboardPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFinanceData() {
            setLoading(true);
            try {
                const [summaryRes, transRes] = await Promise.all([
                    financeApi.getSummary(),
                    financeApi.getTransactions({ limit: 5 })
                ]);
                
                const summary = summaryRes.data;
                setStats([
                    { label: 'Solde Total', value: `${summary.totalBalance.toLocaleString()} €`, change: `${summary.balanceChange}%`, icon: <FiDollarSign />, color: 'primary' },
                    { label: 'Revenus (Mois)', value: `${summary.monthlyRevenue.toLocaleString()} €`, change: `${summary.revenueChange}%`, icon: <FiArrowUpRight />, color: 'emerald' },
                    { label: 'Dépenses (Mois)', value: `${summary.monthlyExpenses.toLocaleString()} €`, change: `${summary.expenseChange}%`, icon: <FiArrowDownLeft />, color: 'rose' },
                    { label: 'Dons Reçus', value: `${summary.totalDonations.toLocaleString()} €`, change: `${summary.donationsChange}%`, icon: <FiUsers />, color: 'amber' },
                ]);

                setTransactions(transRes.data);
            } catch (err) {
                console.error(err);
                toast.error("Erreur lors du chargement des finances réelles");
            } finally {
                setLoading(false);
            }
        }
        loadFinanceData();
    }, []);

    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Finances & Pilotage</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 font-medium">Vue d'ensemble de la santé financière de votre centre.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <FiPieChart /> Rapports
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <FiDollarSign /> Nouvelle Transaction
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 flex flex-col gap-4 group hover:border-primary-500/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner
                                ${stat.color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : ''}
                                ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : ''}
                                ${stat.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : ''}
                                ${stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : ''}
                            `}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') || parseFloat(stat.change) > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                                {stat.change.startsWith('+') || stat.change.startsWith('-') ? stat.change : (parseFloat(stat.change) > 0 ? `+${stat.change}%` : `${stat.change}%`)}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-dark-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-dark-900 dark:text-white flex items-center gap-2">
                            <FiClock className="text-primary-500" /> Transactions Récentes
                        </h2>
                        <button className="text-sm font-bold text-primary-600 hover:underline">Voir tout</button>
                    </div>
                    
                    <div className="card overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark-50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-700/50">
                                    <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Catégorie</th>
                                    <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest text-right">Montant</th>
                                    <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-dark-400 font-medium">Aucune transaction trouvée</td></tr>
                                ) : transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                                    ${tx.type === 'Revenue' || tx.type === 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}
                                                `}>
                                                    {tx.type === 'Revenue' || tx.type === 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                                                </div>
                                                <span className="font-bold text-dark-700 dark:text-dark-200">{tx.categoryName || tx.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-dark-500">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className={`px-6 py-4 text-sm font-black text-right ${tx.type === 'Revenue' || tx.type === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.type === 'Revenue' || tx.type === 0 ? '+' : '-'}{tx.amount.toLocaleString()} €
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter
                                                ${tx.status === 'Completed' || tx.status === 1 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}
                                            `}>
                                                {tx.status === 'Completed' || tx.status === 1 ? 'Complété' : 'En attente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel - Simple placeholder for logic */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-dark-900 dark:text-white flex items-center gap-2">
                        <FiTrendingUp className="text-primary-500" /> Pilotage
                    </h2>
                    <div className="card p-8 flex flex-col items-center justify-center gap-6">
                        <p className="text-dark-500 text-sm text-center">Les analyses détaillées de budget seront disponibles dès que suffisamment de transactions seront enregistrées.</p>
                        <div className="w-16 h-1 w-full bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 w-1/3 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
