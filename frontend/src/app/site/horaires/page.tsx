'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PrayerTime {
    name: string;
    nameAr: string;
    time: string;
    isPast: boolean;
    isNext: boolean;
}

export default function SiteHorairesPage() {
    const [prayers, setPrayers] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateStr, setDateStr] = useState('');
    const [hijriDate, setHijriDate] = useState('');

    useEffect(() => {
        loadPrayerTimes();
    }, []);

    const loadPrayerTimes = async () => {
        try {
            // Direct fetch for mosque settings (no apiClient)
            const settingsRes = await fetch('http://localhost:5000/api/MosqueSettings');
            if (!settingsRes.ok) {
                console.warn('MosqueSettings API returned', settingsRes.status);
                setLoading(false);
                return;
            }
            const settings = await settingsRes.json();

            if (settings?.latitude && settings?.longitude) {
                const now = new Date();
                const apiDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
                const url = `http://api.aladhan.com/v1/timings/${apiDate}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod || 2}`;
                const prayerRes = await fetch(url);
                if (!prayerRes.ok) { setLoading(false); return; }
                const prayerJson = await prayerRes.json();

                if (prayerJson?.data?.timings) {
                    const timings = prayerJson.data.timings;
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                    const prayerList = [
                        { name: 'Fajr', nameAr: 'الفجر', time: timings.Fajr },
                        { name: 'Sunrise', nameAr: 'الشروق', time: timings.Sunrise },
                        { name: 'Dhuhr', nameAr: 'الظهر', time: timings.Dhuhr },
                        { name: 'Asr', nameAr: 'العصر', time: timings.Asr },
                        { name: 'Maghrib', nameAr: 'المغرب', time: timings.Maghrib },
                        { name: 'Isha', nameAr: 'العشاء', time: timings.Isha },
                    ].map(p => {
                        const cleanTime = p.time.split(' ')[0];
                        const [h, m] = cleanTime.split(':').map(Number);
                        return { ...p, time: cleanTime, isPast: (h * 60 + m) < nowMinutes, isNext: false };
                    });

                    // Mark next prayer
                    const nextIdx = prayerList.findIndex(p => !p.isPast);
                    if (nextIdx >= 0) prayerList[nextIdx].isNext = true;

                    setPrayers(prayerList);

                    // Date display
                    setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
                    if (prayerJson.data?.date?.hijri) {
                        const h = prayerJson.data.date.hijri;
                        setHijriDate(`${h.day} ${h.month?.en || ''} ${h.year}`);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load prayer times', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-32">
            <div className="spinner w-10 h-10 border-primary-600" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 md:py-24">
            {/* Header */}
            <div className="text-center mb-12">
                <p className="text-accent-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">مواقيت الصلاة</p>
                <h1 className="text-3xl md:text-5xl font-serif font-black text-dark-900 dark:text-white tracking-tight">Horaires de Prière</h1>
                <p className="text-dark-500 mt-4 text-lg capitalize">{dateStr}</p>
                {hijriDate && <p className="text-accent-gold text-sm font-bold mt-1">{hijriDate}</p>}
            </div>

            {/* Prayer Cards */}
            {prayers.length === 0 ? (
                <p className="text-dark-400 text-center py-12">Les horaires ne sont pas encore configurés. Veuillez configurer les paramètres de la mosquée dans le tableau de bord.</p>
            ) : (
                <div className="grid gap-4">
                    {prayers.map(p => (
                        <div key={p.name}
                            className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${p.isNext
                                    ? 'bg-primary-900 text-white border-primary-800 shadow-xl shadow-primary-900/20 scale-[1.02]'
                                    : p.isPast
                                        ? 'bg-dark-50 dark:bg-dark-800 text-dark-400 border-dark-100 dark:border-dark-700'
                                        : 'bg-white dark:bg-dark-900 text-dark-900 dark:text-white border-dark-100 dark:border-dark-800'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {p.isNext && (
                                    <div className="size-3 bg-accent-gold rounded-full animate-pulse"></div>
                                )}
                                <div>
                                    <p className={`text-lg font-bold ${p.isNext ? 'text-white' : ''}`}>{p.name}</p>
                                    <p className={`text-sm ${p.isNext ? 'text-pearl/70' : 'text-dark-400'}`}>{p.nameAr}</p>
                                </div>
                            </div>
                            <p className={`text-2xl font-extrabold font-mono ${p.isNext ? 'text-accent-gold' : ''}`}>{p.time}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Note */}
            <div className="mt-10 p-6 bg-accent-gold/5 border border-accent-gold/20 rounded-3xl text-center">
                <p className="text-sm text-dark-600 dark:text-dark-300">
                    Les horaires sont calculés automatiquement selon les coordonnées de la mosquée.
                </p>
            </div>

            <div className="mt-8 text-center">
                <Link href="/site" className="text-sm font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">
                    ← Retour à l&apos;accueil
                </Link>
            </div>
        </div>
    );
}
