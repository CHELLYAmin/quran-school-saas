'use client';

import React, { useEffect, useState } from 'react';
import { FiBell, FiSave, FiCheckCircle, FiAlertCircle, FiClock, FiType } from 'react-icons/fi';
import { mosqueApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function MosqueSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
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
            const res = await mosqueApi.getSettings();
            if (res.data) {
                setSettings({
                    address: res.data.address || '',
                    latitude: res.data.latitude || 0,
                    longitude: res.data.longitude || 0,
                    calculationMethod: res.data.calculationMethod || 2
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
            const currentRes = await mosqueApi.getSettings();
            const merged = { ...currentRes.data, ...settings };
            await mosqueApi.updateSettings(merged);
            toast.success('Réglages Web enregistrés avec succès !');
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
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight">Réglages Web</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2 font-medium">Configurez les informations globales du site vitrine.</p>
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

            <form onSubmit={handleSave} className="space-y-8">
                {/* Location Settings Section */}
                <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-dark-100 dark:border-dark-800 p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <FiClock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-dark-900 dark:text-white tracking-tight uppercase">Informations de Contact</h2>
                            <p className="text-sm text-dark-500 font-medium tracking-tight">Ces informations seront affichées en bas de page du site.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] ml-1">Adresse Physique</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({...settings, address: e.target.value})}
                                placeholder="Ex: 42 Rue de la Mosquée, 75000 Paris"
                                className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-5 outline-none font-bold transition-all focus:bg-white dark:focus:bg-dark-900 shadow-sm text-lg"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 opacity-50 grayscale cursor-not-allowed">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] ml-1">Latitude</label>
                                <input type="number" readOnly value={settings.latitude} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent rounded-2xl px-6 py-4 outline-none font-bold select-none" />
                            </div>
                            <div className="space-y-3 opacity-50 grayscale cursor-not-allowed">
                                <label className="text-xs font-black text-dark-400 uppercase tracking-[0.2em] ml-1">Longitude</label>
                                <input type="number" readOnly value={settings.longitude} className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent rounded-2xl px-6 py-4 outline-none font-bold select-none" />
                            </div>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                                <FiAlertCircle size={20} />
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed uppercase tracking-wider mt-1">
                                Note : Les coordonnées GPS sont actuellement calculées automatiquement à partir de l'adresse lors de l'intégration avec Google Maps (fonctionnalité à venir).
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
