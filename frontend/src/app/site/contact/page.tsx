'use client';

import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

export default function SiteContactPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-dark-950 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary-900/5 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 size-[500px] border border-primary-900/5 rounded-full -z-10" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32 relative">
                {/* Header */}
                <div className="text-center mb-20 space-y-4">
                    <span className="text-accent-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Échange & Partage</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-primary-950 dark:text-white tracking-tighter cinzel-title uppercase">
                        Contactez <br className="md:hidden" /> <span className="text-accent-gold">le Centre</span>
                    </h1>
                    <div className="flex flex-col items-center gap-2 pt-8">
                        <div className="h-px w-24 bg-accent-gold/30 mb-2" />
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Une question, une suggestion ou besoin d&apos;informations ? Notre équipe est à votre entière disposition.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Contact Info Cards */}
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-gold opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-primary-950 transition-all">
                                    <FiPhone size={24} />
                                </div>
                                <h3 className="text-lg font-black text-primary-950 uppercase tracking-tighter cinzel-title mb-2">Téléphone</h3>
                                <p className="text-slate-500 font-medium">418-683-2323</p>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-gold opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-primary-950 transition-all">
                                    <FiMail size={24} />
                                </div>
                                <h3 className="text-lg font-black text-primary-950 uppercase tracking-tighter cinzel-title mb-2">Email</h3>
                                <p className="text-slate-500 font-medium">info@cciq.org</p>
                            </div>
                        </div>

                        <div className="bg-primary-950 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 zellige-pattern opacity-5" />
                            <div className="relative z-10">
                                <div className="size-14 rounded-2xl bg-accent-gold flex items-center justify-center text-primary-950 mb-8">
                                    <FiMapPin size={28} />
                                </div>
                                <h3 className="text-3xl font-serif font-black cinzel-title uppercase tracking-tighter mb-4">Notre Adresse</h3>
                                <p className="text-xl text-white/60 font-medium leading-relaxed mb-8">
                                    2877, chemin Sainte-Foy,<br />
                                    Québec, QC G1X 1P7,<br />
                                    Canada
                                </p>
                                <div className="h-px w-full bg-white/10 mb-8" />
                                <div className="flex items-center gap-4 text-accent-gold font-black uppercase tracking-widest text-xs">
                                    <span className="size-2 rounded-full bg-accent-gold animate-ping" />
                                    Ouvert pour les 5 prières quotidiennes
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl" />
                        
                        <form className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Nom Complet</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-accent-gold px-8 py-5 rounded-2xl outline-none font-bold text-primary-950 transition-all placeholder:text-slate-300"
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Adresse Email</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-accent-gold px-8 py-5 rounded-2xl outline-none font-bold text-primary-950 transition-all placeholder:text-slate-300"
                                    placeholder="exemple@mail.com"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Message</label>
                                <textarea 
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-accent-gold px-8 py-5 rounded-3xl outline-none font-bold text-primary-950 transition-all placeholder:text-slate-300 resize-none"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                ></textarea>
                            </div>

                            <button className="w-full group bg-primary-950 hover:bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-950/20 transition-all flex items-center justify-center gap-4 active:scale-95">
                                Envoyer le Message
                                <FiSend className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
