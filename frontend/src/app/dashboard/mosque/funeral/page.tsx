'use client';

import { useState } from 'react';
import { FiPlus, FiSearch, FiPhone, FiMail, FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiUser, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface FuneralRequest {
    id: string;
    deceasedName: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    dateOfDeath: string;
    requestedDate: string;
    services: string[];
    status: 'pending' | 'confirmed' | 'completed';
    notes?: string;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'En attente' },
    confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'Confirmé' },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Terminé' },
};

const SERVICES_LIST = ['Lavage mortuaire (Ghousl)', 'Prière funéraire (Salat al-Janaza)', 'Transport au cimetière', 'Assistance administrative', 'Soutien à la famille'];

export default function FuneralPage() {
    const [requests, setRequests] = useState<FuneralRequest[]>([
        { id: '1', deceasedName: 'Mohammed Ali Ben Salah', contactName: 'Ahmed Ben Salah', contactPhone: '418-555-1234', dateOfDeath: '2026-03-06', requestedDate: '2026-03-07', services: ['Lavage mortuaire (Ghousl)', 'Prière funéraire (Salat al-Janaza)', 'Transport au cimetière'], status: 'completed', notes: 'Famille réside à Sainte-Foy.' },
        { id: '2', deceasedName: 'Fatima Zahra Ouali', contactName: 'Omar Ouali', contactPhone: '418-555-5678', dateOfDeath: '2026-03-08', requestedDate: '2026-03-09', services: ['Lavage mortuaire (Ghousl)', 'Prière funéraire (Salat al-Janaza)'], status: 'pending' },
    ]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const filtered = requests
        .filter(r => statusFilter === 'all' || r.status === statusFilter)
        .filter(r => r.deceasedName.toLowerCase().includes(search.toLowerCase()) || r.contactName.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Service Funéraire</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Gestion des demandes de services funéraires islamiques</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10">
                    <FiPlus size={20} /> Nouvelle demande
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'En attente', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Confirmées', value: requests.filter(r => r.status === 'confirmed').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Terminées', value: requests.filter(r => r.status === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-3xl p-6 border border-dark-100 dark:border-dark-800`}>
                        <p className="text-sm font-bold text-dark-400">{s.label}</p>
                        <p className={`text-3xl font-extrabold ${s.color} mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                    <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11 w-full" />
                </div>
                <div className="flex bg-dark-50 dark:bg-dark-800 p-1 rounded-2xl border border-dark-100 dark:border-dark-700">
                    {[{ id: 'all', label: 'Tous' }, ...Object.entries(STATUS_CFG).map(([id, v]) => ({ id, label: v.label }))].map(f => (
                        <button key={f.id} onClick={() => setStatusFilter(f.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === f.id ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm' : 'text-dark-400 hover:text-dark-600'}`}
                        >{f.label}</button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-16 text-center">
                        <FiFileText size={48} className="mx-auto text-dark-200 dark:text-dark-700 mb-4" />
                        <p className="text-dark-400 font-bold">Aucune demande trouvée</p>
                    </div>
                ) : filtered.map(req => {
                    const cfg = STATUS_CFG[req.status];
                    return (
                        <div key={req.id} className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white">{req.deceasedName}</h3>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text} border border-current/10`}>{cfg.label}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-dark-500">
                                        <span className="flex items-center gap-1.5"><FiUser size={14} /> {req.contactName}</span>
                                        <span className="flex items-center gap-1.5"><FiPhone size={14} /> {req.contactPhone}</span>
                                        <span className="flex items-center gap-1.5"><FiCalendar size={14} /> Décès : {req.dateOfDeath}</span>
                                        <span className="flex items-center gap-1.5"><FiClock size={14} /> Prévu : {req.requestedDate}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {req.services.map(s => (
                                            <span key={s} className="text-[10px] font-bold bg-dark-50 dark:bg-dark-800 text-dark-500 px-2.5 py-1 rounded-lg border border-dark-100 dark:border-dark-700">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {req.status === 'pending' && (
                                        <button onClick={() => { setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'confirmed' } : r)); toast.success('Demande confirmée'); }}
                                            className="btn bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 px-4 py-2.5 rounded-xl text-sm font-bold">
                                            <FiCheckCircle size={16} className="mr-1 inline" /> Confirmer
                                        </button>
                                    )}
                                    {req.status === 'confirmed' && (
                                        <button onClick={() => { setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'completed' } : r)); toast.success('Service marqué terminé'); }}
                                            className="btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 px-4 py-2.5 rounded-xl text-sm font-bold">
                                            <FiCheckCircle size={16} className="mr-1 inline" /> Terminer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info section - Services offered */}
            <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Services proposés</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICES_LIST.map(s => (
                        <div key={s} className="flex items-center gap-3 p-4 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
                            <FiCheckCircle size={18} className="text-primary-600 shrink-0" />
                            <span className="text-sm font-bold text-dark-700 dark:text-dark-300">{s}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
