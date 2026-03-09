import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col font-sans selection:bg-accent-500/30">
            <PublicHeader />

            {/* Premium Hero */}
            <section className="relative overflow-hidden bg-primary-950 text-white pt-24 pb-48 px-6">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/90 via-primary-950/95 to-primary-950"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-50 dark:from-dark-950 to-transparent z-10 w-full"></div>

                <div className="container mx-auto max-w-4xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-5 py-2.5 rounded-full border border-primary-500/30 bg-primary-900/50 backdrop-blur-md text-accent-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary-900/20">
                        Contactez-Nous
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-tight drop-shadow-2xl">
                        Nous sommes à <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">votre écoute</span>
                    </h1>
                    <p className="text-xl text-primary-100/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                        Que ce soit pour une inscription, un don ou une simple question, notre équipe est là pour vous répondre chaleureusement.
                    </p>
                </div>
            </section>

            {/* Contact Content & Form Overlay */}
            <section className="px-6 flex-grow pb-24 relative z-30 -mt-32">
                <div className="container mx-auto max-w-6xl">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl shadow-dark-900/5 border border-dark-100 dark:border-dark-800 overflow-hidden flex flex-col lg:flex-row">

                        {/* Infos pratiques (Left Side) */}
                        <div className="lg:w-2/5 bg-primary-950 text-white p-10 lg:p-14 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-600/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10 h-full flex flex-col">
                                <h2 className="text-[11px] font-black text-accent-400 tracking-[0.2em] uppercase mb-4">Où nous trouver</h2>
                                <h3 className="text-4xl font-black tracking-tight mb-12">
                                    Centre Culturel
                                </h3>

                                <div className="space-y-8 flex-1">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-accent-500 group-hover:border-accent-400 transition-all duration-300">
                                            📍
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-widest uppercase text-primary-200 mb-2">Adresse</h4>
                                            <p className="text-white font-medium leading-relaxed">1234 Rue de la Paix<br />Montréal, QC H1X 2Y3</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-accent-500 group-hover:border-accent-400 transition-all duration-300">
                                            📞
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-widest uppercase text-primary-200 mb-2">Téléphone</h4>
                                            <p className="text-white font-medium leading-relaxed">+1 (514) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-accent-500 group-hover:border-accent-400 transition-all duration-300">
                                            ✉️
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-widest uppercase text-primary-200 mb-2">Email</h4>
                                            <p className="text-white font-medium leading-relaxed">contact@cciq.org</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    {/* Social media minimal placeholder */}
                                    {['Fb', 'Ig', 'Tw'].map(social => (
                                        <a key={social} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold hover:bg-white hover:text-primary-950 transition-colors">
                                            {social}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form (Right Side) */}
                        <div className="lg:w-3/5 p-10 lg:p-14 bg-white dark:bg-dark-900">
                            <h3 className="text-2xl font-black text-dark-900 dark:text-white tracking-tight mb-8">Envoyez-nous un message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-dark-500 dark:text-dark-400 uppercase tracking-[0.2em] ml-1">Nom complet</label>
                                        <input
                                            type="text"
                                            className="w-full bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-bold text-dark-900 dark:text-white text-sm transition-all shadow-inner focus:ring-4 focus:ring-primary-500/10 placeholder:text-dark-300 dark:placeholder:text-dark-600"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-dark-500 dark:text-dark-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-bold text-dark-900 dark:text-white text-sm transition-all shadow-inner focus:ring-4 focus:ring-primary-500/10 placeholder:text-dark-300 dark:placeholder:text-dark-600"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-dark-500 dark:text-dark-400 uppercase tracking-[0.2em] ml-1">Sujet</label>
                                    <input
                                        type="text"
                                        className="w-full bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-bold text-dark-900 dark:text-white text-sm transition-all shadow-inner focus:ring-4 focus:ring-primary-500/10 placeholder:text-dark-300 dark:placeholder:text-dark-600"
                                        placeholder="Inscription aux cours d'arabe"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-dark-500 dark:text-dark-400 uppercase tracking-[0.2em] ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 focus:border-primary-500 rounded-2xl px-5 py-4 outline-none font-bold text-dark-900 dark:text-white text-sm transition-all shadow-inner focus:ring-4 focus:ring-primary-500/10 placeholder:text-dark-300 dark:placeholder:text-dark-600 resize-none"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                    ></textarea>
                                </div>

                                <button type="button" className="w-full py-4 bg-primary-950 hover:bg-primary-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-950/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all mt-4 border border-primary-800">
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="py-24 pt-0">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="w-full h-[400px] bg-dark-50 dark:bg-dark-950 border border-dark-100 dark:border-dark-800 rounded-[3rem] overflow-hidden shadow-inner flex items-center justify-center relative group">
                        {/* In production, replace with iframe: */}
                        <div className="absolute inset-0 opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-700 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Montreal,QC&zoom=13&size=1200x400&maptype=roadmap')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-primary-950/10 mix-blend-overlay"></div>
                        <div className="z-10 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-10 py-8 rounded-[2rem] text-center shadow-2xl border border-white/20 dark:border-dark-800/50 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <h4 className="font-black text-3xl text-dark-900 dark:text-white tracking-tight mb-2">Montréal, QC</h4>
                            <p className="text-dark-500 text-sm font-bold uppercase tracking-widest">Intégration Google Maps requise</p>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
