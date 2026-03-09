import Link from 'next/link';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function ProgrammesPage() {
    const categories = ['Tous', 'Enfants', 'Adultes', 'Coran Hifdh', 'Tajwid', 'Langue Arabe'];

    const programmes = [
        {
            title: 'Arabe pour Enfants',
            category: 'Enfants',
            level: 'Débutant à Avancé',
            age: '6 - 15 ans',
            desc: 'Un apprentissage ludique et structuré de la langue arabe, axé sur la lecture, l\'écriture et la compréhension de base.',
            status: 'Inscriptions Ouvertes',
            statusColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            price: '45$/mois',
            image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop',
            icon: '👦'
        },
        {
            title: 'Arabe pour Adultes',
            category: 'Adultes',
            level: 'Tous niveaux',
            age: '16+ ans',
            desc: 'Des cours du soir adaptés aux professionnels et aux étudiants pour maîtriser l\'arabe classique et comprendre les textes sacrés.',
            status: 'Complet',
            statusColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            price: '50$/mois',
            image: 'https://images.unsplash.com/photo-1577908488258-7e50c4ad4efd?q=80&w=800&auto=format&fit=crop',
            icon: '👨‍🎓'
        },
        {
            title: 'Mémorisation du Coran (Hifdh)',
            category: 'Coran Hifdh',
            level: 'Intermédiaire à Avancé',
            age: 'Dès 7 ans',
            desc: 'Un programme intensif de mémorisation du Saint Coran avec un suivi personnalisé par des enseignants qualifiés (Ijazah).',
            status: 'Inscriptions Ouvertes',
            statusColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            price: '60$/mois',
            image: 'https://images.unsplash.com/photo-1606760233633-5c5a8bd8682e?q=80&w=800&auto=format&fit=crop',
            icon: '📖'
        },
        {
            title: 'Perfectionnement (Tajwid)',
            category: 'Tajwid',
            level: 'Tous niveaux',
            age: 'Ouvert à tous',
            desc: 'Apprenez les règles de récitation et perfectionnez votre prononciation pour lire le Coran comme il a été révélé.',
            status: 'Dernières Places',
            statusColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            price: '45$/mois',
            image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
            icon: '🎙️'
        }
    ];

    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col font-sans selection:bg-accent-500/30">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary-950 text-white pt-24 pb-32 px-6">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606760233633-5c5a8bd8682e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/90 to-primary-950"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-50 dark:from-dark-950 to-transparent z-10 w-full"></div>

                <div className="container mx-auto max-w-5xl text-center relative z-20">
                    <div className="inline-flex mb-8 px-5 py-2.5 rounded-full border border-primary-500/30 bg-primary-900/50 backdrop-blur-md text-accent-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary-900/20">
                        Nos Programmes
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 drop-shadow-2xl">
                        Formez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">prochaine génération</span>
                    </h1>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                        Découvrez nos parcours éducatifs conçus pour transmettre l'excellence, la sagesse et l'amour de la langue arabe et du Coran.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 relative z-20">
                <div className="container mx-auto px-6 max-w-7xl">

                    {/* Category Filters */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                        {categories.map((cat, i) => (
                            <button key={i} className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/20' : 'bg-white dark:bg-dark-900 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 border border-dark-100 dark:border-dark-800'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Programmes Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {programmes.map((prog, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-dark-100 dark:border-dark-800 shadow-xl shadow-dark-100/5 hover:shadow-2xl hover:shadow-dark-100/10 transition-all duration-300 group overflow-hidden flex flex-col sm:flex-row">
                                {/* Image Half */}
                                <div className="w-full sm:w-2/5 relative min-h-[250px] sm:min-h-full overflow-hidden shrink-0">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${prog.image}')` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent"></div>
                                    <div className="absolute top-6 left-6">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${prog.statusColor}`}>
                                            {prog.status}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
                                            {prog.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Half */}
                                <div className="p-8 sm:p-10 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-dark-50 dark:bg-dark-950 text-dark-500 dark:text-dark-400 border border-dark-100 dark:border-dark-800">
                                            {prog.level}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-dark-50 dark:bg-dark-950 text-dark-500 dark:text-dark-400 border border-dark-100 dark:border-dark-800">
                                            {prog.age}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black text-dark-900 dark:text-white tracking-tight mb-4">{prog.title}</h3>
                                    <p className="font-medium text-dark-500 dark:text-dark-400 leading-relaxed mb-8 flex-1">{prog.desc}</p>

                                    <div className="flex items-center justify-between pt-6 border-t border-dark-100 dark:border-dark-800 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">Tarif à partir de</span>
                                            <span className="text-xl font-black text-primary-600 dark:text-primary-400 tracking-tighter">{prog.price}</span>
                                        </div>
                                        <Link href="/login" className="px-6 py-3 rounded-[1.25rem] bg-dark-50 dark:bg-dark-950 hover:bg-dark-100 dark:hover:bg-dark-800 border border-dark-100 dark:border-dark-800 text-dark-900 dark:text-white font-extrabold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 group-hover:bg-primary-900 group-hover:border-primary-900 group-hover:text-white">
                                            S'inscrire <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
