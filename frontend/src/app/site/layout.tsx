'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api/client';

const NAV_LINKS = [
    { name: 'Accueil', href: '/site' },
    { name: 'Le Centre', href: '/site/centre' },
    { name: 'Services', href: '/site/services' },
    { name: "L'Islam", href: '/site/islam' },
    { name: 'Horaires', href: '/site/horaires' },
    { name: 'Cimetière', href: '/site/cimetiere' },
    { name: 'Contact', href: '/site/contact' },
];

interface PrayerInfo {
    name: string;
    time: string;
}

interface MosqueSettings {
    address?: string;
    latitude?: number;
    longitude?: number;
    calculationMethod?: number;
}

interface PrayerApiResponse {
    data: {
        timings: Record<string, string>;
    };
}

export default function SiteLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mosqueAddress, setMosqueAddress] = useState('');
    const [nextPrayer, setNextPrayer] = useState<PrayerInfo | null>(null);

    const [navLinks, setNavLinks] = useState(NAV_LINKS);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        loadMosqueInfo();
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            const res = await api.get('/api/cms/menu');
            if (res.data && res.data.length > 0) {
                setNavLinks(res.data.map((item: any) => ({
                    name: item.title,
                    href: item.slug === 'home' ? '/site' : `/site/${item.slug}`,
                    icon: item.icon
                })));
            }
        } catch (e) {
            console.error('Failed to load menu', e);
        }
    };

    const loadMosqueInfo = async () => {
        try {
            const settingsRes = await api.get('/api/MosqueSettings');
            const settings: MosqueSettings = settingsRes.data;

            if (settings?.address) {
                setMosqueAddress(settings.address);
            }

            if (settings?.latitude && settings?.longitude) {
                const now = new Date();
                const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
                const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod || 2}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const prayerRes = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (!prayerRes.ok) return;
                const prayerJson: PrayerApiResponse = await prayerRes.json();

                if (prayerJson?.data?.timings) {
                    const timings = prayerJson.data.timings;
                    const prayers = [
                        { name: 'Fajr', time: timings.Fajr },
                        { name: 'Dhuhr', time: timings.Dhuhr },
                        { name: 'Asr', time: timings.Asr },
                        { name: 'Maghrib', time: timings.Maghrib },
                        { name: 'Isha', time: timings.Isha },
                    ];

                    // Find next prayer
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                    let found = false;
                    for (const p of prayers) {
                        const cleanTime = p.time.split(' ')[0];
                        const [h, m] = cleanTime.split(':').map(Number);
                        if (h * 60 + m > nowMinutes) {
                            setNextPrayer({ name: p.name, time: cleanTime });
                            found = true;
                            break;
                        }
                    }
                    // If no next prayer today, show Fajr tomorrow
                    if (!found) {
                        setNextPrayer({ name: 'Fajr (demain)', time: prayers[0].time.split(' ')[0] });
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load mosque info', e);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 font-sans text-dark-900 dark:text-dark-100">
            {/* Info Bar - Premium Glassmorphism */}
            <div className="bg-primary-950/95 dark:bg-black/80 backdrop-blur-md text-emerald-50/70 py-3 px-6 lg:px-20 text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase border-b border-white/5 z-[60] relative">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5 group">
                            <span className="material-symbols-outlined text-[16px] text-accent-gold group-hover:rotate-12 transition-transform">schedule</span>
                            {nextPrayer ? (
                                <span>Prochaine prière : <span className="text-white font-extrabold">{nextPrayer.name} • {nextPrayer.time}</span></span>
                            ) : (
                                <span className="animate-pulse">Calcul des horaires...</span>
                            )}
                        </div>
                        <div className="hidden md:flex items-center gap-2.5 border-l border-white/10 pl-8 group">
                            <span className="material-symbols-outlined text-[16px] text-accent-gold group-hover:-translate-y-1 transition-transform">location_on</span>
                            <span className="truncate max-w-[300px]">{mosqueAddress || '2877 ch. Sainte-Foy, Québec'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="hover:text-accent-gold transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Espace Membre
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Nav - Floating & Blurred */}
            <header className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled || menuOpen ? 'bg-white dark:bg-dark-950 shadow-2xl shadow-primary-900/10 py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10">
                    <Link href="/site" className="flex items-center gap-4 group">
                        <div className="size-12 bg-primary-900 text-accent-gold rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/10">
                            <span className="material-symbols-outlined text-3xl">mosque</span>
                        </div>
                        <div>
                            <h2 className="text-primary-900 dark:text-white text-xl md:text-2xl font-serif font-black tracking-tighter leading-none uppercase cinzel-title">CCIQ</h2>
                            <p className="text-[10px] font-black text-accent-gold tracking-[0.3em] leading-none mt-1.5 opacity-80 uppercase">Life Hub & Academy</p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href}
                                className={`text-[11px] font-black tracking-[0.15em] transition-all hover:text-primary-900 dark:hover:text-white relative group uppercase ${pathname === link.href || (link.href !== '/site' && pathname.startsWith(link.href))
                                    ? 'text-primary-900 dark:text-white'
                                    : 'text-primary-900/40 dark:text-dark-500'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent-gold rounded-full transition-all duration-500 group-hover:w-full ${pathname === link.href || (link.href !== '/site' && pathname.startsWith(link.href)) ? 'w-2' : ''
                                    }`}></span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/donate" className="bg-primary-900 text-white px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-900/30 hover:bg-primary-950 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-2.5 border border-white/10">
                            <span className="material-symbols-outlined text-lg text-accent-gold">volunteer_activism</span>
                            Donner
                        </Link>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden size-12 flex items-center justify-center text-primary-900 dark:text-white bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-2xl shadow-lg shadow-black/5">
                            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Premium Drawer */}
                {menuOpen && (
                    <div className="lg:hidden fixed inset-0 z-[100] bg-primary-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setMenuOpen(false)}>
                        <div className="absolute right-0 top-0 bottom-0 w-4/5 bg-white dark:bg-dark-950 p-8 shadow-2xl flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-2xl font-serif font-black text-primary-900 dark:text-white cinzel-title">MENU</h3>
                                <button onClick={() => setMenuOpen(false)} className="size-10 rounded-full bg-dark-50 dark:bg-dark-900 flex items-center justify-center">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="space-y-6">
                                {navLinks.map(link => (
                                    <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}
                                        className={`block py-3 text-2xl font-serif font-bold tracking-tight cinzel-title border-b border-dark-50 dark:border-dark-900/50 ${pathname === link.href ? 'text-primary-900 dark:text-white' : 'text-dark-400'}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-auto pt-10">
                                <Link href="/donate" onClick={() => setMenuOpen(false)} className="flex items-center justify-center w-full bg-primary-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-primary-900/20">
                                    Soutenir le Centre
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="relative z-10">{children}</main>

            {/* Footer - Premium Dark Design */}
            <footer className="bg-primary-950 text-white border-t border-white/5 overflow-hidden relative">
                {/* Subtle Islamic Motif Background */}
                <div className="absolute inset-0 islamic-pattern opacity-[0.03]" />
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 bg-white/5 text-accent-gold rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                    <span className="material-symbols-outlined text-3xl">mosque</span>
                                </div>
                                <div className="cinzel-title">
                                    <p className="font-serif font-black text-2xl uppercase tracking-tighter leading-none">CCIQ</p>
                                    <p className="text-[10px] text-accent-gold font-bold tracking-[0.4em] uppercase mt-1">Québec City</p>
                                </div>
                            </div>
                            <p className="text-sm text-pearl/60 leading-relaxed font-medium">
                                Le Centre Culturel Islamique de Québec est une institution dédiée à l&apos;épanouissement spirituel et social de la communauté depuis 1985.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-black text-accent-gold uppercase tracking-[0.3em] mb-10 pb-2 border-b border-accent-gold/20 inline-block">Navigation</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {navLinks.map(l => (
                                    <Link key={l.name} href={l.href} className="text-sm font-bold text-pearl/60 hover:text-white transition-all flex items-center group">
                                        <span className="w-0 group-hover:w-4 h-0.5 bg-accent-gold mr-0 group-hover:mr-2 transition-all rounded-full" />
                                        {l.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-accent-gold uppercase tracking-[0.3em] mb-10 pb-2 border-b border-accent-gold/20 inline-block">Contact</h4>
                            <div className="space-y-6 text-sm text-pearl/60 font-medium leading-relaxed">
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-accent-gold shrink-0">location_on</span>
                                    <p>{mosqueAddress || '2877, chemin Sainte-Foy, Québec, QC G1X 1P7'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-accent-gold shrink-0">call</span>
                                    <p>418-683-2323</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-accent-gold shrink-0">mail</span>
                                    <p>info@cciq.org</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-accent-gold uppercase tracking-[0.3em] mb-10 pb-2 border-b border-accent-gold/20 inline-block">Vie du Centre</h4>
                            <div className="space-y-4">
                                <Link href="/donate" className="block p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                    <p className="text-accent-gold font-black text-[10px] uppercase tracking-widest mb-1">Soutien financier</p>
                                    <p className="text-sm font-serif font-black cinzel-title">Faire un Sadaka Jariya</p>
                                </Link>
                                <Link href="/site/horaires" className="block p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                    <p className="text-accent-gold font-black text-[10px] uppercase tracking-widest mb-1">Culte</p>
                                    <p className="text-sm font-serif font-black cinzel-title">Horaires de Prière</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
