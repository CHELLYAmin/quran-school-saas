'use client';
import { useState } from 'react';
import { FiPlus, FiBriefcase, FiTarget, FiCheck, FiX, FiSearch, FiPieChart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
    const [search, setSearch] = useState('');

    const mockProjects = [
        { id: '1', name: 'Rénovation Salle de Prière', budget: '15,000 €', raised: '12,500 €', status: 'En cours' },
        { id: '2', name: 'Achat Livres Scolaires', budget: '2,000 €', raised: '2,000 €', status: 'Terminé' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiBriefcase className="text-blue-600" /> Projets & Budgets
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm">Planifiez et suivez le financement de vos projets</p>
                </div>
                <button 
                    onClick={() => toast.success("Ouverture du formulaire de nouveau projet...")}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <FiPlus size={16} /> Nouveau projet
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Projets actifs</p>
                    <p className="text-2xl font-black text-blue-600">3</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Objectif global</p>
                    <p className="text-2xl font-black text-primary-600">45,000 €</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Réalisé</p>
                    <p className="text-2xl font-black text-green-500">28,300 €</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="p-4 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un projet..." 
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
                                <th className="px-6 py-4">Projet</th>
                                <th className="px-6 py-4">Budget</th>
                                <th className="px-6 py-4">Récolté</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                            {mockProjects.map(project => (
                                <tr key={project.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-dark-900 dark:text-white text-sm">{project.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-dark-500 font-medium">{project.budget}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-green-600">{project.raised}</span>
                                            <div className="w-24 h-1.5 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500" 
                                                    style={{ width: `${(parseFloat(project.raised.replace(/\s/g, '')) / parseFloat(project.budget.replace(/\s/g, ''))) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            project.status === 'Terminé' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-dark-400 hover:text-blue-600 transition-colors p-1">
                                            <FiPieChart />
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
