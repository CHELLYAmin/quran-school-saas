'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { donationApi } from '@/lib/api/client';
import {
    FiPlus, FiDollarSign, FiHeart, FiTrendingUp, FiCalendar,
    FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX,
    FiClock, FiCheckCircle, FiTrash2, FiUsers, FiTag, FiFileText, FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Donation {
    id: string;
    donorName: string;
    email?: string;
    amount: number;
    campaign: string;
    date: string;
    status: 'pending' | 'validated' | 'receipt_issued';
    type: 'interac' | 'cash' | 'cheque' | 'card';
    isAnonymous: boolean;
    note?: string;
}

const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'En attente' },
    validated: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Validé' },
    receipt_issued: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', label: 'Reçu émis' },
};

const TYPE_LABELS: Record<string, string> = {
    interac: 'Virement Interac',
    cash: 'Espèces',
    cheque: 'Chèque',
    card: 'Carte Bancaire',
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function DonationsPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [donations, setDonations] = useState<Donation[]>([]);
    const [campaignsList, setCampaignsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [campaignFilter, setCampaignFilter] = useState<string>('all');

    useEffect(() => { loadDonations(); }, []);

    const loadDonations = async () => {
        try {
            const [campRes, recRes] = await Promise.all([
                donationApi.getCampaigns(),
                donationApi.getRecords()
            ]);
            setCampaignsList(campRes.data);

            const mappedRecords = recRes.data.map((r: any) => ({
                id: r.id,
                donorName: r.donorName,
                email: r.email,
                amount: r.amount,
                campaign: r.campaignTitle,
                date: new Date(r.createdAt).toISOString().split('T')[0],
                status: r.status.toLowerCase(),
                type: r.paymentType.toLowerCase(),
                isAnonymous: r.isAnonymous
            }));

            setDonations(mappedRecords);
        } catch {
            toast.error("Erreur lors du chargement des dons");
        } finally {
            setLoading(false);
        }
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = d.donorName.toLowerCase().includes(q) || d.campaign.toLowerCase().includes(q) || (d.email && d.email.toLowerCase().includes(q));
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            const matchesCampaign = campaignFilter === 'all' || d.campaign === campaignFilter;
            return matchesSearch && matchesStatus && matchesCampaign;
        });
    }, [donations, searchQuery, statusFilter, campaignFilter]);

    const stats = useMemo(() => {
        return {
            total: donations.reduce((acc, d) => acc + d.amount, 0),
            count: donations.length,
            validated: donations.filter(d => d.status === 'validated' || d.status === 'receipt_issued').reduce((acc, d) => acc + d.amount, 0),
            pending: donations.filter(d => d.status === 'pending').length
        };
    }, [donations]);

    const campaignNames = useMemo(() => {
        return campaignsList.map(c => c.title);
    }, [campaignsList]);


    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Dons & Collectes</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Suivi des contributions et fonds de la mosquée</p>
                </div>
                <button onClick={() => toast.success("Ouverture du formulaire d'enregistrement de don...")} className="btn bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 w-full sm:w-auto">
                    <FiPlus size={20} /> Enregistrer un don
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <FiDollarSign size={24} />, label: 'Collecte Totale', value: `${stats.total.toLocaleString()} €`, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' },
                    { icon: <FiCheckCircle size={24} />, label: 'Fonds Validés', value: `${stats.validated.toLocaleString()} €`, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50' },
                    { icon: <FiHeart size={24} />, label: 'Nombre de Dons', value: stats.count, color: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/50' },
                    { icon: <FiClock size={24} />, label: 'En attente', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' },
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
                        placeholder="Rechercher un donateur, une campagne…"
                        className="input pl-10 w-full text-sm py-2.5" />
                </div>
                <div className="flex items-center gap-2">
                    <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
                        className="input text-sm py-2.5 w-44">
                        <option value="all">Toutes les campagnes</option>
                        {campaignNames.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="input text-sm py-2.5 w-32">
                        <option value="all">Tous statuts</option>
                        <option value="pending">En attente</option>
                        <option value="validated">Validés</option>
                        <option value="receipt_issued">Reçus émis</option>
                    </select>
                    <button className="btn btn-outline p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-500" title="Exporter en CSV">
                        <FiDownload size={18} />
                    </button>
                    <button
                        onClick={() => toast.success("Génération des reçus annuels lancée.")}
                        className="btn btn-outline p-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                        title="Générer les reçus annuels 2025"
                    >
                        <FiFileText size={18} /> <span className="hidden sm:inline text-sm font-bold">Reçus Annuels</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-dark-50/80 dark:bg-dark-800/80 border-b border-dark-100 dark:border-dark-800 text-dark-500 text-[11px] uppercase tracking-wider font-extrabold">
                                <th className="py-4 px-6">Donateur</th>
                                <th className="py-4 px-6">Campagne</th>
                                <th className="py-4 px-6">Montant</th>
                                <th className="py-4 px-6 hidden sm:table-cell">Date</th>
                                <th className="py-4 px-6">Statut</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                            {filteredDonations.map(donation => {
                                const st = STATUS_CFG[donation.status];
                                return (
                                    <tr key={donation.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/50 transition-colors group/row">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${donation.isAnonymous ? 'bg-dark-100 dark:bg-dark-800' : 'bg-primary-50 dark:bg-primary-900/20'} flex items-center justify-center text-sm font-bold`}>
                                                    {donation.isAnonymous ? <FiUsers /> : donation.donorName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-dark-900 dark:text-white text-base leading-tight">
                                                        {donation.donorName}
                                                        {donation.isAnonymous && <span className="ml-2 text-[10px] bg-dark-200 dark:bg-dark-700 px-1.5 py-0.5 rounded uppercase font-bold text-dark-600">ANON</span>}
                                                    </span>
                                                    <span className="text-xs font-semibold text-dark-500 mt-0.5">{TYPE_LABELS[donation.type]}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-bold text-dark-700 dark:text-dark-300 flex items-center gap-2">
                                                <FiTag size={12} className="text-dark-400" /> {donation.campaign}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-lg font-extrabold text-emerald-600 tracking-tight">{donation.amount.toLocaleString()} €</span>
                                        </td>
                                        <td className="py-4 px-6 hidden sm:table-cell">
                                            <span className="text-sm font-bold text-dark-500 italic">{donation.date}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${st.bg} ${st.text}`}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                {donation.status === 'validated' && (
                                                    <button
                                                        onClick={() => toast.success(`Reçu généré pour ${donation.donorName}`)}
                                                        className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                        title="Générer Reçu Fiscal"
                                                    >
                                                        <FiFileText size={18} />
                                                    </button>
                                                )}
                                                {donation.status === 'receipt_issued' && (
                                                    <button
                                                        onClick={() => toast.success(`Reçu envoyé par email à ${donation.donorName}`)}
                                                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                        title="Envoyer Reçu (Email)"
                                                    >
                                                        <FiSend size={18} />
                                                    </button>
                                                )}
                                                <button className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Détails">
                                                    <FiEye size={18} />
                                                </button>
                                                <button className="p-2 rounded-xl text-dark-500 hover:text-dark-900 hover:bg-dark-100 dark:text-dark-400 dark:hover:text-white dark:hover:bg-dark-800 transition-colors" title="Modifier">
                                                    <FiCheck size={18} />
                                                </button>
                                                <button className="p-2 rounded-xl text-dark-500 hover:text-red-600 hover:bg-red-50 dark:text-dark-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
