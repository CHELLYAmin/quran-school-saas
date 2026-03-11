'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import {
    FiClock, FiSettings, FiTv, FiSave, FiRefreshCw,
    FiPlus, FiTrash2, FiMapPin, FiInfo, FiCheckCircle, FiEye,
    FiChevronLeft, FiChevronRight, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { fetchPrayerTimesByCoordinates } from '@/lib/api/aladhan';
import { fetchMosqueSettings, saveMosqueSettings, UpdateMosqueSettingsDto } from '@/lib/api/mosqueSettings';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false });

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
interface Prayer {
    id: string;
    name: string;
    nameAr: string;
    adhan: string;
    iqama: string;
    iqamaMode: 'manual' | 'offset';
    iqamaOffset: number;
    isActive: boolean;
}

const addMinutes = (timeString: string, offset: number): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(0, 0, 0, hours, minutes + offset);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatDateForApi = (d: Date): string => {
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

const formatDateDisplay = (d: Date): string => {
    return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateInput = (d: Date): string => {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PrayerTimesPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [tab, setTab] = useState<'daily' | 'jumuah' | 'config' | 'tv'>('daily');
    const [prayers, setPrayers] = useState<Prayer[]>([]);
    const [loading, setLoading] = useState(true);

    const [address, setAddress] = useState('Québec');
    const [lat, setLat] = useState<number | null>(45.5019);
    const [lng, setLng] = useState<number | null>(-73.5674);
    const [calcMethod, setCalcMethod] = useState('2');
    const [isFetching, setIsFetching] = useState(false);
    const [source, setSource] = useState<'Manuel' | 'Automatique (API Aladhan)'>('Manuel');
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isLiveAnnouncementActive, setIsLiveAnnouncementActive] = useState(false);
    const [liveAnnouncementText, setLiveAnnouncementText] = useState('');
    const [liveAnnouncementStartDate, setLiveAnnouncementStartDate] = useState('');
    const [liveAnnouncementEndDate, setLiveAnnouncementEndDate] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        let loadedLat = 45.5019;
        let loadedLng = -73.5674;
        let loadedMethod = '2';

        try {
            const settings = await fetchMosqueSettings();

            if (settings) {
                loadedLat = settings.latitude;
                loadedLng = settings.longitude;
                setLat(loadedLat);
                setLng(loadedLng);
                setAddress(settings.address || 'Québec');
                loadedMethod = settings.calculationMethod ? settings.calculationMethod.toString() : '2';
                setCalcMethod(loadedMethod);

                setIsLiveAnnouncementActive(settings.isLiveAnnouncementActive || false);
                setLiveAnnouncementText(settings.liveAnnouncementText || '');
                setLiveAnnouncementStartDate(settings.liveAnnouncementStartDate ? settings.liveAnnouncementStartDate.split('T')[0] : '');
                setLiveAnnouncementEndDate(settings.liveAnnouncementEndDate ? settings.liveAnnouncementEndDate.split('T')[0] : '');

                if (settings.prayersJson && settings.prayersJson.trim() !== '' && settings.prayersJson !== '[]') {
                    try {
                        setPrayers(JSON.parse(settings.prayersJson));
                    } catch (e) {
                        console.error("Error parsing saved prayers", e);
                        loadMockData();
                    }
                } else {
                    loadMockData();
                }
            } else {
                loadMockData();
            }
        } catch {
            // Fetch will throw if 404 (first time setup) or error
            loadMockData();
        } finally {
            setLoading(false);
        }

        // Auto-fetch today's prayer times from API
        if (loadedLat && loadedLng) {
            try {
                const today = new Date();
                const timings = await fetchPrayerTimesByCoordinates({
                    latitude: loadedLat,
                    longitude: loadedLng,
                    method: parseInt(loadedMethod),
                    date: formatDateForApi(today)
                });
                setPrayers(prev => prev.map(p => {
                    const key = p.name as keyof typeof timings;
                    if (timings[key]) {
                        const newAdhan = timings[key] as string;
                        const newIqama = p.iqamaMode === 'offset'
                            ? addMinutes(newAdhan, p.iqamaOffset)
                            : p.iqama;
                        return { ...p, adhan: newAdhan, iqama: newIqama };
                    }
                    return p;
                }));
                setSource('Automatique (API Aladhan)');
            } catch (e) {
                console.error("Auto-fetch prayer times failed:", e);
            }
        }
    };

    const loadMockData = () => {
        setPrayers([
            { id: '1', name: 'Fajr', nameAr: 'الفجر', adhan: '05:42', iqama: '06:05', iqamaMode: 'manual', iqamaOffset: 20, isActive: true },
            { id: '2', name: 'Dhuhr', nameAr: 'الظهر', adhan: '12:15', iqama: '12:30', iqamaMode: 'manual', iqamaOffset: 15, isActive: true },
            { id: '3', name: 'Asr', nameAr: 'العصر', adhan: '15:20', iqama: '15:35', iqamaMode: 'manual', iqamaOffset: 15, isActive: true },
            { id: '4', name: 'Maghrib', nameAr: 'المغرب', adhan: '17:55', iqama: '18:05', iqamaMode: 'manual', iqamaOffset: 10, isActive: true },
            { id: '5', name: 'Isha', nameAr: 'العشاء', adhan: '19:15', iqama: '19:30', iqamaMode: 'manual', iqamaOffset: 15, isActive: true },
        ]);
    };

    const updatePrayer = (id: string, field: keyof Prayer, value: any) => {
        setPrayers(prev => prev.map(p => {
            if (p.id !== id) return p;

            const updatedPrayer = { ...p, [field]: value };

            // Auto-calculate Iqama if adhan, iqamaMode, or iqamaOffset changes and mode is offset
            if ((field === 'adhan' || field === 'iqamaMode' || field === 'iqamaOffset') && updatedPrayer.iqamaMode === 'offset') {
                updatedPrayer.iqama = addMinutes(updatedPrayer.adhan, Number(updatedPrayer.iqamaOffset));
            }

            return updatedPrayer;
        }));
    };

    const handleSaveAll = async () => {
        const toastId = toast.loading("Sauvegarde en cours...");
        try {
            const dto: UpdateMosqueSettingsDto = {
                latitude: lat || 45.5019,
                longitude: lng || -73.5674,
                address: address || '',
                calculationMethod: parseInt(calcMethod),
                prayersJson: prayers.length > 0 ? JSON.stringify(prayers) : '[]',
                isLiveAnnouncementActive,
                liveAnnouncementText,
                liveAnnouncementStartDate: liveAnnouncementStartDate ? new Date(liveAnnouncementStartDate).toISOString() : undefined,
                liveAnnouncementEndDate: liveAnnouncementEndDate ? new Date(liveAnnouncementEndDate).toISOString() : undefined
            };

            await saveMosqueSettings(dto);
            toast.success("Configuration sauvegardée avec succès !", { id: toastId });
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde", { id: toastId });
        }
    };

    const handleFetchPrayerTimes = async (dateOverride?: Date) => {
        if (!lat || !lng) return toast.error("Veuillez sélectionner un point sur la carte");

        setIsFetching(true);
        const toastId = toast.loading("Calcul des horaires en cours...");

        try {
            const dateToUse = dateOverride || selectedDate;
            const timings = await fetchPrayerTimesByCoordinates({
                latitude: lat,
                longitude: lng,
                method: parseInt(calcMethod),
                date: formatDateForApi(dateToUse)
            });

            setPrayers(prev => prev.map(p => {
                const key = p.name as keyof typeof timings;
                if (timings[key]) {
                    const newAdhan = timings[key] as string;
                    const newIqama = p.iqamaMode === 'offset'
                        ? addMinutes(newAdhan, p.iqamaOffset)
                        : p.iqama;

                    return { ...p, adhan: newAdhan, iqama: newIqama };
                }
                return p;
            }));

            toast.success("Horaires mis à jour ! N'oubliez pas de sauvegarder.", { id: toastId });
            setSource('Automatique (API Aladhan)');
        } catch (error) {
            toast.error("Erreur lors de la récupération des horaires via l'API", { id: toastId });
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    const goToPreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
        handleFetchPrayerTimes(prev);
    };

    const goToNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next);
        handleFetchPrayerTimes(next);
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        handleFetchPrayerTimes(today);
    };


    if (loading) return <PageSkeleton variant="form" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Horaires de Prière</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Configuration du moteur de prière et affichage TV</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-dark-50 dark:bg-dark-800 p-1.5 rounded-2xl w-fit border border-dark-100 dark:border-dark-700">
                {[
                    { id: 'daily', label: 'Quotidien', icon: <FiClock /> },
                    { id: 'jumuah', label: "Jumu'ah", icon: <FiClock /> },
                    { id: 'config', label: 'Configuration', icon: <FiSettings /> },
                    { id: 'tv', label: 'Affichage TV', icon: <FiTv /> },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id
                            ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm border border-dark-100 dark:border-dark-700'
                            : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-200'
                            }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content Tabs */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {tab === 'daily' && (
                    <div className="space-y-6">
                        {/* THE NEW CARD FOR CALCULATION */}
                        <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600 shadow-sm shadow-primary-500/10">
                                    <FiMapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-dark-900 dark:text-white">Localisation de la mosquée</h3>
                                    <p className="text-sm font-medium text-dark-500">Renseignez l'adresse pour calculer automatiquement les heures de prière.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-3">
                                    <MapPicker
                                        initialLat={lat || 45.5019}
                                        initialLng={lng || -73.5674}
                                        initialAddress={address}
                                        onLocationSelect={(newLat, newLng, newAddress) => {
                                            if (newLat !== lat || newLng !== lng) {
                                                setLat(newLat);
                                                setLng(newLng);
                                                setHasChanges(true);
                                            }
                                            if (newAddress && newAddress !== address) {
                                                setAddress(newAddress);
                                                setHasChanges(true);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-6 lg:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">Adresse Détectée</label>
                                        <p className="font-bold text-dark-900 dark:text-white bg-dark-50 dark:bg-dark-800 p-4 rounded-xl border border-dark-100 dark:border-dark-700 min-h-[56px] flex items-center text-sm">
                                            {address || "Cliquez sur la carte..."}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Convention de Calcul</label>
                                        <select value={calcMethod} onChange={(e) => setCalcMethod(e.target.value)} className="input w-full font-bold bg-transparent">
                                            <option value="2">ISNA (Amérique du Nord)</option>
                                            <option value="3">MWL (Ligue Islamique)</option>
                                            <option value="12">UOIF (France - 12°)</option>
                                        </select>
                                    </div>
                                    <div className="pt-2 space-y-3">
                                        <button
                                            onClick={() => handleFetchPrayerTimes()}
                                            disabled={isFetching}
                                            className="btn bg-primary-600 w-full hover:bg-primary-700 text-white px-6 py-4 rounded-2xl flex justify-center items-center gap-2 font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20"
                                        >
                                            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
                                            {isFetching ? "Calcul en cours..." : "Calculer automatiquement"}
                                        </button>
                                        <button
                                            onClick={() => { handleSaveAll(); setHasChanges(false); }}
                                            disabled={!hasChanges}
                                            className="btn w-full text-white px-6 py-4 rounded-2xl flex justify-center items-center gap-2 font-bold transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                                        >
                                            <FiSave size={18} />
                                            Sauvegarder la position
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* EXISTING TABLE COMPONENT */}
                        <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-dark-100 dark:border-dark-800">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white">Horaires Quotidiens</h2>
                                    <div className="flex items-center gap-3">
                                        <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-2 ${source === 'Manuel' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'}`}>
                                            <FiInfo /> Source : {source}
                                        </div>
                                    </div>
                                </div>
                                {/* Date Navigation */}
                                <div className="flex items-center gap-3 mt-4 flex-wrap">
                                    <button onClick={goToPreviousDay} className="w-9 h-9 rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 flex items-center justify-center text-dark-500 hover:text-primary-600 hover:border-primary-300 transition-all">
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <button onClick={goToToday} className="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-all">
                                        Aujourd'hui
                                    </button>
                                    <button onClick={goToNextDay} className="w-9 h-9 rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 flex items-center justify-center text-dark-500 hover:text-primary-600 hover:border-primary-300 transition-all">
                                        <FiChevronRight size={18} />
                                    </button>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formatDateInput(selectedDate)}
                                            onChange={(e) => {
                                                const d = new Date(e.target.value + 'T12:00:00');
                                                setSelectedDate(d);
                                                handleFetchPrayerTimes(d);
                                            }}
                                            className="input text-sm py-2 px-3 font-bold bg-transparent rounded-xl border border-dark-100 dark:border-dark-700"
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-dark-500 capitalize">
                                        {formatDateDisplay(selectedDate)}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-dark-50/50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-800 text-dark-500 text-[11px] uppercase tracking-wider font-extrabold">
                                            <th className="py-4 px-6">Prière</th>
                                            <th className="py-4 px-6">Nom Arabe</th>
                                            <th className="py-4 px-6">Adhan</th>
                                            <th className="py-4 px-6">Mode Iqama</th>
                                            <th className="py-4 px-6">Iqama</th>
                                            <th className="py-4 px-6 text-right">Visible</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-100 dark:divide-dark-800 text-sm">
                                        {prayers.map(p => (
                                            <tr key={p.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-dark-900 dark:text-white text-base">{p.name}</td>
                                                <td className="py-4 px-6 font-bold text-dark-900 dark:text-white text-lg" dir="rtl">{p.nameAr}</td>
                                                <td className="py-4 px-6">
                                                    <input type="time" value={p.adhan} onChange={(e) => updatePrayer(p.id, 'adhan', e.target.value)} className="input text-sm py-1.5 w-28 font-bold text-primary-600" />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <select value={p.iqamaMode} onChange={(e) => updatePrayer(p.id, 'iqamaMode', e.target.value)} className="input text-sm py-1.5 w-32 font-medium">
                                                        <option value="manual">Manuel</option>
                                                        <option value="offset">Décalage (+{p.iqamaOffset}m)</option>
                                                    </select>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <input type="time" value={p.iqama} onChange={(e) => updatePrayer(p.id, 'iqama', e.target.value)} className="input text-sm py-1.5 w-28 font-bold text-emerald-600" />
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <input type="checkbox" checked={p.isActive} onChange={(e) => updatePrayer(p.id, 'isActive', e.target.checked)} className="w-5 h-5 rounded-lg border-dark-200 text-primary-600 focus:ring-primary-500" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'jumuah' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(num => (
                            <div key={num} className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-dark-900 dark:text-white tracking-tight">Jumu&apos;ah {num}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-dark-500">Activé</span>
                                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Adhan</label>
                                            <input type="time" defaultValue={num === 1 ? "12:15" : "13:30"} className="input w-full font-bold text-dark-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Khutba</label>
                                            <input type="time" defaultValue={num === 1 ? "12:35" : "13:50"} className="input w-full font-bold text-primary-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Iqama</label>
                                            <input type="time" defaultValue={num === 1 ? "12:50" : "14:05"} className="input w-full font-bold text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Lieu / Salle</label>
                                        <input type="text" defaultValue={num === 1 ? "Salle Principale" : "Gymnase"} className="input w-full font-bold" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'config' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Paramètres Complémentaires</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2"><FiClock /> Fuseau Horaire Central</label>
                                        <select className="input w-full font-bold bg-transparent">
                                            <option>America/Toronto</option>
                                            <option>Europe/Paris</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2"><FiMapPin /> Coordonnées (Lat/Lng Fixes)</label>
                                        <input type="text" defaultValue="45.75, -73.60" className="input w-full font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Source Adhan par défaut</label>
                                        <select className="input w-full font-bold bg-transparent">
                                            <option value="calculated">Automatique (Astronomique)</option>
                                            <option value="manual">Manuel (Saisie directe)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-primary-50 dark:bg-primary-900/10 rounded-4xl border border-primary-100 dark:border-primary-800/50 p-8 shadow-sm h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 shadow-sm shadow-primary-500/10">
                                        <FiInfo size={24} />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-primary-900 dark:text-primary-100 tracking-tight">Info Moteur</h3>
                                </div>
                                <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed font-medium">
                                    Le moteur de calcul utilise les algorithmes astronomiques pour déterminer l&apos;entrée des temps de prière.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-bold text-primary-600">
                                        <FiCheckCircle /> Heure locale : {new Date().toLocaleTimeString()}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-primary-600">
                                        <FiCheckCircle /> Hijri : 25 Chaâbane 1445
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'tv' && (
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-12 items-start text-dark-900 dark:text-white">
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-2">Configuration TV</h3>
                                    <p className="text-dark-500 font-medium">Gérez l&apos;apparence de l&apos;affichage dans la mosquée.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Rafraîchissement (sec)</label>
                                        <input type="number" defaultValue="60" className="input w-full font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Thème TV</label>
                                        <select className="input w-full font-bold bg-transparent">
                                            <option>Dark Premium</option>
                                            <option>Light Minimal</option>
                                            <option>Deep Emerald</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Message Défilant (Marquee)</label>
                                    <textarea className="input w-full font-medium h-24 py-3" defaultValue="Bienvenue au Centre Culturel Islamique. La conférence commencera après l'Isha. N'oubliez pas vos dons pour la construction."></textarea>
                                </div>
                            </div>
                            <div className="w-full md:w-80 space-y-6">
                                <div className="p-6 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700">
                                    <p className="text-xs font-bold text-dark-400 uppercase mb-4 tracking-widest">Aperçu TV</p>
                                    <div className="aspect-video bg-dark-900 rounded-xl border-4 border-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                                        <div className="text-[10px] text-white/40 mb-2 font-bold uppercase tracking-tighter">Maghrib Iqama in</div>
                                        <div className="text-2xl font-black text-emerald-400 tracking-tighter tabular-nums">12:34</div>
                                        <div className="absolute inset-0 bg-primary-500/5 group-hover:bg-transparent transition-colors pointer-events-none"></div>
                                    </div>
                                    <button className="btn btn-outline w-full mt-6 rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <FiEye /> Lancer en plein écran
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
