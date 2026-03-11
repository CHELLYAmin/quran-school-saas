'use client';

import { FiBriefcase, FiUsers, FiClock, FiCalendar, FiPlus, FiSearch, FiFilter, FiMoreVertical } from 'react-icons/fi';

export default function StaffManagementPage() {
    const staff = [
        { id: 1, name: 'Ahmed Mansour', role: 'Enseignant Quran', status: 'Actif', type: 'CDI', joined: '12 Jan 2023' },
        { id: 2, name: 'Sara Kamel', role: 'Secrétaire Administrative', status: 'Actif', type: 'CDD', joined: '05 Mar 2024' },
        { id: 3, name: 'Omar Farouk', role: 'Imam / Directeur Pédagogique', status: 'En Congé', type: 'CDI', joined: '15 Sep 2022' },
        { id: 4, name: 'Yusuf Idrisi', role: 'Maintenance & Logistique', status: 'Actif', type: 'Prestataire', joined: '10 Feb 2024' },
    ];

    const stats = [
        { label: 'Total Personnel', value: '14', icon: <FiUsers />, color: 'primary' },
        { label: 'Contrats Actifs', value: '12', icon: <FiBriefcase />, color: 'emerald' },
        { label: 'Absences (Mois)', value: '3', icon: <FiClock />, color: 'amber' },
        { label: 'Postes à Pourvoir', value: '2', icon: <FiPlus />, color: 'rose' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Ressources Humaines</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 font-medium">Gestion des contrats, des membres du personnel et des absences.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <FiCalendar /> Planning
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <FiPlus /> Ajouter un Membre
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 flex items-center gap-4 group hover:border-primary-500/50 transition-all">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                            ${stat.color === 'primary' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : ''}
                            ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : ''}
                            ${stat.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : ''}
                            ${stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : ''}
                        `}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-dark-900 dark:text-white leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un membre du personnel..." 
                        className="input pl-12 h-12"
                    />
                </div>
                <button className="btn btn-secondary flex items-center gap-2 h-12">
                    <FiFilter /> Filtres
                </button>
            </div>

            {/* Staff Table */}
            <div className="card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-dark-50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-700/50">
                            <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Nom & Prénom</th>
                            <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Rôle</th>
                            <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Type Contrat</th>
                            <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest">Date d'embauche</th>
                            <th className="px-6 py-4 text-xs font-black text-dark-400 uppercase tracking-widest text-center">Statut</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-dark-100 flex items-center justify-center font-black text-dark-500">
                                            {member.name.charAt(0)}
                                        </div>
                                        <span className="font-black text-dark-900 dark:text-white">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-dark-600 dark:text-dark-300">{member.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-black px-2 py-1 rounded bg-dark-100 dark:bg-dark-800 text-dark-500 tracking-wider">
                                        {member.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-dark-500">{member.joined}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter
                                        ${member.status === 'Actif' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}
                                    `}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-400">
                                        <FiMoreVertical />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
