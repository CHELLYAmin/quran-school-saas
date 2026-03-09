import Link from 'next/link';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function DonatePage() {
    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col font-sans selection:bg-accent-500/30">
            <PublicHeader />

            {/* Premium Hero */}
            <section className="relative overflow-hidden bg-primary-950 text-white pt-24 pb-48 px-6">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113589914-07599019ddad?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/90 to-primary-950"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-50 dark:from-dark-950 to-transparent z-10 w-full"></div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-800 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-600/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-5 py-2.5 rounded-full border border-primary-500/30 bg-primary-900/50 backdrop-blur-md text-accent-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary-900/20">
                        Campagne de Financement
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight drop-shadow-2xl">
                        Soutenez Votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">Communauté</span>
                    </h1>
                    <p className="text-xl text-primary-100/90 mb-16 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                        Vos dons permettent de maintenir notre mosquée, de financer l'école de Coran et d'organiser des activités pour notre jeunesse.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
                        {[
                            { value: '500+', label: 'Élèves Inscrits' },
                            { value: '10k+', label: 'Repas Distribués' },
                            { value: '100%', label: 'Transparence' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 transition-colors shadow-lg shadow-black/10">
                                <div className="text-4xl lg:text-5xl font-black text-accent-400 mb-3 drop-shadow-sm tracking-tighter">{stat.value}</div>
                                <div className="text-primary-100 text-sm font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Interactive Form */}
            <section className="px-6 flex-grow pb-24 relative z-30 -mt-32">
                <div className="container mx-auto max-w-3xl">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl shadow-dark-900/5 hover:shadow-dark-900/10 transition-shadow duration-500 border border-dark-100 dark:border-dark-800 p-8 sm:p-12 lg:p-16">

                        {/* Frequency Selector */}
                        <div className="flex bg-dark-50 dark:bg-dark-950 p-2 rounded-[1.5rem] mb-12 shadow-inner border border-dark-100 dark:border-dark-800">
                            <button className="flex-1 py-4 bg-white dark:bg-dark-800 shadow-md rounded-xl font-black text-xs uppercase tracking-widest text-dark-900 dark:text-white transition-all transform scale-[1.01] border border-dark-100/50 dark:border-dark-700">
                                Don Ponctuel
                            </button>
                            <button className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-dark-500 hover:text-dark-900 dark:hover:text-white transition-colors">
                                Mensuel
                            </button>
                        </div>

                        <h3 className="text-2xl font-black text-dark-900 dark:text-white tracking-tight mb-6">Montant du don</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[20, 50, 100, 200].map((amount, idx) => (
                                <button key={amount} className={`py-5 border-2 rounded-2xl font-black text-xl transition-all ${idx === 1 ? 'border-primary-500 text-primary-600 bg-primary-50/50 dark:bg-primary-900/10 shadow-md shadow-primary-500/10' : 'border-dark-100 dark:border-dark-800 hover:border-dark-300 dark:hover:border-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800/50'}`}>
                                    {amount} $
                                </button>
                            ))}
                        </div>

                        <div className="mb-12">
                            <label className="block text-[10px] font-black text-dark-500 dark:text-dark-400 mb-3 ml-2 uppercase tracking-[0.2em]">Autre montant ($)</label>
                            <input
                                type="number"
                                placeholder="Ex: 75"
                                className="w-full px-6 py-5 bg-dark-50 dark:bg-dark-950 border-2 border-dark-100 dark:border-dark-800 rounded-2xl font-black text-dark-900 dark:text-white text-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none placeholder:text-dark-300 dark:placeholder:text-dark-600"
                            />
                        </div>

                        {/* Interac Highlight Box */}
                        <div className="bg-primary-50/50 dark:bg-primary-900/10 rounded-[2rem] p-8 mb-12 border border-primary-100 dark:border-primary-800/30">
                            <h4 className="font-black text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-3 text-lg tracking-tight">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-300 shadow-sm border border-primary-200/50 dark:border-primary-700/50">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                Privilégié : Virement Interac
                            </h4>
                            <p className="text-dark-600 dark:text-dark-400 font-medium text-sm leading-relaxed mb-6">
                                Évitez les frais de transaction bancaire et assurez-vous que 100% de votre don nous parvient directement.
                            </p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-dark-900 p-2.5 rounded-2xl border border-primary-200/50 dark:border-primary-700/50 shadow-sm shadow-primary-900/5">
                                <code className="text-primary-900 dark:text-white font-bold flex-1 px-4 select-all text-center sm:text-left py-3 sm:py-0 text-sm">don@essalam-mascouche.ca</code>
                                <button className="px-6 py-3 bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-dark-200/50 dark:border-dark-600">
                                    Copier
                                </button>
                            </div>
                            <div className="mt-5 flex items-center gap-3 ml-2">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-dark-400">Mot de passe suggéré :</span>
                                <code className="text-xs font-bold text-dark-700 dark:text-dark-300 select-all bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-700">dons</code>
                            </div>
                        </div>

                        <button className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-0.5 transition-all">
                            Payer par carte (Stripe)
                        </button>
                        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-dark-400 mt-6 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            Paiement sécurisé et chiffré
                        </p>

                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
