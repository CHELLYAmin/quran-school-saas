'use client';

import { FiTrendingUp, FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiPieChart, FiUsers, FiClock } from 'react-icons/fi';

export default function FinanceDashboardPage() {
    const stats = [
        { label: 'Solde Total', value: '45,280.00 €', change: '+12.5%', icon: <FiDollarSign />, color: 'primary' },
        { label: 'Revenus (Mois)', value: '12,450.00 €', change: '+8.2%', icon: <FiArrowUpRight />, color: 'emerald' },
        { label: 'Dépenses (Mois)', value: '3,120.00 €', change: '-5.1%', icon: <FiArrowDownLeft />, color: 'rose' },
        { label: 'Dons Reçus', value: '8,900.00 €', change: '+15.3%', icon: <FiUsers />, color: 'amber' },
    ];

    const recentTransactions = [
        { id: 1, type: 'Revenue', category: 'Cotisation', amount: '+120.00 €', date: 'Aujourd\'hui', status: 'Complété' },
        { id: 2, type: 'Expense', category: 'Loyer', amount: '-1,200.00 €', date: 'Hier', status: 'Complété' },
        { id: 3, type: 'Revenue', category: 'Don Projet Mosquée', amount: '+500.00 €', date: 'Il y a 2 jours', status: 'Complété' },
        { id: 4, type: 'Revenue', category: 'Don de Zakat', amount: '+2,000.00 €', date: 'Il y a 3 jours', status: 'En attente' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                                {stat.change}
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
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                                    ${tx.type === 'Revenue' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}
                                                `}>
                                                    {tx.type === 'Revenue' ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                                                </div>
                                                <span className="font-bold text-dark-700 dark:text-dark-200">{tx.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-dark-500">{tx.date}</td>
                                        <td className={`px-6 py-4 text-sm font-black text-right ${tx.type === 'Revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.amount}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter
                                                ${tx.status === 'Complété' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}
                                            `}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel - Budget Distribution (Mock) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-dark-900 dark:text-white flex items-center gap-2">
                        <FiTrendingUp className="text-primary-500" /> Répartition Budget
                    </h2>
                    <div className="card p-8 flex flex-col items-center justify-center gap-6">
                        {/* Mock Chart */}
                        <div className="relative w-40 h-40">
                            <div className="absolute inset-0 rounded-full border-[12px] border-dark-100 dark:border-dark-800" />
                            <div className="absolute inset-0 rounded-full border-[12px] border-primary-500 border-t-transparent border-l-transparent rotate-45" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-dark-900 dark:text-white">68%</span>
                                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Utilisé</span>
                            </div>
                        </div>
                        
                        <div className="w-full space-y-4">
                            {[
                                { label: 'Scolaire', amount: '12,500 €', color: 'bg-primary-500' },
                                { label: 'Entretien', amount: '4,200 €', color: 'bg-amber-500' },
                                { label: 'Événements', amount: '2,800 €', color: 'bg-emerald-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="font-bold text-dark-600 dark:text-dark-300">{item.label}</span>
                                    </div>
                                    <span className="font-black text-dark-900 dark:text-white">{item.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
