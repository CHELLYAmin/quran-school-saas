'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiHeart, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import api from '@/lib/api/client';

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    category: string;
    isPublished: boolean;
    sortOrder: number;
    excerpt?: string;
    createdAt: string;
    updatedAt: string;
}

interface SaasStats {
    activeStudentsCount: number;
    activeTeachersCount: number;
    totalGroupsCount: number;
    activeMissions: number;
    completedMissionsThisWeek: number;
}

interface PrayerTime {
    name: string;
    time: string;
    iqama?: string;
    active?: boolean;
    isRamadan?: boolean;
}

export default function SiteHomePage() {
    const [filter, setFilter] = useState<'all' | 'announcement' | 'service' | 'donation' | 'volunteer'>('all');
    const [announcements, setAnnouncements] = useState<CmsPage[]>([]);
    const [publicContent, setPublicContent] = useState<any[]>([]);
    const [stats, setStats] = useState<SaasStats | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

    useEffect(() => {
        loadPublicContent();
        loadStats();
    }, []);

    useEffect(() => {
        loadPrayerTimes(selectedDate);
    }, [selectedDate]);

    const loadPublicContent = async () => {
        try {
            const [cmsRes, donRes, volRes] = await Promise.all([
                api.get('/api/cms/pages?published=true'),
                api.get('/api/donation/campaigns?published=true'),
                api.get('/api/volunteer/missions?published=true')
            ]);

            const cmsData = cmsRes.data || [];
            const donData = donRes.data || [];
            const volData = volRes.data || [];

            // Normalize for Hub de Vie
            const normalized = [
                ...cmsData.map((p: any) => ({ ...p, type: 'cms' })),
                ...donData.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    slug: `donate/${d.id}`,
                    excerpt: d.description,
                    category: 'donation',
                    type: 'donation',
                    createdAt: d.createdAt
                })),
                ...volData.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    slug: `volunteer/${v.id}`,
                    excerpt: v.description,
                    category: 'volunteer',
                    type: 'volunteer',
                    createdAt: v.createdAt
                }))
            ];

            setPublicContent(normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setAnnouncements(cmsData.filter((p: any) => p.category === 'announcement'));
        } catch (e) {
            console.error('Public content load error', e);
        }
    };

    const loadStats = async () => {
        try {
            const res = await api.get('/api/analytics/overview?schoolId=00000000-0000-0000-0000-000000000000');
            setStats(res.data);
        } catch (e) {
            console.error('Stats load error', e);
        }
    };

    const loadPrayerTimes = async (date: Date) => {
        try {
            const settingsRes = await api.get('/api/MosqueSettings');
            const settings = settingsRes.data;

            if (settings?.latitude && settings?.longitude) {
                const dateStr = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod || 2}`;

                const res = await axios.get(url);
                const json = res.data;

                if (json?.data?.timings) {
                    const t = json.data.timings;
                    const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();

                    const prayers = [
                        { name: 'Imsak', time: t.Imsak, isRamadan: true },
                        { name: 'Fajr', time: t.Fajr },
                        { name: 'Dhuhr', time: t.Dhuhr },
                        { name: 'Asr', time: t.Asr },
                        { name: 'Maghrib', time: t.Maghrib, labelOverride: 'Iftar' },
                        { name: 'Isha', time: t.Isha },
                    ];

                    let nextIndex = -1;
                    if (isToday) {
                        for (let i = 0; i < prayers.length; i++) {
                            const [h, m] = prayers[i].time.split(':').map(Number);
                            if (h * 60 + m > nowMinutes) {
                                nextIndex = i;
                                break;
                            }
                        }
                    }

                    setPrayerTimes(prayers.map((p, i) => ({
                        ...p,
                        iqama: i === 0 ? '-' : (i === 4 ? '+5 min' : (i === 1 ? '06:15' : (i === 2 ? '13:00' : (i === 3 ? '16:30' : '20:30')))),
                        active: i === nextIndex
                    })));
                }
            }
        } catch (e) {
            console.error('Prayer times load error', e);
        } finally {
            setLoading(false);
        }
    };

    const navigateCalendar = (days: number) => {
        const newSelected = new Date(selectedDate);
        newSelected.setDate(newSelected.getDate() + days);
        setSelectedDate(newSelected);

        // Update base date to keep current selection in view
        const newBase = new Date(newSelected);
        setCalendarBaseDate(newBase);
    };

    const resetToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCalendarBaseDate(today);
    };

    // Calculate carousel dates based on focus
    const visibleDates = [];
    for (let i = -2; i <= 2; i++) {
        const d = new Date(calendarBaseDate);
        d.setDate(d.getDate() + i);
        visibleDates.push(d);
    }

    const visibleContent = publicContent.filter(item => filter === 'all' || item.category === filter);

    const getCategoryIcon = (cat: string) => {
        const icons: Record<string, string> = {
            announcement: 'campaign',
            about: 'mosque',
            service: 'volunteer_activism',
            islam: 'auto_stories',
            donation: 'volunteer_activism',
            volunteer: 'groups',
            default: 'article'
        };
        return icons[cat] || icons.default;
    };

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            announcement: 'from-primary-900 to-primary-800',
            about: 'from-emerald-800 to-emerald-900',
            service: 'from-accent-gold to-amber-600',
            islam: 'from-primary-700 to-primary-900',
            donation: 'from-pink-800 to-pink-900',
            volunteer: 'from-blue-800 to-blue-900',
            default: 'from-slate-700 to-slate-900'
        };
        return colors[cat] || colors.default;
    };

    return (
        <div className="min-h-screen bg-pearl dark:bg-dark-950 flex flex-col font-sans">
            {/* Dynamic Announcement Banner */}
            {announcements.length > 0 && (
                <div className="bg-primary-900 text-white overflow-hidden py-2.5 relative border-b border-white/5">
                    <div className="absolute inset-0 opacity-10 flex text-[8rem] leading-none whitespace-nowrap overflow-hidden items-center select-none -top-4 -z-0 pointer-events-none">
                        CENTRE CULTUREL ISLAMIQUE DE QUÉBEC
                    </div>
                    <div className="max-w-7xl mx-auto px-4 z-10 relative flex justify-between items-center whitespace-nowrap overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-black tracking-widest text-accent-gold mr-8 bg-black/20 px-4 py-1.5 rounded-full shrink-0 uppercase border border-accent-gold/20 shadow-inner">
                            Annonce
                        </span>
                        <div className="animate-marquee flex gap-8 whitespace-nowrap items-center text-sm font-medium">
                            <Link href={`/site/${announcements[0].slug}`} className="hover:text-accent-gold transition-colors underline decoration-accent-gold/30 underline-offset-4">
                                {announcements[0].title}
                            </Link>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                            {publicContent.filter(i => i.type === 'cms' && i.category !== 'announcement').length > 0 && (
                                <Link href={`/site/${publicContent.filter(i => i.type === 'cms' && i.category !== 'announcement')[0].slug}`} className="hover:text-accent-gold transition-colors">
                                    {publicContent.filter(i => i.type === 'cms' && i.category !== 'announcement')[0].title}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center bg-white dark:bg-dark-900 overflow-hidden isolate shadow-sm border-b border-dark-100 dark:border-dark-800">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[100px] border-primary-50 dark:border-primary-900/10 rounded-full opacity-60 -z-10" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-900 rounded-full opacity-[0.03] blur-3xl -z-10" />

                <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-center text-center -mt-10">
                    <span className="text-primary-800 dark:text-primary-400 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-8 border border-primary-100 dark:border-primary-900/30 bg-primary-50 dark:bg-primary-900/20 px-6 py-2.5 rounded-full shadow-sm">
                        Sagesse • Éducation • Communauté
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-black text-dark-900 dark:text-white leading-[1.05] tracking-tight max-w-5xl text-balance">
                        Nourrissez votre esprit, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-800 to-primary-600 dark:from-primary-400 dark:to-primary-600 block mt-2 relative">
                            <span className="absolute -bottom-2 left-1/4 right-1/4 h-3 bg-accent-gold opacity-30 -z-10 rotate-[-1deg]" />
                            renforcez votre foi.
                        </span>
                    </h1>

                    <p className="mt-8 text-xl text-dark-500 dark:text-dark-400 max-w-2xl font-normal leading-relaxed text-balance">
                        Rejoignez le Centre Culturel Islamique de Québec, un espace d&apos;apprentissage et d&apos;excellence spirituelle au cœur de notre communauté.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-md mx-auto sm:max-w-none">
                        <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-primary-800 px-10 py-5 text-sm font-bold text-white shadow-xl shadow-primary-900/20 hover:bg-primary-900 hover:-translate-y-0.5 transition-all">
                            S&apos;inscrire à l&apos;école
                            <FiArrowRight className="ml-2 text-xl" />
                        </Link>
                        <Link href="/donate" className="inline-flex items-center justify-center rounded-full bg-white dark:bg-dark-800 px-10 py-5 text-sm font-bold text-primary-900 dark:text-white border border-primary-100 dark:border-primary-900 shadow-sm hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:-translate-y-0.5 transition-all">
                            <FiHeart className="mr-2 text-accent-gold" />
                            Soutenir le Centre
                        </Link>
                    </div>

                    {/* Live SaaS Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-12 border-t border-dark-100 dark:border-dark-800 w-full max-w-4xl mx-auto">
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-4xl font-serif font-black text-primary-900 dark:text-white">{stats?.activeStudentsCount ?? '450'}+</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400">Élèves actifs</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-4xl font-serif font-black text-primary-900 dark:text-white">{stats?.activeTeachersCount ?? '32'}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400">Enseignants</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-4xl font-serif font-black text-primary-900 dark:text-white">{stats?.totalGroupsCount ?? '12'}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400">Niveaux d&apos;étude</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-4xl font-serif font-black text-primary-900 dark:text-white">{stats ? stats.completedMissionsThisWeek : '100%'}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400">Progression</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Prayer Schedule — Centered & Calendar Style */}
            <section id="horaires" className="bg-primary-900 dark:bg-dark-950 text-white relative isolate py-16 lg:py-24 flex items-center min-h-[700px]">
                <div className="absolute top-0 inset-x-0 h-4 bg-accent-gold/20" />
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
                    <div className="lg:col-span-5 flex justify-center">
                        {/* Prayer Card */}
                        <div className="w-full max-w-[380px] bg-white text-dark-900 p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-dark-100 shadow-black/20">
                            <div className="flex justify-between items-center border-b border-dark-100 pb-6 mb-6">
                                <h3 className="font-serif text-2xl font-black text-primary-900">Horaires de Prière</h3>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                                        {new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(selectedDate)}
                                    </div>
                                    <div className="text-lg font-black text-primary-900">
                                        {selectedDate.getDate()} {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(selectedDate)}
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Header with "Today" Button */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-dark-400 flex items-center gap-1">
                                    <FiCalendar className="text-accent-gold" /> Calendrier
                                </span>
                                {selectedDate.toDateString() !== new Date().toDateString() && (
                                    <button
                                        onClick={resetToToday}
                                        className="text-[9px] font-black uppercase tracking-widest text-primary-600 hover:text-accent-gold transition-colors flex items-center gap-1"
                                    >
                                        Aujourd&apos;hui <FiArrowRight className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            {/* Dynamic Date Carousel - Responsive & Scrollable */}
                            <div className="flex items-center gap-2 md:gap-4 mb-8 w-full">
                                <button onClick={() => navigateCalendar(-1)} className="size-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-50 transition-all active:scale-95 shrink-0 shadow-sm">
                                    <FiChevronLeft />
                                </button>

                                <div className="flex-1 overflow-x-auto no-scrollbar py-1 px-1">
                                    <div className="flex gap-3 justify-center min-w-max md:min-w-0">
                                        {visibleDates.map((date, idx) => {
                                            const isActive = date.toDateString() === selectedDate.toDateString();
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        setCalendarBaseDate(new Date(date));
                                                    }}
                                                    className={`flex flex-col items-center justify-center min-w-[58px] size-14 rounded-2xl transition-all duration-500 border relative shrink-0 ${isActive ? 'bg-primary-900 text-white border-primary-900 shadow-xl shadow-primary-900/40 z-10 scale-110' : 'bg-slate-50 text-dark-500 border-slate-100 hover:border-primary-200'}`}
                                                >
                                                    {isToday && !isActive && <span className="absolute -top-1 size-2 bg-accent-gold rounded-full border-2 border-white shadow-sm" />}
                                                    <span className="text-[9px] font-bold uppercase opacity-60">
                                                        {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date).replace('.', '')}
                                                    </span>
                                                    <span className="text-lg font-black">{date.getDate()}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button onClick={() => navigateCalendar(1)} className="size-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-50 transition-all active:scale-95 shrink-0 shadow-sm">
                                    <FiChevronRight />
                                </button>
                            </div>

                            {/* Times List */}
                            <div className="space-y-2.5">
                                {prayerTimes.length > 0 ? (
                                    prayerTimes.map((p, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${p.active ? 'bg-primary-50 border-primary-200 border shadow-sm ring-1 ring-primary-500/20 scale-[1.02]' : 'bg-slate-50 border border-transparent hover:border-dark-100'}`}>
                                            <div className="flex items-center gap-3">
                                                {p.isRamadan && <span className="bg-primary-100 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border border-primary-200 shadow-sm shrink-0">Imsakiya</span>}
                                                <span className={`font-bold shrink-0 ${p.active ? 'text-primary-800 font-black text-lg' : 'text-dark-700'}`}>
                                                    {p.name === 'Maghrib' ? 'Iftar' : p.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-6 md:gap-8 text-right shrink-0">
                                                <div>
                                                    <span className={`block text-[10px] uppercase font-bold ${p.active ? 'text-primary-500' : 'text-dark-400'}`}>Adhan</span>
                                                    <span className={`font-mono text-sm ${p.active ? 'text-primary-900 font-bold' : 'text-dark-600'}`}>{p.time}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[10px] uppercase font-bold ${p.active ? 'text-primary-500' : 'text-dark-400'}`}>Iqama</span>
                                                    <span className={`font-mono font-bold text-sm ${p.active ? 'text-primary-900 font-black' : 'text-dark-900'}`}>{p.iqama}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-dark-400 animate-pulse">Chargement des horaires...</div>
                                )}
                                <div className="mt-6 pt-4 border-t border-dark-100 flex justify-between items-center text-xs">
                                    <div>
                                        <span className="block font-bold text-dark-500 uppercase tracking-tighter">Jumu&apos;ah</span>
                                        <span className="font-black text-primary-900">12:30 & 13:30</span>
                                    </div>
                                    <Link href="/site/horaires" className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 uppercase tracking-widest text-[9px]">Tout le mois</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 py-8">
                        <span className="text-accent-gold font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-3 block">Identité & Valeurs</span>
                        <h2 className="text-4xl lg:text-5xl font-serif font-black leading-[0.95] mb-6 uppercase tracking-tighter">Un centre de savoir et d&apos;éducation <span className="text-accent-gold italic">spirituelle.</span></h2>
                        <div className="space-y-5 text-primary-100/80 text-base font-medium leading-relaxed max-w-xl">
                            <p>Le Centre Culturel Islamique de Québec est un pilier de la communauté depuis plus de 35 ans. Notre mission est de favoriser l&apos;épanouissement spirituel et social.</p>
                            <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-primary-800/50">
                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-lg uppercase tracking-tight">École Coranique</h4>
                                    <p className="text-xs leading-relaxed opacity-60">Mémorisation (Hifdh) et étude du Tajwid pour enfants et adultes avec des professeurs qualifiés.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-lg uppercase tracking-tight">Vie Cultuelle</h4>
                                    <p className="text-xs leading-relaxed opacity-60">Un espace ouvert pour les 5 prières, le recueillement et les célébrations religieuses.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hub de Vie — Harmonized Colors */}
            <section className="py-20 lg:py-24 bg-white dark:bg-dark-900 rounded-t-[3rem] relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.02)] -mt-10 border-t border-dark-100 dark:border-dark-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="space-y-3">
                            <h2 className="text-primary-900 dark:text-white font-serif text-4xl lg:text-6xl font-black uppercase leading-none tracking-tighter">Hub de <span className="text-accent-gold italic">Vie</span></h2>
                            <p className="text-slate-500 dark:text-dark-400 max-w-xl text-base font-medium leading-relaxed">
                                Actualités, services et ressources pour la communauté musulmane de Québec.
                            </p>
                        </div>

                        <div className="flex bg-slate-50 dark:bg-dark-800 p-1.5 rounded-full border border-slate-200/50 dark:border-dark-700 overflow-x-auto no-scrollbar">
                            {(['all', 'announcement', 'service', 'donation', 'volunteer'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-4 sm:px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === t ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20' : 'text-primary-900/40 dark:text-dark-400 hover:text-primary-900 dark:hover:text-white'}`}
                                >
                                    {t === 'all' ? 'Tout' : t === 'announcement' ? 'Annonces' : t === 'service' ? 'Services' : t === 'donation' ? 'Dons' : 'Bénévolat'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-dark-800 rounded-[2.5rem]" />)}
                        </div>
                    ) : (publicContent.filter(item => filter === 'all' || item.category === filter).length === 0) ? (
                        <div className="text-center py-24 bg-slate-50 dark:bg-dark-800 rounded-[3rem] border border-dashed border-slate-200 dark:border-dark-700">
                            <p className="text-slate-400 dark:text-dark-500 font-bold uppercase tracking-widest text-[10px]">Aucun contenu publié pour le moment</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                            {publicContent
                                .filter(item => filter === 'all' || item.category === filter)
                                .map((item) => (
                                    <Link key={item.id} href={`/site/${item.slug}`}
                                        className="group flex flex-col bg-white dark:bg-dark-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-dark-700 shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 hover:-translate-y-2 hover:border-accent-gold/30"
                                    >
                                        <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center`}>
                                            {/* Subtle Islamic Motif Overlay */}
                                            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)", backgroundSize: "40px 40px", backgroundPosition: "0 0, 20px 20px" }} />

                                            <span className="material-symbols-outlined text-white/5 text-[140px] absolute -right-6 -bottom-6 rotate-12 select-none">
                                                {getCategoryIcon(item.category)}
                                            </span>
                                            <div className="relative z-10 text-center scale-100">
                                                <div className="size-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-3 mx-auto border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors duration-500">
                                                    <span className="material-symbols-outlined text-white text-3xl block scale-90 group-hover:scale-110 transition-transform duration-700">
                                                        {getCategoryIcon(item.category)}
                                                    </span>
                                                </div>
                                                <span className="bg-accent-gold text-primary-950 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-4 flex flex-1 flex-col relative">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent group-hover:via-accent-gold transition-all duration-700" />

                                            <p className="text-accent-gold text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="w-6 h-[1px] bg-accent-gold/40" />
                                                {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <h3 className="text-xl md:text-2xl font-serif font-black text-primary-950 dark:text-white leading-[1.1] flex-1 group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            {item.excerpt && (
                                                <p className="text-sm text-slate-600 dark:text-dark-400 leading-relaxed line-clamp-3 font-medium">{item.excerpt}</p>
                                            )}
                                            <div className="pt-6 border-t border-slate-100 dark:border-dark-700 mt-auto flex items-center justify-between">
                                                <span className="text-primary-900 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/link">
                                                    Découvrir
                                                    <FiArrowRight className="group-hover/link:translate-x-2 transition-transform duration-500" />
                                                </span>
                                                <div className="size-7 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-accent-gold/50 group-hover:bg-accent-gold/5 transition-all">
                                                    <FiArrowRight className="text-slate-300 text-xs group-hover:text-accent-gold transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
