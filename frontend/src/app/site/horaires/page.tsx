'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';

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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const settingsRes = await fetch(`${apiUrl}/api/MosqueSettings`);
            if (!settingsRes.ok) {
                console.warn('MosqueSettings API returned', settingsRes.status);
                setLoading(false);
                return;
            }
            const settings = await settingsRes.json();

            if (settings?.latitude && settings?.longitude) {
                const now = new Date();
                const apiDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
                const url = `https://api.aladhan.com/v1/timings/${apiDate}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod || 2}`;
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
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-900/5 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 size-[500px] border border-primary-900/5 rounded-full -z-10" />
            
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-32 relative">
                {/* Header */}
                <div className="text-center mb-20 space-y-4">
                    <span className="text-accent-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Rythme Spirituel</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-primary-950 dark:text-white tracking-tighter cinzel-title uppercase">
                        Horaires <br className="md:hidden" /> de <span className="text-accent-gold">Prière</span>
                    </h1>
                    
                    <div className="flex flex-col items-center gap-2 pt-8">
                        <div className="h-px w-24 bg-accent-gold/30 mb-2" />
                        <p className="text-slate-500 text-xl font-medium capitalize tracking-tight">{dateStr}</p>
                        {hijriDate && (
                            <p className="text-accent-gold text-sm font-black tracking-widest uppercase opacity-80">{hijriDate}</p>
                        )}
                    </div>
                </div>

                {/* Prayer Cards Container */}
                {prayers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center gap-6 shadow-xl">
                        <span className="material-symbols-outlined text-6xl text-slate-200">schedule</span>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs max-w-xs mx-auto">Les horaires ne sont pas encore configurés pour cette période.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {prayers.map(p => (
                            <div key={p.name}
                                className={`group flex items-center justify-between px-8 py-7 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${p.isNext
                                        ? 'bg-primary-950 text-white border-primary-900 shadow-2xl scale-[1.05] z-10'
                                        : p.isPast
                                            ? 'bg-white/40 grayscale opacity-60 border-slate-100'
                                            : 'bg-white text-primary-950 border-slate-50 shadow-xl hover:border-accent-gold/30 hover:-translate-y-1'
                                    }`}
                            >
                                {p.isNext && <div className="absolute inset-0 zellige-pattern opacity-5" />}
                                
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${p.isNext ? 'bg-accent-gold text-primary-950' : 'bg-slate-50 text-slate-400 group-hover:bg-accent-gold/10 group-hover:text-accent-gold'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {p.name === 'Sunrise' ? 'wb_sunny' : 'mosque'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-serif font-black cinzel-title uppercase tracking-tighter ${p.isNext ? 'text-white' : 'text-primary-950'}`}>
                                            {p.name}
                                        </h3>
                                        <p className={`text-[11px] font-black tracking-[0.2em] uppercase ${p.isNext ? 'text-accent-gold' : 'text-slate-400'}`}>
                                            {p.nameAr}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right relative z-10">
                                    <p className={`text-4xl font-mono font-black tracking-tighter ${p.isNext ? 'text-accent-gold' : 'text-primary-900'}`}>
                                        {p.time}
                                    </p>
                                    {p.isNext && (
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10 animate-pulse">
                                            Prochaine Prière
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-16 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-accent-gold opacity-30 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-accent-gold shrink-0">
                            <span className="material-symbols-outlined text-3xl">info</span>
                        </div>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed text-center md:text-left">
                            Ces horaires sont extraits directement des données géographiques du centre pour garantir une précision absolue. Les horaires d&apos;Iqama peuvent varier de quelques minutes.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Link href="/site" className="group inline-flex items-center gap-3 text-[11px] font-black text-primary-900 uppercase tracking-[0.3em] hover:text-accent-gold transition-all">
                        <span className="size-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all">
                             <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                        </span>
                        Retour au Hub de Vie
                    </Link>
                </div>
            </div>
        </div>
    );
}
