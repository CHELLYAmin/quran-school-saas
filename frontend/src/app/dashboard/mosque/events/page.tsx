'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import {
    FiPlus, FiCalendar, FiMapPin, FiClock, FiUsers,
    FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiCheck, FiX,
    FiMessageSquare, FiTrendingUp, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface MosqueEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime?: string;
    location: string;
    isPublished: boolean;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    attendeesCount: number;
    category: string;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'À venir' },
    ongoing: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'En cours' },
    completed: { bg: 'bg-dark-50 dark:bg-dark-800', text: 'text-dark-500', label: 'Terminé' },
    cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Annulé' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EventsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [events, setEvents] = useState<MosqueEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    useEffect(() => { loadEvents(); }, []);

    const loadEvents = async () => {
        try {
            // Mock data for now
            setEvents([
                { id: '1', title: 'Conférence : Spiritualité en Islam', description: 'Une soirée d\'échanges sur la foi.', date: '2024-03-15', startTime: '19:00', endTime: '21:00', location: 'Grande Salle', isPublished: true, status: 'upcoming', attendeesCount: 120, category: 'Conférence' },
                { id: '2', title: 'Iftar Communautaire', description: 'Repas de rupture du jeûne pour tous.', date: '2024-03-20', startTime: '19:30', location: 'Salle Polyvalente', isPublished: true, status: 'upcoming', attendeesCount: 250, category: 'Social' },
                { id: '3', title: 'Atelier Tajwid Intensif', description: 'Perfectionnement de la lecture du Coran.', date: '2024-03-10', startTime: '09:00', endTime: '12:00', location: 'Classe 4', isPublished: true, status: 'completed', attendeesCount: 15, category: 'Éducation' },
                { id: '4', title: 'Collecte de Sang', description: 'Don de sang organisé à la mosquée.', date: '2024-03-25', startTime: '10:00', endTime: '16:00', location: 'Secteur Hommes', isPublished: false, status: 'upcoming', attendeesCount: 0, category: 'Santé' },
                { id: '5', title: 'Sortie Famille : Parc Nature', description: 'Journée de détente en forêt.', date: '2024-04-05', startTime: '08:00', endTime: '18:00', location: 'Départ Parking', isPublished: true, status: 'upcoming', attendeesCount: 45, category: 'Social' },
            ]);
        } catch {
            toast.error("Erreur lors du chargement des événements");
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
            const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [events, searchQuery, categoryFilter]);

    const categories = useMemo(() => {
        const set = new Set(events.map(e => e.category));
        return Array.from(set);
    }, [events]);


    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Espace Événements</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Gérez les activités et conférences de la mosquée</p>
                </div>
                <button className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 w-full sm:w-auto">
                    <FiPlus size={20} /> Nouvel événement
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <FiCalendar size={24} />, label: 'Total Événements', value: events.length, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50' },
                    { icon: <FiUsers size={24} />, label: 'Inscriptions', value: events.reduce((a, e) => a + e.attendeesCount, 0), color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' },
                    { icon: <FiCheckCircle size={24} />, label: 'Réalisés', value: events.filter(e => e.status === 'completed').length, color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50' },
                    { icon: <FiAlertCircle size={24} />, label: 'En Brouillon', value: events.filter(e => !e.isPublished).length, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' },
                ].map((s, i) => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md group relative overflow-hidden">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${s.iconBg} border flex items-center justify-center ${s.color} flex-shrink-0 relative z-10`}>{s.icon}</div>
                        <div className="min-w-0 relative z-10">
                            <p className="text-xs text-dark-400 uppercase tracking-wider font-bold truncate mb-1">{s.label}</p>
                            <p className={`text-2xl sm:text-3xl font-extrabold ${s.color} truncate tracking-tight`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un titre, un lieu…"
                        className="input pl-10 w-full text-sm py-2.5" />
                </div>
                <div className="flex items-center gap-2">
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                        className="input text-sm py-2.5 w-44">
                        <option value="all">Toutes les catégories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                    const st = STATUS_CFG[event.status];
                    return (
                        <div key={event.id} className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group relative">
                            {!event.isPublished && (
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border border-amber-200">Brouillon</span>
                                </div>
                            )}
                            <div className="p-6 flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest ${st.bg} ${st.text}`}>
                                        {st.label}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest bg-dark-50 dark:bg-dark-800 text-dark-500">
                                        {event.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
                                <p className="text-sm text-dark-500 line-clamp-2 mb-4 leading-relaxed">{event.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-3 text-sm font-bold text-dark-600 dark:text-dark-400">
                                        <div className="w-8 h-8 rounded-xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-400">
                                            <FiCalendar size={16} />
                                        </div>
                                        <span>{new Date(event.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-dark-600 dark:text-dark-400">
                                        <div className="w-8 h-8 rounded-xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-400">
                                            <FiClock size={16} />
                                        </div>
                                        <span>{event.startTime} {event.endTime && `– ${event.endTime}`}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-dark-600 dark:text-dark-400">
                                        <div className="w-8 h-8 rounded-xl bg-dark-50 dark:bg-dark-800 flex items-center justify-center text-dark-400">
                                            <FiMapPin size={16} />
                                        </div>
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-dark-100 dark:border-dark-800 mt-auto">
                                    <div className="flex items-center gap-2 text-dark-500 font-bold text-xs">
                                        <FiUsers size={14} /> {event.attendeesCount} inscrits
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-dark-900 transition-colors">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-dark-400 hover:text-red-500 transition-colors">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
