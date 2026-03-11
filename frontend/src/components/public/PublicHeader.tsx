'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll Lock
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const navLinks = [
        { name: 'Accueil', href: '/site' },
        { name: 'Le Centre', href: '/site/centre' },
        { name: 'Services', href: '/site/services' },
        { name: "L'Islam", href: '/site/islam' },
        { name: 'Horaires', href: '/site/horaires' },
        { name: 'Cimetière', href: '/site/cimetiere' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="fixed top-0 w-full z-[100]">
            {/* Info Bar */}
            <div className="bg-primary-900 text-pearl/80 py-2 px-6 lg:px-20 text-[10px] md:text-xs font-semibold tracking-widest uppercase border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-accent-gold">schedule</span>
                            <span>Prochaine Prière : <span className="text-white">Maghrib (19:40)</span></span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-6">
                            <span className="material-symbols-outlined text-[14px] text-accent-gold">location_on</span>
                            <span>Montréal, QC</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-white transition-colors">FR</button>
                        <span className="text-white/20">|</span>
                        <button className="hover:text-white transition-colors">AR</button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className={`transition-all duration-300 ${isScrolled ? 'bg-pearl/95 backdrop-blur-md py-3 shadow-xl shadow-primary-900/5 border-b border-primary/5' : 'bg-pearl/80 backdrop-blur-sm py-5 px-6 lg:px-20'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-0">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary-900 text-accent-gold rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/10 group-hover:rotate-6 transition-all duration-500">
                            <span className="material-symbols-outlined text-2xl">mosque</span>
                        </div>
                        <div>
                            <h2 className="text-primary-900 text-lg md:text-xl font-serif font-black tracking-tight leading-none uppercase">
                                Al-Sanctuaire
                            </h2>
                            <p className="text-[9px] font-bold text-accent-gold tracking-[0.2em] leading-none mt-1">Digital Academy</p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-bold tracking-wide transition-all hover:text-primary-900 relative group uppercase ${pathname === link.href ? 'text-primary-900' : 'text-primary-900/60'}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full ${pathname === link.href ? 'w-full' : ''}`}></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hidden lg:flex items-center gap-2 text-primary-900/80 hover:text-primary-900 text-xs font-bold uppercase tracking-widest border border-primary/20 px-5 py-2.5 rounded-full transition-all hover:bg-white">
                            <span className="material-symbols-outlined text-lg">login</span>
                            Membres
                        </Link>
                        <Link href="/donate" className="bg-primary-900 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
                            <span className="material-symbols-outlined text-lg text-accent-gold">favorite</span>
                            Donner
                        </Link>

                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden size-10 flex items-center justify-center text-primary-900 border border-primary/10 rounded-xl"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-primary-950/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="absolute right-0 top-0 h-full w-[85%] max-w-[400px] bg-pearl shadow-2xl animate-slide-in flex flex-col">
                        <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-10 shrink-0">
                                <span className="text-xl font-serif font-black text-primary-900 tracking-tighter">ACCÈS RAPIDE</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="size-10 flex items-center justify-center border border-primary/10 rounded-full hover:bg-primary-900 hover:text-white transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`py-3 text-xl font-serif border-b border-primary/5 flex items-center justify-between group transition-colors ${pathname === link.href ? 'text-accent-gold' : 'text-primary-900 hover:text-accent-gold'}`}
                                    >
                                        {link.name}
                                        <span className={`material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 ${pathname === link.href ? 'opacity-100' : 'opacity-0'}`}>east</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-8 pt-8 border-t border-primary/10 space-y-4 shrink-0">
                                <Link onClick={() => setIsMenuOpen(false)} href="/login" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-primary-900 text-white font-bold uppercase tracking-widest shadow-lg shadow-primary-900/20 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-accent-gold">person</span>
                                    Espace Membre
                                </Link>
                                <p className="text-[9px] text-center text-primary-900/40 font-bold uppercase tracking-[0.4em] mt-4">
                                    Baraka Allahou Fikoum
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
