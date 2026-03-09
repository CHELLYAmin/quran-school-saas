'use client';

import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiFileText, FiDollarSign, FiInfo, FiExternalLink } from 'react-icons/fi';

export default function CemeteryPage() {
    const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'rules'>('info');

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Cimetière Islamique</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Informations, tarification et règlement du cimetière</p>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-600 mb-4">
                        <FiMapPin size={24} />
                    </div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-1">Emplacement</h3>
                    <p className="text-sm text-dark-500">Cimetière Mont-Marie, Section musulmane</p>
                    <p className="text-sm text-dark-400 mt-1">1585, chemin Saint-Louis, Québec, QC G1S 1G5</p>
                </div>
                <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 mb-4">
                        <FiPhone size={24} />
                    </div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-1">Contact</h3>
                    <p className="text-sm text-dark-500">Téléphone : 418-683-2323</p>
                    <p className="text-sm text-dark-500 mt-1">Email : info@cciq.org</p>
                </div>
                <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 mb-4">
                        <FiInfo size={24} />
                    </div>
                    <h3 className="font-bold text-dark-900 dark:text-white mb-1">Horaires de visite</h3>
                    <p className="text-sm text-dark-500">Lundi à Vendredi : 9h – 17h</p>
                    <p className="text-sm text-dark-500 mt-1">Samedi – Dimanche : 10h – 16h</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-dark-50 dark:bg-dark-800 p-1.5 rounded-2xl w-fit border border-dark-100 dark:border-dark-700">
                {[
                    { id: 'info', label: 'Informations', icon: <FiFileText /> },
                    { id: 'pricing', label: 'Tarification', icon: <FiDollarSign /> },
                    { id: 'rules', label: 'Règlement', icon: <FiInfo /> },
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id
                            ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm border border-dark-100 dark:border-dark-700'
                            : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-200'}`}
                    >{t.icon} {t.label}</button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-8 shadow-sm">
                {activeTab === 'info' && (
                    <div className="prose dark:prose-invert max-w-none">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">À propos du cimetière</h2>
                        <p className="text-dark-600 dark:text-dark-300 leading-relaxed">
                            Le Centre Culturel Islamique de Québec (CCIQ) met à la disposition de la communauté musulmane de la région de Québec un carré musulman au sein du cimetière Mont-Marie. Cet espace sacré est dédié à l&apos;inhumation des musulmans et musulmanes selon les rites islamiques.
                        </p>
                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mt-6 mb-3">Services inclus</h3>
                        <ul className="space-y-2">
                            {['Terrain d\'inhumation orienté vers la Qibla', 'Préparation de la tombe selon les rites islamiques', 'Coordination avec les services funéraires', 'Marqueur de tombe standard', 'Entretien du terrain'].map(s => (
                                <li key={s} className="flex items-start gap-3 text-dark-600 dark:text-dark-300">
                                    <span className="text-primary-600 mt-1">✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div>
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Tarification</h2>
                        <div className="grid gap-4">
                            {[
                                { label: 'Terrain adulte (membre CCIQ)', price: '1 500 $', note: 'Membres actifs du CCIQ' },
                                { label: 'Terrain adulte (non-membre)', price: '3 000 $', note: 'Non-membres de la communauté' },
                                { label: 'Terrain enfant (moins de 12 ans)', price: '500 $', note: 'Applicable aux membres et non-membres' },
                                { label: 'Ouverture et fermeture de fosse', price: '800 $', note: 'Frais du cimetière Mont-Marie' },
                                { label: 'Pierre tombale standard', price: '300 $', note: 'Plaque en granit avec inscription' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-5 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
                                    <div>
                                        <p className="font-bold text-dark-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-dark-400 mt-0.5">{item.note}</p>
                                    </div>
                                    <span className="text-xl font-extrabold text-primary-600">{item.price}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-dark-400 mt-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                            <strong>Note :</strong> Les tarifs sont susceptibles de changer. Contactez le CCIQ pour les tarifs à jour.
                        </p>
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="prose dark:prose-invert max-w-none">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Règlement du cimetière</h2>
                        <div className="space-y-4">
                            {[
                                { title: 'Orientation', desc: 'Toutes les tombes sont orientées vers la Qibla (La Mecque).' },
                                { title: 'Inhumation', desc: 'L\'inhumation se fait sans cercueil, conformément à la tradition islamique, dans la mesure du possible et en respectant les lois municipales.' },
                                { title: 'Marqueurs', desc: 'Seuls les marqueurs au sol approuvés par le CCIQ sont autorisés. Les monuments debout ne sont pas permis.' },
                                { title: 'Fleurs et objets', desc: 'Les fleurs artificielles et objets décoratifs ne sont pas autorisés. Les plantes naturelles sont tolérées.' },
                                { title: 'Visites', desc: 'Les visiteurs doivent respecter le silence et la dignité du lieu. Les enfants doivent être accompagnés.' },
                                { title: 'Entretien', desc: 'Le CCIQ assure l\'entretien général. Les familles peuvent entretenir la tombe de leur proche dans le respect du règlement.' },
                            ].map((rule, i) => (
                                <div key={i} className="p-5 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
                                    <h4 className="font-bold text-dark-900 dark:text-white mb-1">{rule.title}</h4>
                                    <p className="text-sm text-dark-600 dark:text-dark-300">{rule.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
