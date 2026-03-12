'use client';

import React, { useState } from 'react';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownLeft, FiSearch, FiFilter, FiDownload, FiDollarSign } from 'react-icons/fi';

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const transactions = [
        { id: 'TX-9021', type: 'Revenue', category: 'Cotisation Scolaire', amount: '+150.00 €', date: '12/03/2025', account: 'Compte Principal', status: 'Complété', description: 'Janvier - Youssef Z.' },
        { id: 'TX-9020', type: 'Expense', category: 'Fournitures Bureau', amount: '-45.50 €', date: '11/03/2025', account: 'Caisse', status: 'Complété', description: 'Papeterie' },
        { id: 'TX-9019', type: 'Revenue', category: 'Don Projet Mosquée', amount: '+500.00 €', date: '10/03/2025', account: 'Compte Dons', status: 'Complété', description: 'Don anonyme' },
        { id: 'TX-9018', type: 'Revenue', category: 'Cotisation Scolaire', amount: '+150.00 €', date: '10/03/2025', account: 'Compte Principal', status: 'En attente', description: 'Janvier - Amina Z.' },
        { id: 'TX-9017', type: 'Expense', category: 'Maintenance', amount: '-1,200.00 €', date: '08/03/2025', account: 'Compte Principal', status: 'Complété', description: 'Réparation Toiture' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Registre des Transactions</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 font-medium">Historique complet du Grand Livre financier.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <FiDownload /> Exporter CSV
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <FiDollarSign /> Saisir manuellement
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par ID, description ou compte..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl pl-12 pr-6 py-3 outline-none font-medium transition-all"
                    />
                </div>
                <button className="btn bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 text-dark-700 dark:text-dark-300 flex items-center gap-2">
                    <FiFilter /> Filtres avancés
                </button>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-dark-50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-700/50">
                                <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">ID / Date</th>
                                <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Compte</th>
                                <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest text-right">Montant</th>
                                <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary-600 dark:text-primary-400 text-xs">{tx.id}</span>
                                            <span className="text-dark-400 text-[10px] font-bold mt-0.5 uppercase">{tx.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-dark-800 dark:text-white">{tx.category}</span>
                                            <span className="text-dark-500 text-xs italic">{tx.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-dark-600 dark:text-dark-400 bg-dark-50 dark:bg-dark-800 px-3 py-1 rounded-lg">
                                            {tx.account}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-black text-right ${tx.type === 'Revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.amount}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest
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

            {/* Summary Footer Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 border-l-4 border-emerald-500 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Total Entrées</p>
                    <h4 className="text-2xl font-black text-emerald-600 tracking-tight">+802.00 €</h4>
                </div>
                <div className="card p-6 border-l-4 border-rose-500 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Total Sorties</p>
                    <h4 className="text-2xl font-black text-rose-600 tracking-tight">-1,245.50 €</h4>
                </div>
                <div className="card p-6 border-l-4 border-primary-500 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Total TVA/Frais</p>
                    <h4 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">12.00 €</h4>
                </div>
                <div className="card p-6 border-l-4 border-accent-gold flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Balance Période</p>
                    <h4 className="text-2xl font-black text-accent-gold tracking-tight">-443.50 €</h4>
                </div>
            </div>
        </div>
    );
}
