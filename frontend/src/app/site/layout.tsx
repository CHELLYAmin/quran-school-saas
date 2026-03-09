'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';

const NAV_LINKS = [
    { name: 'Accueil', href: '/site' },
    { name: 'Le Centre', href: '/site/centre' },
    { name: 'Services', href: '/site/services' },
    { name: "L'Islam", href: '/site/islam' },
    { name: 'Horaires', href: '/site/horaires' },
    { name: 'Cimetière', href: '/site/cimetiere' },
    { name: 'Contact', href: '/contact' },
];

interface PrayerInfo {
    name: string;
    time: string;
}

export default function SiteLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mosqueAddress, setMosqueAddress] = useState('');
    const [nextPrayer, setNextPrayer] = useState<PrayerInfo | null>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        loadMosqueInfo();
    }, []);

    const loadMosqueInfo = async () => {
        try {
            // Load mosque settings with direct fetch (no apiClient/auth issues)
            const settingsRes = await fetch('http://localhost:5000/api/MosqueSettings');
            if (!settingsRes.ok) {
                console.warn('MosqueSettings API returned', settingsRes.status);
                return;
            }
            const settings = await settingsRes.json();
            console.log('Mosque settings loaded:', settings);

            if (settings?.address) {
                setMosqueAddress(settings.address);
            }

            // Load prayer times for next prayer
            if (settings?.latitude && settings?.longitude) {
                const now = new Date();
                const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
                const url = `http://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod || 2}`;
                const prayerRes = await fetch(url);
                if (!prayerRes.ok) return;
                const prayerJson = await prayerRes.json();

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
        <div className="min-h-screen bg-pearl dark:bg-dark-950 font-sans">
            {/* Info Bar */}
            <div className="bg-primary-900 text-pearl/80 py-2.5 px-6 lg:px-20 text-[10px] md:text-xs font-semibold tracking-widest uppercase border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-accent-gold">schedule</span>
                            {nextPrayer ? (
                                <span>Prochaine prière : <span className="text-white">{nextPrayer.name} ({nextPrayer.time})</span></span>
                            ) : (
                                <span>Centre Culturel Islamique de Québec</span>
                            )}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-6">
                            <span className="material-symbols-outlined text-[14px] text-accent-gold">location_on</span>
                            <span>{mosqueAddress || 'Québec, QC'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hover:text-white transition-colors">Espace Membre</Link>
                    </div>
                </div>
            </div>

            {/* Main Nav */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-pearl/95 dark:bg-dark-900/95 backdrop-blur-md shadow-xl shadow-primary-900/5 border-b border-primary/5' : 'bg-pearl/80 dark:bg-dark-900/80 backdrop-blur-sm'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4">
                    <Link href="/site" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary-900 text-accent-gold rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/10 group-hover:rotate-6 transition-all duration-500">
                            <span className="material-symbols-outlined text-2xl">mosque</span>
                        </div>
                        <div>
                            <h2 className="text-primary-900 dark:text-white text-lg md:text-xl font-serif font-black tracking-tight leading-none uppercase">CCIQ</h2>
                            <p className="text-[9px] font-bold text-accent-gold tracking-[0.2em] leading-none mt-1">Centre Culturel Islamique de Québec</p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        {NAV_LINKS.map(link => (
                            <Link key={link.name} href={link.href}
                                className={`text-xs font-bold tracking-wide transition-all hover:text-primary-900 dark:hover:text-white relative group uppercase ${pathname === link.href || (link.href !== '/site' && pathname.startsWith(link.href))
                                    ? 'text-primary-900 dark:text-white'
                                    : 'text-primary-900/60 dark:text-dark-400'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full ${pathname === link.href || (link.href !== '/site' && pathname.startsWith(link.href)) ? 'w-full' : ''
                                    }`}></span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/donate" className="bg-primary-900 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-accent-gold">favorite</span>
                            Donner
                        </Link>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden size-10 flex items-center justify-center text-primary-900 dark:text-white border border-primary/10 rounded-xl">
                            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden bg-pearl dark:bg-dark-900 border-t border-primary/5 p-6 space-y-4 animate-fade-in">
                        {NAV_LINKS.map(link => (
                            <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}
                                className={`block py-2 text-lg font-serif font-bold ${pathname === link.href ? 'text-primary-900 dark:text-white' : 'text-primary-900/60 dark:text-dark-400'}`}
                            >{link.name}</Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-primary-900 text-pearl/70">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 bg-white/10 text-accent-gold rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">mosque</span>
                                </div>
                                <div>
                                    <p className="font-serif font-black text-white uppercase tracking-tight">CCIQ</p>
                                    <p className="text-[9px] text-accent-gold tracking-widest">Québec</p>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed">Centre Culturel Islamique de Québec — Au service de la communauté musulmane depuis 1985.</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Navigation</h4>
                            <div className="space-y-2">
                                {NAV_LINKS.map(l => <Link key={l.name} href={l.href} className="block text-sm hover:text-white transition-colors">{l.name}</Link>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contact</h4>
                            <div className="space-y-2 text-sm">
                                <p>{mosqueAddress || '2877, chemin Sainte-Foy'}</p>
                                <p>Québec, QC G1X 1P7</p>
                                <p>Tél: 418-683-2323</p>
                                <p>info@cciq.org</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Liens utiles</h4>
                            <div className="space-y-2">
                                <Link href="/login" className="block text-sm hover:text-white transition-colors">Espace Membre</Link>
                                <Link href="/donate" className="block text-sm hover:text-white transition-colors">Faire un don</Link>
                                <Link href="/site/horaires" className="block text-sm hover:text-white transition-colors">Horaires de prière</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs">CCIQ &copy; {new Date().getFullYear()}. Tous droits réservés.</p>
                        <p className="text-[10px] text-pearl/40 uppercase tracking-widest">Propulsé par QuranSchool SaaS</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
