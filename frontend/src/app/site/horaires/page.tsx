'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import { mosqueApi } from '@/lib/api/client';
import { ramadanApi } from '@/lib/api/ramadanSettings';

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
    const [ramadan, setRamadan] = useState<any>(null);

    useEffect(() => {
        loadPrayerTimes();
        loadRamadanCalendar();
    }, []);

    const loadRamadanCalendar = async () => {
        try {
            const res = await ramadanApi.getSettings();
            if (res.data) {
                const data = res.data;
                if (data.isVisible && data.calendarJson) {
                    setRamadan({
                        ...data,
                        calendar: JSON.parse(data.calendarJson)
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load Ramadan calendar', e);
        }
    };

    const loadPrayerTimes = async () => {
        try {
            const settingsRes = await mosqueApi.getSettings();
            const settings = settingsRes.data;

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

                    const nextIdx = prayerList.findIndex(p => !p.isPast);
                    if (nextIdx >= 0) prayerList[nextIdx].isNext = true;

                    setPrayers(prayerList);
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
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
            <div className="size-16 rounded-[2rem] border-4 border-primary-900/10 border-t-primary-900 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans relative overflow-hidden">
            {/* Light Premium Hero */}
            <section className="relative overflow-hidden bg-[#FDFCFB] text-primary-950 pt-32 pb-48 px-6 border-b border-slate-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-primary-900/5 rounded-full -z-0" />
                <div className="container mx-auto max-w-4xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 text-primary-950 text-[10px] font-black tracking-[0.3em] uppercase">
                        Rythme Spirituel
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 tracking-tighter leading-[0.9] cinzel-title uppercase text-primary-950">
                        Horaires de <span className="text-accent-gold italic">Prière</span>
                    </h1>
                    <div className="flex flex-col items-center gap-2 pt-8">
                        <p className="text-slate-500 text-2xl font-medium capitalize tracking-tight">{dateStr}</p>
                        {hijriDate && <p className="text-accent-gold text-sm font-black tracking-widest uppercase">{hijriDate}</p>}
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 pb-32 relative z-30 -mt-32">
                <div className="grid gap-6">
                    {prayers.map(p => (
                        <div key={p.name} className={`group flex items-center justify-between px-10 py-8 rounded-[3rem] border-2 transition-all duration-500 ${p.isNext ? 'bg-primary-950 text-white border-primary-950 shadow-2xl scale-[1.05] z-10' : p.isPast ? 'bg-white/40 grayscale opacity-60 border-slate-50' : 'bg-white text-primary-950 border-slate-100 shadow-xl hover:-translate-y-1'}`}>
                            <div className="flex items-center gap-8">
                                <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all ${p.isNext ? 'bg-accent-gold text-primary-950' : 'bg-slate-50 text-slate-300'}`}>
                                    <span className="material-symbols-outlined text-3xl">{p.name === 'Sunrise' ? 'wb_sunny' : 'mosque'}</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-serif font-black cinzel-title uppercase tracking-tighter leading-none">{p.name}</h3>
                                    <p className={`text-[10px] font-black tracking-[0.3em] uppercase mt-2 ${p.isNext ? 'text-accent-gold' : 'text-slate-400'}`}>{p.nameAr}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-5xl font-mono font-black tracking-tighter ${p.isNext ? 'text-accent-gold' : 'text-primary-900'}`}>{p.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {ramadan && ramadan.calendar && (
                    <div className="mt-32 space-y-12">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-serif font-black cinzel-title uppercase text-primary-950">Ramadan <span className="text-accent-gold">{ramadan.year}</span></h2>
                        </div>
                        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-primary-950 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                                        <th className="py-8 px-10">Jour</th>
                                        <th className="py-8 px-10">Date</th>
                                        <th className="py-8 px-10 text-accent-gold text-right">Imsak</th>
                                        <th className="py-8 px-10 text-accent-gold text-right">Iftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {ramadan.calendar.map((d: any) => (
                                        <tr key={d.day} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-8 px-10 font-serif font-black text-xl text-primary-950 uppercase">Jour {d.day}</td>
                                            <td className="py-8 px-10 text-slate-400 font-medium">{d.gregorianDate}</td>
                                            <td className="py-8 px-10 text-primary-950 font-mono font-black text-2xl text-right">{d.imsak}</td>
                                            <td className="py-8 px-10 text-primary-950 font-mono font-black text-2xl text-right">{d.iftar}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-24 text-center">
                    <Link href="/site" className="group inline-flex items-center gap-4 text-[11px] font-black text-primary-950 uppercase tracking-[0.4em] hover:text-accent-gold transition-all">
                        <FiChevronLeft className="group-hover:-translate-x-2 transition-transform" /> Retour au Portail
                    </Link>
                </div>
            </div>
        </div>
    );
}
