'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import {
    FiPlus, FiUsers, FiHeart, FiSearch, FiFilter,
    FiEdit2, FiTrash2, FiEye, FiCheck, FiX,
    FiCalendar, FiClock, FiStar, FiAward, FiMessageCircle, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Volunteer {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    skills: string[];
    status: string; // Dynamic from backend enums
    hoursContributed: number;
    lastActive: string;
    rating: number;
    joinedAt: string;
}

import { volunteerApi } from '@/lib/api/client';

const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Actif' },
    inactive: { bg: 'bg-dark-50 dark:bg-dark-800', text: 'text-dark-500', label: 'Inactif' },
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'En attente' },
    approved: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'Approuvé' },
};

export default function VolunteeringPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => { loadVolunteers(); }, []);

    const loadVolunteers = async () => {
        try {
            const [missRes, signRes] = await Promise.all([
                volunteerApi.getMissions(),
                volunteerApi.getSignups()
            ]);
            setMissions(missRes.data);

            const mappedVolunteers = signRes.data.map((s: any) => ({
                id: s.id,
                fullName: s.userFullName,
                email: '',
                phone: '',
                skills: [],
                status: s.status.toLowerCase(),
                hoursContributed: 0,
                lastActive: new Date(s.signupDate).toLocaleDateString(),
                rating: 5,
                joinedAt: s.signupDate
            }));

            setVolunteers(mappedVolunteers);
        } catch {
            toast.error("Erreur lors du chargement des bénévoles");
        } finally {
            setLoading(false);
        }
    };

    const filteredVolunteers = useMemo(() => {
        return volunteers.filter(v => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = v.fullName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [volunteers, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: volunteers.length,
            active: volunteers.filter(v => v.status === 'active' || v.status === 'approved').length,
            totalHours: volunteers.reduce((a, v) => a + v.hoursContributed, 0),
            pending: volunteers.filter(v => v.status === 'pending').length
        };
    }, [volunteers]);


    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Gestion du Bénévolat</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Suivi des forces vives de la communauté</p>
                </div>
                <button className="btn bg-pink-600 hover:bg-pink-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 w-full sm:w-auto">
                    <FiPlus size={20} /> Nouveau bénévole
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <FiHeart size={24} />, label: 'Bénévoles', value: stats.total, color: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/50' },
                    { icon: <FiCheck size={24} />, label: 'Actifs', value: stats.active, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' },
                    { icon: <FiClock size={24} />, label: 'Heures Données', value: stats.totalHours, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50' },
                    { icon: <FiAward size={24} />, label: 'En Attente', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' },
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
                        placeholder="Rechercher par nom, email, compétence…"
                        className="input pl-10 w-full text-sm py-2.5" />
                </div>
                <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="input text-sm py-2.5 w-44">
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                        <option value="pending">En attente</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVolunteers.map(volunteer => {
                    const st = STATUS_CFG[volunteer.status];
                    return (
                        <div key={volunteer.id} className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-500/20">
                                        {volunteer.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white leading-tight">{volunteer.fullName}</h3>
                                        <p className="text-sm text-dark-400 font-medium">{volunteer.phone}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-xl uppercase tracking-widest ${st.bg} ${st.text}`}>
                                    {st.label}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {volunteer.skills.map((skill, i) => (
                                    <span key={i} className="text-[11px] font-bold bg-dark-50 dark:bg-dark-800 text-dark-500 px-2.5 py-1 rounded-lg border border-dark-100 dark:border-dark-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-dark-50 dark:bg-dark-800/50 p-3 rounded-2xl text-center border border-dark-100 dark:border-dark-800">
                                    <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{volunteer.hoursContributed}</p>
                                    <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider mt-0.5">Heures</p>
                                </div>
                                <div className="bg-dark-50 dark:bg-dark-800/50 p-3 rounded-2xl text-center border border-dark-100 dark:border-dark-800">
                                    <div className="flex items-center justify-center gap-1 text-amber-500">
                                        <FiStar size={14} fill="currentColor" />
                                        <span className="text-xl font-extrabold">{volunteer.rating > 0 ? volunteer.rating : '—'}</span>
                                    </div>
                                    <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider mt-0.5">Rating</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 border-t border-dark-100 dark:border-dark-800 pt-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-dark-500">
                                    <FiCalendar size={14} /> Membre depuis : {new Date(volunteer.joinedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-dark-500">
                                    <FiCheckCircle size={14} /> Dernier passage : {volunteer.lastActive}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 mt-auto">
                                <button className="flex-1 btn btn-outline py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 text-dark-600 dark:text-dark-300">
                                    <FiMessageCircle size={14} /> Contacter
                                </button>
                                <div className="flex items-center gap-1">
                                    <button className="p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-dark-900 transition-colors">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-dark-400 hover:text-red-500 transition-colors">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
