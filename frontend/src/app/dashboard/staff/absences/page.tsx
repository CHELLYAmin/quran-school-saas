'use client';
import { useState } from 'react';
import { FiPlus, FiCalendar, FiUser, FiCheck, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AbsencesPage() {
    const [search, setSearch] = useState('');

    const [absences, setAbsences] = useState([
        { id: '1', staff: 'Ahmed Ali', type: 'Maladie', date: '2024-03-10', status: 'Approuvé' },
        { id: '2', staff: 'Sara Mansour', type: 'Congé', date: '2024-03-12', status: 'En attente' },
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAbsence, setNewAbsence] = useState({
        staff: '',
        type: 'Congé',
        date: new Date().toISOString().split('T')[0]
    });

    const handleCreateAbsence = (e: React.FormEvent) => {
        e.preventDefault();
        const absenceToAdd = {
            id: Math.random().toString(36).substr(2, 9),
            ...newAbsence,
            status: 'En attente'
        };
        setAbsences([absenceToAdd, ...absences]);
        setShowCreateModal(false);
        setNewAbsence({ staff: '', type: 'Congé', date: new Date().toISOString().split('T')[0] });
        toast.success("Demande d'absence enregistrée");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiCalendar className="text-primary-600" /> Gestion des Absences
                    </h1>
                    <p className="text-dark-400 mt-1 text-sm">Suivi des présences et justificatifs de l'équipe</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/20"
                >
                    <FiPlus size={16} /> Déclarer une absence
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Aujourd'hui</p>
                    <p className="text-2xl font-black text-primary-600">2 membres</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">En attente</p>
                    <p className="text-2xl font-black text-amber-500">1 demande</p>
                </div>
                <div className="bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Taux de présence</p>
                    <p className="text-2xl font-black text-green-500">94%</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="p-4 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
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
                                <th className="px-6 py-4">Membre</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                            {absences.filter(a => a.staff.toLowerCase().includes(search.toLowerCase())).map(abs => (
                                <tr key={abs.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                {abs.staff.charAt(0)}
                                            </div>
                                            <span className="font-bold text-dark-900 dark:text-white text-sm">{abs.staff}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-dark-500 font-medium">{abs.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-dark-500">{abs.date}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            abs.status === 'Approuvé' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                        }`}>
                                            {abs.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-dark-400 hover:text-primary-600 transition-colors p-1">
                                            <FiAlertCircle />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-dark-100 dark:border-dark-800 animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-dark-900 dark:text-white tracking-tight">Déclarer une Absence</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-xl">
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAbsence} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1">Nom du Membre</label>
                                <input required type="text" value={newAbsence.staff} onChange={e => setNewAbsence({...newAbsence, staff: e.target.value})}
                                    className="input w-full" placeholder="Ex: Ahmed Mansour" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1">Date</label>
                                    <input required type="date" value={newAbsence.date} onChange={e => setNewAbsence({...newAbsence, date: e.target.value})}
                                        className="input w-full" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1">Type</label>
                                    <select value={newAbsence.type} onChange={e => setNewAbsence({...newAbsence, type: e.target.value})}
                                        className="input w-full">
                                        <option value="Congé">Congé</option>
                                        <option value="Maladie">Maladie</option>
                                        <option value="Urgence Famille">Urgence Famille</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all mt-4">
                                Enregistrer la demande
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
