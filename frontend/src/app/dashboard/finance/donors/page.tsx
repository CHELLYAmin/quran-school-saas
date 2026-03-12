'use client';
import { useState } from 'react';
import { FiPlus, FiHeart, FiUser, FiCheck, FiX, FiSearch, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DonorsPage() {
    const [search, setSearch] = useState('');

    const mockDonors = [
        { id: '1', name: 'Karim Mansour', total: '1,500 €', lastDonation: '2024-03-01', frequency: 'Mensuel' },
        { id: '2', name: 'Fatima Zahra', total: '450 €', lastDonation: '2024-02-15', frequency: 'Ponctuel' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiHeart className="text-pink-600" /> Donateurs & Mécènes
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm">Gérez la relation avec vos généreux contributeurs</p>
                </div>
                <button 
                    onClick={() => toast.success("Ouverture du formulaire de nouveau donateur...")}
                    className="btn bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-pink-500/20"
                >
                    <FiPlus size={16} /> Ajouter un donateur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Donateurs Actifs</p>
                    <p className="text-2xl font-black text-pink-600">124</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Dons ce mois</p>
                    <p className="text-2xl font-black text-green-500">8,420 €</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Fidélité moyenne</p>
                    <p className="text-2xl font-black text-blue-500">8.2 mois</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="p-4 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un donateur..." 
                            className="input pl-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-dark-50 dark:bg-dark-800/50 text-dark-400 text-[10px] uppercase font-bold tracking-widest">
                                <th className="px-6 py-4">Nom</th>
                                <th className="px-6 py-4">Total des dons</th>
                                <th className="px-6 py-4">Dernier don</th>
                                <th className="px-6 py-4">Fréquence</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                            {mockDonors.map(donor => (
                                <tr key={donor.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center font-bold text-xs">
                                                {donor.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-dark-900 dark:text-white text-sm">{donor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-green-600">{donor.total}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-dark-500">{donor.lastDonation}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            donor.frequency === 'Mensuel' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 
                                            'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-400'
                                        }`}>
                                            {donor.frequency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-dark-400 hover:text-pink-600 transition-colors p-1">
                                            <FiDollarSign />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
