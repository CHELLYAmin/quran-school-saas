'use client';

import { useState, useEffect, useRef } from 'react';
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
    const [announcements, setAnnouncements] = useState<CmsPage[]>([]);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setAnnouncements(cmsData.filter((p: CmsPage) => p.category === 'announcement'));
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

                // Live Announcement Logic
                if (settings.isLiveAnnouncementActive) {
                    const now = new Date();
                    const start = settings.liveAnnouncementStartDate ? new Date(settings.liveAnnouncementStartDate) : null;
                    const end = settings.liveAnnouncementEndDate ? new Date(settings.liveAnnouncementEndDate) : null;
                    
                    // Normalize dates to midnight for date-only comparison if needed, 
                    // but here we just check if now is between start and end.
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
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 flex flex-col font-sans">
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

            {/* Hero Section - Super Premium */}
            <section className="relative min-h-[95vh] flex items-center bg-white dark:bg-dark-900 overflow-hidden isolate shadow-2xl">
                {/* Architectural Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-primary-900/5 rounded-full -z-10 animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-primary-900/10 rounded-full -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-primary-900/15 rounded-full -z-10" />
                
                {/* Gradient Glows */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-900/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[120px] -z-10" />

                <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center justify-center text-center relative z-20">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 mb-12 animate-fade-in">
                        <span className="size-2 rounded-full bg-accent-gold animate-pulse" />
                        <span className="text-primary-950 dark:text-primary-100 font-black tracking-[0.3em] text-[10px] uppercase">
                            Excellence • Sagesse • Partage
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-serif font-black text-primary-950 dark:text-white leading-[0.9] tracking-tighter max-w-6xl text-balance cinzel-title uppercase">
                        Nourrissez votre <br className="hidden md:block" />
                        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-400 dark:to-primary-600 pb-2">
                             esprit.
                            <svg className="absolute -bottom-4 left-0 w-full h-8 text-accent-gold opacity-20" preserveAspectRatio="none" viewBox="0 0 400 30">
                                <path d="M0,15 Q100,0 200,15 T400,15" fill="none" stroke="currentColor" strokeWidth="8" />
                            </svg>
                        </span>
                    </h1>

                    <p className="mt-12 text-xl md:text-2xl text-slate-500 dark:text-dark-400 max-w-3xl font-medium leading-relaxed text-balance">
                        Rejoignez le <span className="text-primary-950 dark:text-white font-bold">Centre Culturel Islamique de Québec</span>, une institution d&apos;exception pour l&apos;apprentissage et l&apos;épanouissement spirituel.
                    </p>

                    <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center w-full max-w-xl mx-auto sm:max-w-none px-6">
                        <Link href="/register" className="inline-flex items-center justify-center rounded-[2rem] bg-primary-900 px-12 py-6 text-sm font-black text-white shadow-2xl shadow-primary-900/30 hover:bg-black hover:-translate-y-2 transition-all duration-500 uppercase tracking-widest border border-white/10 group">
                            S&apos;inscrire à l&apos;académie
                            <FiArrowRight className="ml-3 text-xl group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link href="/donate" className="inline-flex items-center justify-center rounded-[2rem] bg-white dark:bg-dark-800 px-12 py-6 text-sm font-black text-primary-900 dark:text-white border border-slate-100 dark:border-dark-700 shadow-xl hover:bg-slate-50 dark:hover:bg-primary-900/40 hover:-translate-y-2 transition-all duration-500 uppercase tracking-widest group">
                            <FiHeart className="mr-3 text-accent-gold group-hover:scale-125 transition-transform" />
                            Soutenir le Centre
                        </Link>
                    </div>

                    {/* Live Stats Table - Super Compact & Premium */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24 py-12 border-t border-slate-100 dark:border-dark-800 w-full max-w-5xl">
                        {[
                            { label: 'Élèves actifs', value: stats?.activeStudentsCount ?? '450', suffix: '+' },
                            { label: 'Enseignants', value: stats?.activeTeachersCount ?? '32', suffix: '' },
                            { label: "Niveaux d'étude", value: stats?.totalGroupsCount ?? '12', suffix: '' },
                            { label: 'Progression', value: '100', suffix: '%' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2 items-center group">
                                <span className="text-5xl font-serif font-black text-primary-950 dark:text-white cinzel-title tracking-tighter group-hover:scale-110 transition-transform duration-500">
                                    {stat.value}{stat.suffix}
                                </span>
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-gold opacity-80">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Prayer Schedule — High Contrast Dark Mode */}
            <section id="horaires" className="bg-[#0A100D] text-white relative isolate py-24 lg:py-32 flex items-center min-h-[850px] overflow-hidden">
                <div className="absolute inset-0 islamic-pattern opacity-[0.03]" />
                <div className="absolute top-0 inset-x-0 h-px bg-white/10" />
                
                {/* Decorative Elements */}
                <div className="absolute -top-1/4 -right-1/4 w-full h-full border border-white/5 rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-full h-full border border-white/5 rounded-full" />

                <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center relative z-10 w-full">
                    <div className="lg:col-span-12 text-center mb-10">
                        <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">Spiritualité & Rythme</span>
                        <h2 className="text-5xl md:text-7xl font-serif font-black leading-none cinzel-title uppercase group inline-block">
                             Horaires de <span className="text-accent-gold italic">Prière</span>
                             <div className="h-2 w-0 group-hover:w-full bg-accent-gold/30 transition-all duration-1000 mt-2 rounded-full" />
                        </h2>
                    </div>

                    <div className="lg:col-span-5 flex justify-center w-full">
                        {/* Prayer Card - Super Precise & Premium */}
                        <div className="w-full max-w-[420px] bg-white text-dark-900 p-8 md:p-10 rounded-[3rem] shadow-3xl shadow-black relative border-4 border-primary-950 group transition-all duration-700">
                            <div className="absolute -top-6 -right-6 size-20 bg-accent-gold rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-0 transition-transform duration-500">
                                <span className="material-symbols-outlined text-4xl text-primary-950">mosque</span>
                            </div>

                            <div className="flex justify-between items-end border-b-2 border-slate-50 pb-8 mb-8">
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

                            {/* Date Carousel - Minified & Sleek */}
                            <div className="flex items-center gap-4 mb-10">
                                <button onClick={() => navigateCalendar(-1)} className="size-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-900 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm">
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
                                                    className={`flex flex-col items-center justify-center min-w-[64px] size-16 rounded-2xl transition-all duration-700 border relative shrink-0 ${isActive ? 'bg-primary-950 text-white border-primary-950 shadow-2xl scale-110 z-10' : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'}`}
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

                                <button onClick={() => navigateCalendar(1)} className="size-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-900 hover:bg-primary-900 hover:text-white transition-all active:scale-95 shrink-0 shadow-sm">
                                    <FiChevronRight size={20} />
                                </button>
                            </div>

                            {/* Times List - High Impact Styles */}
                            <div className="space-y-3">
                                {prayerTimes.length > 0 ? (
                                    prayerTimes.map((p, i) => (
                                        <div key={i} className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all duration-500 ${p.active ? 'bg-primary-950 text-white shadow-2xl ring-4 ring-primary-900/10 scale-[1.05] z-10 relative' : 'bg-slate-50/50 hover:bg-slate-50 text-dark-900'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${p.active ? 'text-accent-gold' : 'text-slate-400'}`}>
                                                    {p.isRamadan ? 'Ramadan Schedule' : 'Prière'}
                                                </span>
                                                <span className={`font-serif font-black text-xl cinzel-title uppercase tracking-tighter leading-tight ${p.active ? 'text-white' : 'text-primary-950'}`}>
                                                    {p.name === 'Maghrib' ? 'Iftar' : p.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-10 text-right">
                                                <div>
                                                    <span className={`block text-[9px] uppercase font-black tracking-widest mb-1 ${p.active ? 'text-accent-gold/60' : 'text-slate-300'}`}>Adhan</span>
                                                    <span className={`font-mono text-base font-black ${p.active ? 'text-white' : 'text-slate-600'}`}>{p.time}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[9px] uppercase font-black tracking-widest mb-1 ${p.active ? 'text-accent-gold/60' : 'text-slate-300'}`}>Iqama</span>
                                                    <span className={`font-mono text-base font-black ${p.active ? 'text-white' : 'text-primary-950 underline decoration-accent-gold decoration-2 underline-offset-4'}`}>{p.iqama}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center animate-pulse flex flex-col items-center gap-4">
                                        <div className="size-12 rounded-full border-4 border-slate-100 border-t-primary-900 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Précision temporelle en cours...</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center group/footer cursor-pointer" onClick={() => router.push('/site/horaires')}>
                                <div>
                                    <span className="block font-black text-primary-950 text-xl cinzel-title uppercase tracking-tighter">Jumu&apos;ah</span>
                                    <p className="text-[10px] font-black text-accent-gold tracking-[0.3em] uppercase opacity-80">Vendredi • Prière Collective</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-primary-950 text-2xl font-mono">12:30</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horaire Fixe</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px]">Notre Vision</span>
                            {/* Hero Title with Clamp for perfect responsiveness */}
                            <h1 className="text-[clamp(2.5rem,10vw,7.5rem)] font-serif font-black text-white leading-[0.85] tracking-tighter cinzel-title">
                                Une éducation <span className="text-accent-gold italic">pure</span>,<br />
                                centrée sur le <span className="underline decoration-accent-gold/40 underline-offset-[12px]">Coran.</span>
                            </h1>
                            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
                                Au-delà d&apos;un simple lieu de culte, le CCIQ est un pôle d&apos;excellence académique où chaque enfant et adulte peut s&apos;épanouir dans la mémorisation et la compréhension de la parole divine.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                            {[
                                { title: 'Authenticité', desc: 'Des professeurs diplômés avec une chaîne de transmission (Ijaza) préservée.', icon: 'verified' },
                                { title: 'Technologie', desc: 'Un suivi numérique moderne via notre plateforme exclusive QuranSchool SaaS.', icon: 'devices' }
                            ].map((val, i) => (
                                <div key={i} className="space-y-4 group">
                                    <div className="size-12 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-primary-950 transition-all duration-500">
                                        <span className="material-symbols-outlined text-2xl">{val.icon}</span>
                                    </div>
                                    <h4 className="text-white font-black text-2xl cinzel-title uppercase tracking-tighter">{val.title}</h4>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Hub de Vie — Ultra Modern Cards */}
            <section className="py-24 lg:py-40 bg-[#FDFCFB] rounded-t-[5rem] -mt-20 relative z-30 shadow-2xl border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
                        <div className="space-y-4">
                            <span className="text-accent-gold font-black uppercase tracking-[0.5em] text-[10px]">Vie Sociale</span>
                            <h2 className="text-primary-950 font-serif text-6xl lg:text-[6.5rem] font-black uppercase leading-[0.85] tracking-tighter cinzel-title italic">
                                Hub de <span className="text-primary-900 not-italic">Vie</span>
                            </h2>
                            <p className="text-slate-500 dark:text-dark-400 max-w-xl text-lg font-medium leading-relaxed border-l-4 border-accent-gold pl-8 md:mt-6">
                                Connectez-vous aux projets, aux besoins et aux accomplissements de notre communauté vivante à Québec.
                            </p>
                        </div>

                        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap lg:flex-wrap bg-white p-2 rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-primary-900/5 items-center gap-1.5 md:gap-0">
                            {(['all', 'announcement', 'event', 'service', 'donation', 'volunteer'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 shrink-0 ${filter === t ? 'bg-primary-950 text-white shadow-2xl scale-105 z-10' : 'text-slate-400 hover:text-primary-950 hover:bg-slate-50'}`}
                                >
                                    {t === 'all' ? 'Explorer' : t === 'announcement' ? 'Actualités' : t === 'event' ? 'Événements' : t === 'service' ? 'Services' : t === 'donation' ? 'Soutien' : 'Action'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-12">
                            {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-slate-100 rounded-[3rem] animate-pulse" />)}
                        </div>
                    ) : (publicContent.filter(item => filter === 'all' || item.category === filter).length === 0) ? (
                        <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-[100px] text-slate-200 mb-6">inventory_2</span>
                            <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[11px]">Prochainement disponible</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14">
                            {publicContent
                                .filter(item => filter === 'all' || item.category === filter)
                                .map((item) => (
                                    <Link key={item.id} href={`/site/${item.slug}`}
                                        className="group relative flex flex-col bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-[0_40px_80px_rgba(6,78,59,0.12)] transition-all duration-700 hover:-translate-y-4 hover:border-accent-gold/40"
                                    >
                                        <div className={`relative h-64 overflow-hidden bg-gradient-to-br ${getCategoryColor(item.category)}`}>
                                            <div className="absolute inset-0 zellige-pattern opacity-10" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-24 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 group-hover:bg-accent-gold transition-all duration-700">
                                                    <span className="material-symbols-outlined text-white text-5xl group-hover:text-primary-950 transition-colors">
                                                        {getCategoryIcon(item.category)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Category Ribbon */}
                                            <div className="absolute top-8 left-8">
                                                <span className="bg-primary-950/90 backdrop-blur-md text-accent-gold px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-10 space-y-6 flex flex-1 flex-col">
                                            <div className="flex items-center justify-between">
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <span className="px-4 text-slate-300 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                    {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(item.createdAt))}
                                                </span>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            <h3 className="text-3xl font-serif font-black text-primary-950 leading-[0.95] cinzel-title uppercase group-hover:text-primary-800 transition-colors">
                                                {item.title}
                                            </h3>

                                            {item.excerpt && (
                                                <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-3 opacity-80">{item.excerpt}</p>
                                            )}

                                            <div className="pt-8 mt-auto flex items-center justify-between group/action">
                                                <span className="text-primary-950 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                                    Consulter
                                                    <FiArrowRight className="text-accent-gold group-hover/action:translate-x-3 transition-transform duration-500" />
                                                </span>
                                                <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary-950 transition-all duration-500">
                                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-accent-gold">arrow_forward_ios</span>
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
