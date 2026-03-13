export default function ContactPage() {
    return (
        <div className="bg-[#FDFCFB]">
            {/* Premium Hero - Light Version */}
            <section className="relative overflow-hidden bg-[#FDFCFB] text-primary-950 pt-32 pb-48 px-6 border-b border-slate-100">
                {/* Architectural Elements (inspired by homepage) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-primary-900/5 rounded-full -z-0 animate-pulse-slow" />
                


                <div className="container mx-auto max-w-4xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 text-primary-950 text-[10px] font-black tracking-[0.3em] uppercase">
                        <span className="size-2 rounded-full bg-accent-gold mr-2 animate-pulse" />
                        Contactez-Nous
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 tracking-tighter leading-[0.9] cinzel-title uppercase text-primary-950">
                        Nous sommes à <br />
                        <span className="relative inline-block text-primary-900 pb-2">
                             votre écoute
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Que ce soit pour une inscription, un don ou une simple question, notre équipe est là pour vous répondre chaleureusement.
                    </p>
                </div>
            </section>

            {/* Contact Content & Form Overlay - Pearl Theme */}
            <section className="px-6 flex-grow pb-24 relative z-30 -mt-32">
                <div className="container mx-auto max-w-6xl">
                    <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(6,78,59,0.08)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row">

                        {/* Infos pratiques (Left Side) - Pearl Light Version */}
                        <div className="lg:w-2/5 bg-primary-900 text-white p-10 lg:p-14 relative overflow-hidden border-r border-white/10">
                            <div className="absolute inset-0 zellige-pattern opacity-10" />
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 h-full flex flex-col">
                                <h2 className="text-[10px] font-black text-accent-gold tracking-[0.3em] uppercase mb-4">Où nous trouver</h2>
                                <h3 className="text-4xl font-serif font-black tracking-tighter mb-12 cinzel-title uppercase leading-none text-white">
                                    Centre <br /> Culturel
                                </h3>

                                <div className="space-y-10 flex-1">
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-14 h-14 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-accent-gold group-hover:text-primary-950 transition-all duration-500 text-accent-gold">
                                            <span className="material-symbols-outlined">location_on</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[10px] tracking-[0.2em] uppercase text-primary-300 mb-2">Adresse</h4>
                                            <p className="text-white font-serif text-lg leading-tight uppercase cinzel-title">1234 Rue de la Paix<br />Montréal, QC H1X 2Y3</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-14 h-14 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-accent-gold group-hover:text-primary-950 transition-all duration-500 text-accent-gold">
                                            <span className="material-symbols-outlined">call</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[10px] tracking-[0.2em] uppercase text-primary-300 mb-2">Téléphone</h4>
                                            <p className="text-white font-serif text-lg leading-tight uppercase cinzel-title">+1 (514) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-14 h-14 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-accent-gold group-hover:text-primary-950 transition-all duration-500 text-accent-gold">
                                            <span className="material-symbols-outlined">mail</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[10px] tracking-[0.2em] uppercase text-primary-300 mb-2">Email</h4>
                                            <p className="text-white font-serif text-lg leading-tight uppercase cinzel-title">contact@cciq.org</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-12 border-t border-white/10 flex gap-4">
                                    {['facebook', 'instagram', 'twitter'].map(social => (
                                        <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-gold hover:text-primary-950 transition-all duration-500 group text-white/40">
                                            <span className="material-symbols-outlined text-xl opacity-60 group-hover:opacity-100">{social === 'twitter' ? 'social_distance' : social === 'facebook' ? 'public' : 'camera'}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form (Right Side) - Ultra Clean */}
                        <div className="lg:w-3/5 p-10 lg:p-16 bg-white">
                            <div className="mb-10">
                                <h3 className="text-3xl font-serif font-black text-primary-950 tracking-tighter cinzel-title uppercase mb-2">Envoyez-nous un message</h3>
                                <div className="h-1 w-20 bg-accent-gold/40 rounded-full" />
                            </div>
                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Nom complet</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold text-primary-950 text-sm transition-all focus:ring-4 focus:ring-primary-500/5 placeholder:text-slate-300"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold text-primary-950 text-sm transition-all focus:ring-4 focus:ring-primary-500/5 placeholder:text-slate-300"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Sujet</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold text-primary-950 text-sm transition-all focus:ring-4 focus:ring-primary-500/5 placeholder:text-slate-300"
                                        placeholder="Inscription aux cours d'arabe"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Message</label>
                                    <textarea
                                        rows={5}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-bold text-primary-950 text-sm transition-all focus:ring-4 focus:ring-primary-500/5 placeholder:text-slate-300 resize-none"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                    ></textarea>
                                </div>
                                <button type="button" className="w-full py-5 bg-primary-900 hover:bg-primary-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all mt-4 border border-white/10 group flex items-center justify-center gap-3">
                                    Envoyer le message
                                    <span className="material-symbols-outlined text-accent-gold group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder - Light Styling */}
            <section className="py-24 pt-0">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="w-full h-[450px] bg-slate-50 border border-slate-100 rounded-[3rem] overflow-hidden shadow-inner flex items-center justify-center relative group">
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Montreal,QC&zoom=13&size=1200x400&maptype=roadmap')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-primary-900/5 mix-blend-overlay"></div>
                        <div className="z-10 bg-white/80 backdrop-blur-xl px-12 py-10 rounded-[2.5rem] text-center shadow-2xl border border-white/40 transform group-hover:-translate-y-4 transition-all duration-700">
                            <div className="size-16 bg-primary-900 rounded-2xl flex items-center justify-center text-accent-gold mx-auto mb-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                                <span className="material-symbols-outlined text-3xl">map</span>
                            </div>
                            <h4 className="font-serif font-black text-3xl text-primary-950 tracking-tighter cinzel-title uppercase mb-2">Montréal, QC</h4>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Google Maps API Required</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
