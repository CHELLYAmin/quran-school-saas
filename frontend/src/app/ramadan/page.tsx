import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function RamadanPage() {
    const calendarData = [
        { day: 1, date: '01 Mars', fajr: '05:42', imsak: '05:32', shuruq: '07:12', dhuhr: '12:45', asr: '15:30', maghrib: '18:18', isha: '19:48' },
        { day: 2, date: '02 Mars', fajr: '05:40', imsak: '05:30', shuruq: '07:10', dhuhr: '12:45', asr: '15:31', maghrib: '18:19', isha: '19:49' },
        { day: 3, date: '03 Mars', fajr: '05:38', imsak: '05:28', shuruq: '07:08', dhuhr: '12:45', asr: '15:32', maghrib: '18:21', isha: '19:51' },
        { day: 4, date: '04 Mars', fajr: '05:36', imsak: '05:26', shuruq: '07:06', dhuhr: '12:44', asr: '15:33', maghrib: '18:22', isha: '19:52' },
        { day: 5, date: '05 Mars', fajr: '05:34', imsak: '05:24', shuruq: '07:04', dhuhr: '12:44', asr: '15:34', maghrib: '18:24', isha: '19:54', highlight: true },
        // ... more data could be added or fetched
    ];

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 bg-primary-900 text-white overflow-hidden">
                <div className="absolute inset-0 zellige-pattern opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-20 relative text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-accent-gold border border-white/5 mb-8">
                        <span className="material-symbols-outlined text-sm">crescent_moon</span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Ramadan Kareem 1447</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif mb-6 leading-tight">
                        Imsakiye <span className="text-accent-gold italic">Ramadan</span>
                    </h1>
                    <p className="text-primary-100/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                        Retrouvez les horaires de prière, de l'Imsak et de l'Iftar pour le mois béni à Montréal et ses environs.
                    </p>
                </div>
            </section>

            {/* Calendar Section */}
            <section className="py-20 lg:py-32 px-6 lg:px-20 bg-pearl">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-primary-900 text-white">
                                    <tr>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Jour</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Date</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase text-accent-gold">Imsak</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Fajr</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Shuruq</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Dhuhr</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Asr</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase text-accent-gold">Maghrib</th>
                                        <th className="px-6 py-6 font-bold text-sm tracking-widest uppercase">Isha</th>
                                    </tr>
                                </thead>
                                <tbody className="text-primary-900">
                                    {calendarData.map((row) => (
                                        <tr
                                            key={row.day}
                                            className={`border-b border-primary/5 transition-colors hover:bg-slate-50 ${row.highlight ? 'bg-accent-gold/5 font-bold' : ''}`}
                                        >
                                            <td className="px-6 py-5 text-sm">{row.day}</td>
                                            <td className="px-6 py-5 text-sm">{row.date}</td>
                                            <td className="px-6 py-5 text-sm text-accent-gold">{row.imsak}</td>
                                            <td className="px-6 py-5 text-sm">{row.fajr}</td>
                                            <td className="px-6 py-5 text-sm opacity-50">{row.shuruq}</td>
                                            <td className="px-6 py-5 text-sm">{row.dhuhr}</td>
                                            <td className="px-6 py-5 text-sm">{row.asr}</td>
                                            <td className="px-6 py-5 text-sm text-accent-gold">{row.maghrib}</td>
                                            <td className="px-6 py-5 text-sm">{row.isha}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Legend & Advice */}
                    <div className="grid lg:grid-cols-3 gap-8 mt-16">
                        <div className="p-8 bg-white border border-primary/5 rounded-[2rem] shadow-sm space-y-4">
                            <div className="size-12 bg-accent-gold/10 text-accent-gold rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined">info</span>
                            </div>
                            <h4 className="text-lg font-bold">Qu'est-ce que l'Imsak ?</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                L'Imsak est le moment où l'on cesse de manger et de boire, généralement 10 minutes avant le Fajr, par précaution.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-primary/5 rounded-[2rem] shadow-sm space-y-4">
                            <div className="size-12 bg-primary/5 text-primary-900 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined">restaurant</span>
                            </div>
                            <h4 className="text-lg font-bold">L'importance de l'Iftar</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                La rupture du jeûne se fait au moment précis du Maghrib. Il est recommandé de rompre le jeûne avec des dattes et de l'eau.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-primary/5 rounded-[2rem] shadow-sm space-y-4">
                            <div className="size-12 bg-primary/5 text-primary-900 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined">download</span>
                            </div>
                            <h4 className="text-lg font-bold">Version Imprimable</h4>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                Téléchargez notre calendrier complet au format PDF pour l'afficher chez vous.
                            </p>
                            <button className="text-primary-900 font-bold text-sm flex items-center gap-2 group">
                                Télécharger le PDF
                                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-y-0.5">download</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
