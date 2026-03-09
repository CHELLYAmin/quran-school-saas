import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="bg-pearl border-t border-primary/5 pt-20 pb-10 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Upper Section: Newsletter & Quote */}
                <div className="grid lg:grid-cols-2 gap-20 mb-24 items-center">
                    <div className="space-y-8 animate-fade-in shadow-2xl p-10 bg-white rounded-[2rem] border border-primary/5">
                        <div className="size-12 bg-primary-900 text-accent-gold rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-serif text-primary-900 font-black">LA LETTRE AL-HIKMAH</h3>
                            <p className="text-slate-500 max-w-md leading-relaxed">
                                Recevez chaque vendredi une dose de sagesse, les actualités du centre et nos nouveaux programmes.
                            </p>
                        </div>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="flex-1 bg-pearl border border-primary/10 px-6 py-4 rounded-full text-sm focus:ring-2 focus:ring-accent-gold outline-none"
                            />
                            <button className="bg-primary-900 text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
                                S'inscrire
                            </button>
                        </form>
                    </div>

                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            Citation Hebdomadaire
                        </div>
                        <blockquote className="space-y-6">
                            <p className="font-serif text-2xl md:text-4xl text-primary-900 italic leading-snug">
                                "Lis, au nom de ton Seigneur qui a créé, qui a créé l'homme d'une adhérence. Lis ! Ton Seigneur est le Très Noble..."
                            </p>
                            <footer className="flex flex-col gap-2">
                                <span className="text-lg font-bold text-primary-900/60 font-serif">— Sourate Al-Alaq, 1-4</span>
                                <div className="h-1 w-20 bg-accent-gold rounded-full lg:mx-0 mx-auto"></div>
                            </footer>
                        </blockquote>
                    </div>
                </div>

                <hr className="border-primary/5 mb-16" />

                {/* Middle Section: Navigation */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="size-8 bg-primary-900 text-accent-gold rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">mosque</span>
                            </div>
                            <span className="text-xl font-serif font-black text-primary-900 uppercase">Al-Sanctuaire</span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            Une institution digitale dédiée à l'excellence académique et spirituelle, ancrée dans la tradition et tournée vers l'avenir.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'instagram', 'youtube'].map((social) => (
                                <a key={social} href="#" className="size-10 bg-white border border-primary/5 text-primary-900 rounded-full flex items-center justify-center hover:bg-primary-900 hover:text-white transition-all shadow-sm">
                                    <span className="material-symbols-outlined text-lg">public</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-serif font-black text-primary-900 uppercase tracking-widest text-xs">Piliers</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-bold uppercase tracking-wider">
                            <li><Link className="hover:text-accent-gold transition-colors" href="/programmes">École</Link></li>
                            <li><Link className="hover:text-accent-gold transition-colors" href="/ramadan">Ramadan</Link></li>
                            <li><Link className="hover:text-accent-gold transition-colors" href="/events">Activités</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-serif font-black text-primary-900 uppercase tracking-widest text-xs">Soutien</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-bold uppercase tracking-wider">
                            <li><Link className="hover:text-accent-gold transition-colors" href="/donate">Faire un don</Link></li>
                            <li><Link className="hover:text-accent-gold transition-colors" href="/zakat">Calcul Zakat</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-serif font-black text-primary-900 uppercase tracking-widest text-xs">Aide</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-bold uppercase tracking-wider">
                            <li><Link className="hover:text-accent-gold transition-colors" href="/faq">FAQ</Link></li>
                            <li><Link className="hover:text-accent-gold transition-colors" href="/contact">Support</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-10 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} AL-SANCTUAIRE DIGITAL ACADEMY. TOUS DROITS RÉSERVÉS.
                    </p>
                    <div className="flex gap-8 text-[10px] font-black text-primary-900/40 uppercase tracking-widest">
                        <Link href="/privacy" className="hover:text-accent-gold">Confidentialité</Link>
                        <Link href="/terms" className="hover:text-accent-gold">CGU</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
