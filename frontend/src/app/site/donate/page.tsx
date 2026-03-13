export default function DonatePage() {
    return (
        <div className="bg-[#FDFCFB]">
            {/* Premium Hero - Light Version */}
            <section className="relative overflow-hidden bg-[#FDFCFB] text-primary-950 pt-32 pb-48 px-6 border-b border-slate-100">
                {/* Architectural Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-[1px] border-primary-900/5 rounded-full -z-0" />
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/5 rounded-full blur-[100px] -z-0 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[80px] -z-0 translate-y-1/3 -translate-x-1/4"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-6 py-2.5 rounded-full bg-primary-900/5 border border-primary-900/10 text-primary-950 text-[10px] font-black tracking-[0.3em] uppercase">
                        <span className="size-2 rounded-full bg-accent-gold mr-2 animate-pulse" />
                        Campagne de Financement
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 tracking-tighter leading-[0.9] cinzel-title uppercase text-primary-950">
                        Soutenez Votre <br />
                        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary-900 to-primary-700 pb-2">
                             Communauté
                            <svg className="absolute -bottom-2 left-0 w-full h-8 text-accent-gold opacity-20" preserveAspectRatio="none" viewBox="0 0 400 30">
                                <path d="M0,15 Q100,0 200,15 T400,15" fill="none" stroke="currentColor" strokeWidth="8" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                        Vos dons permettent de maintenir notre mosquée, de financer l'école de Coran et d'organiser des activités pour notre jeunesse.
                    </p>

                    {/* Stats - Light Glassmorphism */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
                        {[
                            { value: '500+', label: 'Élèves Inscrits', icon: 'groups' },
                            { value: '10k+', label: 'Repas Distribués', icon: 'restaurant' },
                            { value: '100%', label: 'Transparence', icon: 'verified_user' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group">
                                <div className="size-12 bg-primary-900/10 rounded-2xl flex items-center justify-center text-primary-900 mb-4 mx-auto group-hover:bg-primary-900 group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-outlined">{stat.icon}</span>
                                </div>
                                <div className="text-4xl font-serif font-black text-primary-950 mb-2 tracking-tighter cinzel-title">{stat.value}</div>
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Interactive Form - Ultra Clean Pearl */}
            <section className="px-6 flex-grow pb-24 relative z-30 -mt-32">
                <div className="container mx-auto max-w-3xl">
                    <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(6,78,59,0.08)] border border-slate-100 p-8 sm:p-12 lg:p-16">

                        {/* Frequency Selector */}
                        <div className="flex bg-slate-50 p-2 rounded-[2rem] mb-12 border border-slate-100">
                            <button className="flex-1 py-4 bg-white shadow-xl shadow-primary-900/5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-primary-950 transition-all border border-slate-100">
                                Don Ponctuel
                            </button>
                            <button className="flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-primary-950 transition-colors">
                                Mensuel
                            </button>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-2xl font-serif font-black text-primary-950 tracking-tighter cinzel-title uppercase mb-6">Montant du don</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[20, 50, 100, 200].map((amount, idx) => (
                                    <button key={amount} className={`py-6 border-2 rounded-2xl font-serif font-black text-2xl transition-all duration-500 cinzel-title ${idx === 1 ? 'border-accent-gold text-primary-950 bg-accent-gold/5 shadow-xl shadow-accent-gold/10' : 'border-slate-50 hover:border-accent-gold/30 text-slate-300 hover:text-primary-950 hover:bg-slate-50'}`}>
                                        {amount}$
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-12">
                            <label className="block text-[10px] font-black text-slate-400 mb-3 ml-2 uppercase tracking-[0.3em]">Autre montant ($)</label>
                            <input
                                type="number"
                                placeholder="Ex: 75"
                                className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-serif font-black text-primary-950 text-2xl focus:ring-8 focus:ring-primary-900/5 focus:border-primary-900/20 transition-all outline-none placeholder:text-slate-200 cinzel-title"
                            />
                        </div>

                        {/* Interac Highlight Box - Premium Pearl */}
                        <div className="bg-primary-900/[0.02] rounded-[2.5rem] p-10 mb-12 border border-primary-900/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <h4 className="font-serif font-black text-primary-950 mb-4 flex items-center gap-4 text-xl tracking-tighter cinzel-title uppercase">
                                <div className="size-12 bg-primary-900 text-accent-gold rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                Privilégié : Interac
                            </h4>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                                Évitez les frais de transaction et assurez-vous que 100% de votre don nous parvient directement.
                            </p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                <code className="text-primary-950 font-black flex-1 px-6 select-all text-center sm:text-left py-4 sm:py-0 text-sm tracking-wider">don@cciq.org</code>
                                <button className="px-8 py-4 bg-primary-900 hover:bg-primary-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                                    Copier
                                </button>
                            </div>
                            <div className="mt-6 flex items-center gap-3 ml-2">
                                <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-300">Question :</span>
                                <code className="text-xs font-black text-primary-950 select-all bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">dons</code>
                            </div>
                        </div>

                        <button className="w-full py-6 bg-primary-900 hover:bg-primary-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                            Soutenir par carte
                            <span className="material-symbols-outlined text-accent-gold">arrow_forward</span>
                        </button>
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mt-8 flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-sm opacity-50">lock</span>
                            Paiement sécurisé et chiffré
                        </p>

                    </div>
                </div>
            </section>
        </div>
    );
}
