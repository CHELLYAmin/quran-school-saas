'use client';

import React, { useEffect, useState } from 'react';
import { FiBell, FiSave, FiCheckCircle, FiAlertCircle, FiClock, FiType } from 'react-icons/fi';
import api from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function MosqueSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        isLiveAnnouncementActive: false,
        liveAnnouncementText: '',
        liveAnnouncementStartDate: '',
        liveAnnouncementEndDate: '',
        address: '',
        latitude: 0,
        longitude: 0,
        calculationMethod: 2
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/api/MosqueSettings');
            if (res.data) {
                setSettings({
                    ...res.data,
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
            await api.post('/api/MosqueSettings', settings);
            toast.success('Réglages enregistrés avec succès !');
        } catch (e) {
            console.error('Failed to save settings', e);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="spinner border-primary-600" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-100 dark:border-dark-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Réglages de la Mosquée</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 font-medium italic">Configurez les informations globales et le bandeau d'actualités.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-500/20"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
                    Enregistrer
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* News Banner Section */}
                <div className="card overflow-hidden border-2 border-primary-500/10">
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-6 border-b border-primary-100 dark:border-primary-900/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                                <FiBell size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-primary-950 dark:text-white uppercase tracking-tight">Bandeau d'actualités (News Banner)</h2>
                                <p className="text-xs text-primary-600/60 dark:text-primary-400/60 font-medium">Bandeau défilant visible en haut de chaque page du site vitrine.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.isLiveAnnouncementActive}
                                onChange={(e) => setSettings({...settings, isLiveAnnouncementActive: e.target.checked})}
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-dark-200 peer-focus:outline-none dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                            <span className="ml-3 text-sm font-bold text-dark-700 dark:text-white">{settings.isLiveAnnouncementActive ? 'Activé' : 'Désactivé'}</span>
                        </label>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Text Content */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiType /> Message du bandeau
                            </label>
                            <textarea
                                value={settings.liveAnnouncementText}
                                onChange={(e) => setSettings({...settings, liveAnnouncementText: e.target.value})}
                                placeholder="Entrez le message qui défilera sur le site (ex: Le mois saint de Ramadan débute ce dimanche...)"
                                className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-3xl p-6 outline-none font-medium h-32 transition-all shadow-inner"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FiClock /> Date de début (Optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={settings.liveAnnouncementStartDate}
                                    onChange={(e) => setSettings({...settings, liveAnnouncementStartDate: e.target.value})}
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FiClock /> Date de fin (Optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={settings.liveAnnouncementEndDate}
                                    onChange={(e) => setSettings({...settings, liveAnnouncementEndDate: e.target.value})}
                                    className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                                />
                            </div>
                        </div>

                        {settings.isLiveAnnouncementActive && !settings.liveAnnouncementText && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3 text-rose-600 text-sm">
                                <FiAlertCircle />
                                <span className="font-bold tracking-tight text-xs uppercase">Attention : Le bandeau est activé mais le message est vide.</span>
                            </div>
                        )}
                        
                        {settings.isLiveAnnouncementActive && settings.liveAnnouncementText && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 text-emerald-600 text-sm">
                                <FiCheckCircle />
                                <span className="font-bold tracking-tight text-xs uppercase italic">Le bandeau sera affiché dès maintenant sur le site vitrine.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Settings Section */}
                <div className="card p-8 space-y-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-dark-900 dark:text-white">Informations de Contact</h2>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-widest">Adresse Physique</label>
                        <input
                            type="text"
                            value={settings.address}
                            onChange={(e) => setSettings({...settings, address: e.target.value})}
                            className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
