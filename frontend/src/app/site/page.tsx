'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    labelOverride?: string;
}

interface PublicContentItem {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    category: string;
    type: 'cms' | 'donation' | 'volunteer';
    createdAt: string;
}

export default function SiteHomePage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'announcement' | 'event' | 'service' | 'donation' | 'volunteer'>('all');
    const [publicContent, setPublicContent] = useState<PublicContentItem[]>([]);
    const [stats, setStats] = useState<SaasStats | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

    // Live Announcement State
    const [shouldShowLiveAnnouncement, setShouldShowLiveAnnouncement] = useState(false);
    const [liveAnnouncementText, setLiveAnnouncementText] = useState('');

    useEffect(() => {
        const init = async () => {
            await Promise.allSettled([
                loadPublicContent(),
                loadStats(),
                loadPrayerTimes(selectedDate)
            ]);
            setLoading(false);
        };
        init();
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

            const normalized: PublicContentItem[] = [
                ...cmsData.map((p: CmsPage) => ({ 
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    excerpt: p.excerpt,
                    category: p.category,
                    type: 'cms' as const,
                    createdAt: p.createdAt 
                })),
                ...donData.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    slug: `donate/${d.id}`,
                    excerpt: d.description,
                    category: 'donation',
                    type: 'donation' as const,
                    createdAt: d.createdAt
                })),
                ...volData.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    slug: `volunteer/${v.id}`,
                    excerpt: v.description,
                    category: 'volunteer',
                    type: 'volunteer' as const,
                    createdAt: v.createdAt
                }))
            ];

            setPublicContent(normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

                if (settings.isLiveAnnouncementActive) {
                    const now = new Date();
                    const start = settings.liveAnnouncementStartDate ? new Date(settings.liveAnnouncementStartDate) : null;
                    const end = settings.liveAnnouncementEndDate ? new Date(settings.liveAnnouncementEndDate) : null;
                    const isWithinDates = (!start || now >= start) && (!end || now <= end);
                    setShouldShowLiveAnnouncement(isWithinDates);
                    setLiveAnnouncementText(settings.liveAnnouncementText || '');
                } else {
                    setShouldShowLiveAnnouncement(false);
                }
            }
        } catch (e) {
            console.error('Prayer times load error', e);
        }
    };

    const navigateCalendar = (days: number) => {
        const newSelected = new Date(selectedDate);
        newSelected.setDate(newSelected.getDate() + days);
        setSelectedDate(newSelected);
        setCalendarBaseDate(new Date(newSelected));
    };

    const visibleDates = [];
    for (let i = -2; i <= 2; i++) {
        const d = new Date(calendarBaseDate);
        d.setDate(d.getDate() + i);
        visibleDates.push(d);
    }

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
            announcement: 'from-primary-900 to-primary-700', // Vert CCIQ
            about: 'from-emerald-800 to-emerald-900',
            service: 'from-amber-500 to-amber-700',
            islam: 'from-primary-700 to-primary-900',
            donation: 'from-rose-800 to-rose-950', // Bordeaux/Rose
            volunteer: 'from-sky-700 to-sky-900', // Bleu Actions
            default: 'from-slate-700 to-slate-900'
        };
        return colors[cat] || colors.default;
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans">
            {/* Dynamic Announcement Banner */}
            {shouldShowLiveAnnouncement && (
                <div className="bg-primary-950 text-white overflow-hidden py-3 relative border-b border-white/5 z-20 font-sans">
                    <div className="absolute inset-0 opacity-10 flex text-[8rem] leading-none whitespace-nowrap overflow-hidden items-center select-none -top-4 -z-0 pointer-events-none cinzel-title font-black">
                        CENTRE CULTUREL ISLAMIQUE DE QUÉBEC
                    </div>
                    <div className="max-w-7xl mx-auto px-6 z-10 relative flex justify-between items-center whitespace-nowrap overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-black tracking-[0.3em] text-accent-gold mr-10 bg-white/5 px-5 py-2 rounded-full shrink-0 uppercase border border-white/10 shadow-2xl">
                            ANNONCE • LIVE
                        </span>
                        <div className="animate-marquee flex gap-12 whitespace-nowrap items-center text-[13px] font-bold tracking-wide">
                            <span className="flex items-center gap-3">
                                <span className="size-2 bg-accent-gold rounded-full animate-ping" />
                                {liveAnnouncementText}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - Super Premium Light Style */}
            <section className="relative min-h-[95vh] flex items-center bg-[#FDFCFB] overflow-hidden isolate shadow-sm">
                {/* Architectural Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-primary-900/5 rounded-full -z-0 animate-pulse-slow" />
                


                <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center justify-center text-center relative z-20">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 mb-12 animate-fade-in">
                        <span className="size-2 rounded-full bg-accent-gold animate-pulse" />
                        <span className="text-primary-950 font-black tracking-[0.3em] text-[10px] uppercase">
                            Excellence • Sagesse • Partage
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-serif font-black text-primary-950 leading-[0.9] tracking-tighter max-w-6xl text-balance cinzel-title uppercase">
                        Nourrissez votre <br className="hidden md:block" />
                        <span className="relative inline-block text-primary-900 pb-2">
                             esprit.
                        </span>
                    </h1>

                    <p className="mt-12 text-xl md:text-2xl text-slate-500 max-w-3xl font-medium leading-relaxed text-balance">
                        Rejoignez le <span className="text-primary-950 font-bold">Centre Culturel Islamique de Québec</span>, une institution d&apos;exception pour l&apos;apprentissage et l&apos;épanouissement spirituel.
                    </p>

                    <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center w-full max-w-xl mx-auto sm:max-w-none px-6">
                        <Link href="/register" className="inline-flex items-center justify-center rounded-[2rem] bg-primary-900 px-12 py-6 text-sm font-black text-white shadow-2xl shadow-primary-900/30 hover:bg-black hover:-translate-y-2 transition-all duration-500 uppercase tracking-widest border border-white/10 group">
                            S&apos;inscrire à l&apos;académie
                            <FiArrowRight className="ml-3 text-xl group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link href="/site/donate" className="inline-flex items-center justify-center rounded-[2rem] bg-white px-12 py-6 text-sm font-black text-primary-900 border border-slate-100 shadow-xl hover:bg-slate-50 hover:-translate-y-2 transition-all duration-500 uppercase tracking-widest group">
                            <FiHeart className="mr-3 text-accent-gold group-hover:scale-125 transition-transform" />
                            Soutenir le Centre
                        </Link>
                    </div>

                    {/* Live Stats Table */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24 py-12 border-t border-slate-100 w-full max-w-5xl">
                        {[
                            { label: 'Élèves actifs', value: stats?.activeStudentsCount ?? '450', suffix: '+' },
                            { label: 'Enseignants', value: stats?.activeTeachersCount ?? '32', suffix: '' },
                            { label: "Niveaux d'étude", value: stats?.totalGroupsCount ?? '12', suffix: '' },
                            { label: 'Progression', value: '100', suffix: '%' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2 items-center group">
                                <span className="text-5xl font-serif font-black text-primary-950 cinzel-title tracking-tighter group-hover:scale-110 transition-transform duration-500">
                                    {stat.value}{stat.suffix}
                                </span>
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-gold opacity-80">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Prayer Schedule — Soft Premium Style */}
            <section id="horaires" className="bg-[#FDFCFB] text-primary-950 relative isolate py-20 lg:py-24 flex items-center overflow-hidden">
                {/* Visual Band - Soft Overlap */}
                <div className="absolute inset-y-0 left-0 w-full lg:w-4/5 bg-primary-950 -z-10 rounded-r-[5rem] shadow-[40px_0_100px_rgba(0,0,0,0.1)]">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>
                
                {/* Soft Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-900/5 -z-20 skew-x-12 translate-x-1/4" />

                <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center relative z-10 w-full">
                    <div className="lg:col-span-12 text-left lg:pl-10 mb-10">
                        <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">Spiritualité & Rythme</span>
                        <h2 className="text-5xl md:text-7xl font-serif font-black leading-none cinzel-title uppercase group inline-block text-white">
                             Horaires de <span className="text-accent-gold italic">Prière</span>
                        </h2>
                    </div>

                    <div className="lg:col-span-5 flex justify-center w-full">
                        <div className="w-full max-w-[420px] bg-[#FDFCFB] text-primary-950 p-8 md:p-10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] relative border border-slate-100 group transition-all duration-700">
                            <div className="absolute -top-6 -right-6 size-20 bg-primary-900 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-0 transition-transform duration-500">
                                <span className="material-symbols-outlined text-4xl text-accent-gold">mosque</span>
                            </div>

                            <div className="flex justify-between items-end border-b-2 border-slate-100 pb-8 mb-8">
                                <div>
                                    <h3 className="font-serif text-3xl font-black text-primary-950 cinzel-title uppercase tracking-tighter">Québec</h3>
                                    <p className="text-[11px] font-black text-accent-gold tracking-[0.2em] uppercase mt-1">QC, Canada</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        {new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(selectedDate)}
                                    </div>
                                    <div className="text-2xl font-black text-primary-950 font-serif">
                                        {selectedDate.getDate()} {new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(selectedDate)}
                                    </div>
                                </div>
                            </div>

                            {/* Date Carousel */}
                            <div className="flex items-center gap-4 mb-10">
                                <button onClick={() => navigateCalendar(-1)} className="size-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-900 hover:text-white transition-all shadow-sm">
                                    <FiChevronLeft size={20} />
                                </button>
                                <div className="flex-1 overflow-x-auto no-scrollbar py-2">
                                    <div className="flex gap-4 justify-center">
                                        {visibleDates.map((date, idx) => {
                                            const isActive = date.toDateString() === selectedDate.toDateString();
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        setCalendarBaseDate(new Date(date));
                                                    }}
                                                    className={`flex flex-col items-center justify-center min-w-[64px] size-16 rounded-2xl transition-all duration-700 border relative shrink-0 ${isActive ? 'bg-primary-950 text-white border-primary-950 shadow-2xl scale-110 z-10' : 'bg-white text-slate-400 border-slate-100 opacity-60'}`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">
                                                        {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date).replace('.', '')}
                                                    </span>
                                                    <span className="text-xl font-black">{date.getDate()}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button onClick={() => navigateCalendar(1)} className="size-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-900 hover:text-white transition-all shadow-sm">
                                    <FiChevronRight size={20} />
                                </button>
                            </div>

                            {/* Times List */}
                            <div className="space-y-3">
                                {prayerTimes.length > 0 ? (
                                    prayerTimes.map((p, i) => (
                                        <div key={i} className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all duration-500 ${p.active ? 'bg-primary-950 text-white shadow-2xl scale-[1.05] z-10' : 'bg-white hover:bg-slate-50 text-primary-950 border border-slate-50'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${p.active ? 'text-accent-gold' : 'text-slate-400'}`}>
                                                    {p.isRamadan ? 'Ramadan' : 'Prière'}
                                                </span>
                                                <span className={`font-serif font-black text-xl cinzel-title uppercase tracking-tighter leading-tight ${p.active ? 'text-white' : 'text-primary-950'}`}>
                                                    {p.name === 'Maghrib' ? 'Iftar' : p.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-10 text-right">
                                                <div>
                                                    <span className={`block text-[9px] uppercase font-black tracking-widest mb-1 ${p.active ? 'text-accent-gold/60' : 'text-slate-300'}`}>Adhan</span>
                                                    <span className={`font-mono text-base font-black ${p.active ? 'text-white' : 'text-primary-900'}`}>{p.time}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[9px] uppercase font-black tracking-widest mb-1 ${p.active ? 'text-accent-gold/60' : 'text-slate-300'}`}>Iqama</span>
                                                    <span className={`font-mono text-base font-black ${p.active ? 'text-white' : 'text-primary-950 underline decoration-accent-gold decoration-2 underline-offset-4'}`}>{p.iqama}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center animate-pulse">Chargement...</div>
                                )}
                            </div>
                            
                            <Link href="/site/horaires" className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center group/footer">
                                <div>
                                    <span className="block font-black text-primary-950 text-xl cinzel-title uppercase tracking-tighter">Jumu&apos;ah</span>
                                    <p className="text-[10px] font-black text-accent-gold tracking-[0.3em] uppercase opacity-80">Vendredi • Prière Collective</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-200 group-hover/footer:translate-x-2 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px]">Notre Vision</span>
                            <h1 className="text-[clamp(2.5rem,10vw,7.5rem)] font-serif font-black text-white leading-[0.85] tracking-tighter cinzel-title">
                                Une éducation <span className="text-accent-gold italic">pure</span>,<br />
                                centrée sur le <span className="underline decoration-accent-gold/40 underline-offset-[12px]">Coran.</span>
                            </h1>
                            <p className="text-xl text-primary-100 font-medium leading-relaxed max-w-2xl">
                                Au-delà d&apos;un simple lieu de culte, le CCIQ est un pôle d&apos;excellence académique où chaque enfant et adulte peut s&apos;épanouir dans la mémorisation et la compréhension de la parole divine.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                            {[
                                { title: 'Authenticité', desc: 'Des professeurs diplômés avec une chaîne de transmission (Ijaza) préservée.', icon: 'verified' },
                                { title: 'Technologie', desc: 'Un suivi numérique moderne via notre plateforme exclusive QuranSchool SaaS.', icon: 'devices' }
                            ].map((val, i) => (
                                <div key={i} className="space-y-4 group">
                                    <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-primary-900 transition-all duration-500">
                                        <span className="material-symbols-outlined text-2xl">{val.icon}</span>
                                    </div>
                                    <h4 className="text-white font-black text-2xl cinzel-title uppercase tracking-tighter">{val.title}</h4>
                                    <p className="text-sm text-primary-100/60 leading-relaxed font-medium">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Hub de Vie */}
            <section className="py-24 lg:py-40 bg-[#FDFCFB] rounded-t-[5rem] -mt-20 relative z-30 shadow-2xl border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
                        <div className="space-y-4">
                            <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px]">Vie Sociale</span>
                            <h2 className="text-primary-950 font-serif text-6xl lg:text-[6.5rem] font-black uppercase leading-[0.85] tracking-tighter cinzel-title italic">
                                Hub de <span className="text-primary-900 not-italic">Vie</span>
                            </h2>
                        </div>

                        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap lg:flex-wrap bg-white p-2 rounded-[2rem] border border-slate-100 items-center gap-1.5 shadow-sm">
                            {(['all', 'announcement', 'event', 'service', 'donation', 'volunteer'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 shrink-0 ${filter === t ? 'bg-primary-900 text-white shadow-xl' : 'text-slate-400 hover:text-primary-950 hover:bg-slate-50'}`}
                                >
                                    {t === 'all' ? 'Explorer' : t === 'announcement' ? 'Actus' : t === 'donation' ? 'Dons' : t === 'volunteer' ? 'Actions' : t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[3rem] animate-pulse" />)
                        ) : publicContent.filter(item => filter === 'all' || item.category === filter).length === 0 ? (
                            <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase tracking-widest">Aucun contenu trouvé</div>
                        ) : (
                            publicContent
                                .filter(item => filter === 'all' || item.category === filter)
                                .map((item) => (
                                    <Link key={item.id} href={`/site/${item.slug}`} className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl hover:-translate-y-4 transition-all duration-500 hover:border-accent-gold/40 flex flex-col h-full ring-1 ring-slate-100/50">
                                        <div className={`size-16 rounded-[1.5rem] bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                            <span className="material-symbols-outlined text-white text-3xl">{getCategoryIcon(item.category)}</span>
                                        </div>
                                        <h3 className="text-3xl font-serif font-black text-primary-950 mb-6 cinzel-title uppercase leading-none">{item.title}</h3>
                                        <p className="text-slate-500 font-medium line-clamp-3 mb-10 flex-grow px-2">{item.excerpt}</p>
                                        <div className="flex items-center justify-between pt-8 border-t border-slate-50 px-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <FiArrowRight className="text-accent-gold text-2xl group-hover:translate-x-3 transition-transform" />
                                        </div>
                                    </Link>
                                ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
