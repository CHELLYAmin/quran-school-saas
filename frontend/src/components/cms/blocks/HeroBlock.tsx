import React from 'react';

export default function HeroBlock({ data }: { data: any }) {
    return (
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-primary-950">
            {/* Sacred Emerald Background with Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-primary-950/80 to-primary-950" />
            
            {/* Islamic Motif Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
                {data.tag && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in shadow-lg shadow-gold/5">
                        {data.tag}
                    </span>
                )}
                
                <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-serif font-black text-white cinzel-title mb-8 leading-[1.1] tracking-tight">
                    {data.title}
                </h1>
                
                <p className="text-lg md:text-xl text-emerald-50/70 max-w-3xl mx-auto mb-12 font-medium leading-relaxed italic">
                    {data.subtitle}
                </p>
                
                {data.ctaText && (
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href={data.ctaLink || '#'} className="group relative inline-flex items-center gap-4 bg-accent-gold text-primary-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-accent-gold/20 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-500">
                            {data.ctaText}
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                        </a>
                        
                        {data.secondaryCtaText && (
                            <a href={data.secondaryCtaLink || '#'} className="inline-flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                {data.secondaryCtaText}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
