'use client';

import React, { useEffect, useState } from 'react';
import { FiBell, FiSave, FiCheckCircle, FiAlertCircle, FiClock, FiType } from 'react-icons/fi';
import { mosqueApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function BannerSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        isLiveAnnouncementActive: false,
        liveAnnouncementText: '',
        liveAnnouncementStartDate: '',
        liveAnnouncementEndDate: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await mosqueApi.getSettings();
            if (res.data) {
                setSettings({
                    isLiveAnnouncementActive: res.data.isLiveAnnouncementActive,
                    liveAnnouncementText: res.data.liveAnnouncementText || '',
                    liveAnnouncementStartDate: res.data.liveAnnouncementStartDate ? res.data.liveAnnouncementStartDate.split('T')[0] : '',
                    liveAnnouncementEndDate: res.data.liveAnnouncementEndDate ? res.data.liveAnnouncementEndDate.split('T')[0] : ''
                });
            }
        } catch (e) {
            console.error('Failed to load settings', e);
            toast.error('Erreur lors du chargement des réglages');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Get current settings first to merge other fields
            const currentRes = await mosqueApi.getSettings();
            const merged = { ...currentRes.data, ...settings };
            await mosqueApi.updateSettings(merged);
            toast.success('Bandeau mis à jour avec succès !');
        } catch (e) {
            console.error('Failed to save settings', e);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageSkeleton variant="form" />;

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Bandeau d'actualité</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2 font-medium">Gérez le message défilant sur le site vitrine.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5 relative z-10 disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={20} />}
                    Enregistrer
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-primary-50/50 dark:bg-primary-900/10 p-8 border-b border-dark-100 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
                                <FiBell size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-dark-900 dark:text-white tracking-tight uppercase">Statut du bandeau</h2>
                                <p className="text-sm text-dark-500 font-medium">Activez ou désactivez l'affichage instantanément.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer scale-110">
                            <input 
                                type="checkbox" 
                                checked={settings.isLiveAnnouncementActive}
                                onChange={(e) => setSettings({...settings, isLiveAnnouncementActive: e.target.checked})}
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-dark-200 peer-focus:outline-none dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                            <span className="ml-3 text-sm font-black text-dark-700 dark:text-white uppercase tracking-widest">{settings.isLiveAnnouncementActive ? 'Activé' : 'Désactivé'}</span>
                        </label>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                                <FiType className="text-primary-500" /> Message du bandeau
                            </label>
                            <textarea
                                value={settings.liveAnnouncementText}
                                onChange={(e) => setSettings({...settings, liveAnnouncementText: e.target.value})}
                                placeholder="Entrez le message qui défilera sur le site (ex: Le mois saint de Ramadan débute ce dimanche...)"
                                className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-3xl p-6 outline-none font-medium h-40 transition-all shadow-inner text-lg leading-relaxed focus:bg-white dark:focus:bg-dark-900"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                                    <FiClock className="text-primary-500" /> Date de début (Optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={settings.liveAnnouncementStartDate}
                                    onChange={(e) => setSettings({...settings, liveAnnouncementStartDate: e.target.value})}
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all focus:bg-white dark:focus:bg-dark-900 shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                                    <FiClock className="text-primary-500" /> Date de fin (Optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={settings.liveAnnouncementEndDate}
                                    onChange={(e) => setSettings({...settings, liveAnnouncementEndDate: e.target.value})}
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all focus:bg-white dark:focus:bg-dark-900 shadow-sm"
                                />
                            </div>
                        </div>

                        {settings.isLiveAnnouncementActive && (
                            <div className={`p-6 rounded-[2rem] border animate-pulse-slow flex items-center gap-4 transition-all duration-500 ${!settings.liveAnnouncementText ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${!settings.liveAnnouncementText ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                    {!settings.liveAnnouncementText ? <FiAlertCircle size={24} /> : <FiCheckCircle size={24} />}
                                </div>
                                <div>
                                    <p className="font-black text-xs uppercase tracking-[0.2em]">
                                        {!settings.liveAnnouncementText ? 'Attention : Message vide' : 'Bandeau actif'}
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                        {!settings.liveAnnouncementText 
                                            ? "Le bandeau est activé mais ne contient aucun texte à afficher." 
                                            : "Le message sera affiché immédiatement sur toutes les pages du site vitrine."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
