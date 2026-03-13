'use client';

import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiSave, FiRefreshCw, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { fetchMosqueSettings } from '@/lib/api/mosqueSettings';
import { fetchRamadanSettings, saveRamadanSettings, RamadanSettingsDto } from '@/lib/api/ramadanSettings';
import axios from 'axios';

interface RamadanDay {
    day: number;
    hijriDate: string;
    gregorianDate: string;
    imsak: string;
    iftar: string;
}

export default function RamadanPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [firstDay, setFirstDay] = useState(new Date().toISOString().split('T')[0]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [calendar, setCalendar] = useState<RamadanDay[]>([]);
    const [mosqueConfig, setMosqueConfig] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [mSettings, rSettings] = await Promise.all([
                fetchMosqueSettings(),
                fetchRamadanSettings()
            ]);

            setMosqueConfig(mSettings);

            if (rSettings) {
                setIsVisible(rSettings.isVisible);
                setFirstDay(new Date(rSettings.firstDay).toISOString().split('T')[0]);
                setYear(rSettings.year);
                if (rSettings.calendarJson) {
                    setCalendar(JSON.parse(rSettings.calendarJson));
                }
            }
        } catch (error) {
            console.error("Error loading Ramadan data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCalendar = async () => {
        if (!mosqueConfig) {
            return toast.error("Veuillez d'abord configurer la localisation de la mosquée dans 'Horaires de Prière'");
        }

        setGenerating(true);
        const toastId = toast.loading("Génération du calendrier...");

        try {
            const startDate = new Date(firstDay);
            const days: RamadanDay[] = [];
            
            // We'll generate 30 days starting from firstDay
            for (let i = 0; i < 30; i++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + i);
                
                const dateStr = `${current.getDate().toString().padStart(2, '0')}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getFullYear()}`;
                
                // Fetch times from Aladhan for this specific date
                const response = await axios.get(`https://api.aladhan.com/v1/timings/${dateStr}`, {
                    params: {
                        latitude: mosqueConfig.latitude,
                        longitude: mosqueConfig.longitude,
                        method: mosqueConfig.calculationMethod || 2
                    }
                });

                const timings = response.data.data.timings;
                
                days.push({
                    day: i + 1,
                    hijriDate: `${response.data.data.date.hijri.day} ${response.data.data.date.hijri.month.fr} ${response.data.data.date.hijri.year}`,
                    gregorianDate: current.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
                    imsak: timings.Imsak,
                    iftar: timings.Maghrib
                });
            }

            setCalendar(days);
            toast.success("Calendrier généré pour 30 jours !", { id: toastId });
        } catch (error) {
            console.error("Error generating calendar:", error);
            toast.error("Erreur lors de la génération. Vérifiez l'accès à l'API Aladhan.", { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading("Enregistrement...");
        try {
            console.log("Saving Ramadan settings with data:", { year, firstDay, isVisible, calendarCount: calendar.length });
            const settings: RamadanSettingsDto = {
                year,
                firstDay: new Date(firstDay).toISOString(),
                isVisible,
                calendarJson: JSON.stringify(calendar)
            };
            const result = await saveRamadanSettings(settings);
            console.log("Save successful. Result:", result);
            toast.success("Calendrier enregistré avec succès !", { id: toastId });
        } catch (error: any) {
            console.error("Save error full object:", error);
            const errorMsg = error.response?.data?.message || error.message || "Erreur inconnue";
            toast.error(`Erreur lors de l'enregistrement: ${errorMsg}`, { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageSkeleton variant="form" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Calendrier Ramadan</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Gérez l'affichage du mois de Ramadan sur votre portail web</p>
                </div>

                <div className="relative flex items-center gap-4">
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all ${isVisible 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                            : 'bg-dark-50 text-dark-400 dark:bg-dark-800'}`}
                    >
                        {isVisible ? <FiEye /> : <FiEyeOff />}
                        {isVisible ? 'Visible sur le Web' : 'Invisible'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || calendar.length === 0}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                    >
                        <FiSave />
                        Enregistrer
                    </button>
                </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600 shadow-sm shadow-primary-500/10">
                                <FiCalendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white">Paramètres</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Année</label>
                                <input 
                                    type="number" 
                                    value={year} 
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="input w-full font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Premier jour de Ramadan</label>
                                <input 
                                    type="date" 
                                    value={firstDay} 
                                    onChange={(e) => setFirstDay(e.target.value)}
                                    className="input w-full font-bold"
                                />
                            </div>
                            
                            <div className="pt-4">
                                <button
                                    onClick={handleGenerateCalendar}
                                    disabled={generating}
                                    className="btn bg-dark-900 dark:bg-white dark:text-dark-900 text-white w-full hover:bg-dark-800 px-6 py-4 rounded-2xl flex justify-center items-center gap-2 font-bold transition-all shadow-xl shadow-dark-900/10"
                                >
                                    {generating ? <FiRefreshCw className="animate-spin" /> : <FiRefreshCw />}
                                    {generating ? 'Calcul en cours...' : 'Générer Automatiquement'}
                                </button>
                                <p className="text-[10px] text-dark-400 mt-3 text-center font-medium leading-relaxed">
                                    Utilise la localisation de la mosquée et la méthode de calcul configurée pour calculer Imsak et Iftar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between bg-dark-50/30">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white">Aperçu du Mois</h3>
                            {calendar.length > 0 && (
                                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2">
                                    <FiCheckCircle /> {calendar.length} Jours générés
                                </span>
                            )}
                        </div>
                        
                        <div className="max-h-[600px] overflow-y-auto">
                            {calendar.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white dark:bg-dark-900 z-10">
                                        <tr className="bg-dark-50/50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-800 text-dark-500 text-[11px] uppercase tracking-wider font-extrabold">
                                            <th className="py-4 px-6">Jour Ramadan</th>
                                            <th className="py-4 px-6">Gégorien</th>
                                            <th className="py-4 px-6">Hijri</th>
                                            <th className="py-4 px-6">Imsak</th>
                                            <th className="py-4 px-6">Iftar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                                        {calendar.map((d) => (
                                            <tr key={d.day} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-dark-900 dark:text-white">Jour {d.day}</td>
                                                <td className="py-4 px-6 text-sm font-medium text-dark-600">{d.gregorianDate}</td>
                                                <td className="py-4 px-6 text-sm font-bold text-primary-600">{d.hijriDate}</td>
                                                <td className="py-4 px-6 font-black text-dark-900 dark:text-white tabular-nums">{d.imsak}</td>
                                                <td className="py-4 px-6 font-black text-emerald-600 tabular-nums">{d.iftar}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-dark-50 dark:bg-dark-800 rounded-full flex items-center justify-center text-dark-200">
                                        <FiCalendar size={40} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-dark-900 dark:text-white">Aucun calendrier généré</h4>
                                        <p className="text-sm text-dark-400 max-w-xs mt-2">Cliquez sur le bouton pour générer automatiquement les horaires du mois.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
