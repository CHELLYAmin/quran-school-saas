'use client';

import React, { useState } from 'react';
import { FiMessageCircle, FiMail, FiMessageSquare, FiSend, FiUsers, FiClock, FiFileText, FiCheckCircle, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

type Channel = 'WhatsApp' | 'SMS' | 'Email';
type Audience = 'Tous' | 'Parents' | 'Professeurs' | 'Bénévoles' | 'Donateurs';

export default function CommunicationCenter() {
    const [selectedChannel, setSelectedChannel] = useState<Channel>('WhatsApp');
    const [selectedAudience, setSelectedAudience] = useState<Audience>('Tous');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock recent campaigns
    const recentCampaigns = [
        { id: 1, title: 'Rappel Inscriptions 2025', date: 'Hier à 14:30', channel: 'WhatsApp', audience: 'Parents', status: 'Envoyé', sentCount: 145 },
        { id: 2, title: 'Appel aux dons Ramadan', date: '01 Mar 2025', channel: 'Email', audience: 'Donateurs', status: 'Envoyé', sentCount: 890 },
        { id: 3, title: 'Changement horaire Jumuah', date: '28 Fév 2025', channel: 'SMS', audience: 'Tous', status: 'Envoyé', sentCount: 1250 },
    ];

    const handleSend = () => {
        if (!message.trim()) return;
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            setShowSuccess(true);
            setMessage('');
            setTimeout(() => setShowSuccess(false), 4000);
        }, 1500);
    };

    const getAudienceCount = (target: Audience) => {
        switch (target) {
            case 'Tous': return 1250;
            case 'Parents': return 340;
            case 'Professeurs': return 45;
            case 'Bénévoles': return 85;
            case 'Donateurs': return 890;
            default: return 0;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-dark-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FiMessageCircle className="text-primary-500" />
                        Centre de Communication
                    </h1>
                    <p className="text-dark-500 mt-2 text-lg">Envoyez des messages de masse (WhatsApp, SMS, Email) à votre communauté.</p>
                </div>
                <button 
                    onClick={() => {setMessage(''); toast.success("Prpreté de l'éditeur pour une nouvelle diffusion");}}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10"
                >
                    <FiPlus size={20} /> Nouvelle Diffusion
                </button>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Editor Column (Takes 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Audience & Channel Selection */}
                    <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-dark-100 dark:border-dark-800 pb-3">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-black">1</span>
                            Ciblage & Canal
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {/* Audience */}
                            <div>
                                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2 block min-w-[300px]">Destinataires (Audience)</label>
                                <div className="space-y-2">
                                    {(['Tous', 'Parents', 'Professeurs', 'Bénévoles', 'Donateurs'] as Audience[]).map(aud => (
                                        <button
                                            key={aud}
                                            onClick={() => setSelectedAudience(aud)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${selectedAudience === aud ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-dark-950 border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:border-primary-300'}`}
                                        >
                                            <span className="flex items-center gap-2"><FiUsers size={16} /> {aud}</span>
                                            <span className="text-xs font-medium bg-dark-100 dark:bg-dark-800 px-2 py-0.5 rounded-full">{getAudienceCount(aud)} contacts</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Channel */}
                            <div>
                                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2 block min-w-[300px]">Canal de diffusion</label>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setSelectedChannel('WhatsApp')}
                                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all ${selectedChannel === 'WhatsApp' ? 'bg-[#25D366]/10 border-[#25D366] text-dark-900 dark:text-white' : 'bg-white dark:bg-dark-950 border-dark-100 dark:border-dark-800 text-dark-500 hover:border-[#25D366]/50'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChannel === 'WhatsApp' ? 'bg-[#25D366] text-white' : 'bg-dark-50 dark:bg-dark-800'}`}>
                                            <FiMessageCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold">WhatsApp Business</div>
                                            <div className="text-xs opacity-80 mt-0.5">Automatique via l'API, taux d'ouverture &gt; 90%</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedChannel('SMS')}
                                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all ${selectedChannel === 'SMS' ? 'bg-blue-500/10 border-blue-500 text-dark-900 dark:text-white' : 'bg-white dark:bg-dark-950 border-dark-100 dark:border-dark-800 text-dark-500 hover:border-blue-500/50'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChannel === 'SMS' ? 'bg-blue-500 text-white' : 'bg-dark-50 dark:bg-dark-800'}`}>
                                            <FiMessageSquare size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold">SMS Classique</div>
                                            <div className="text-xs opacity-80 mt-0.5">Idéal pour les urgences (0.05$ / SMS)</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedChannel('Email')}
                                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all ${selectedChannel === 'Email' ? 'bg-purple-500/10 border-purple-500 text-dark-900 dark:text-white' : 'bg-white dark:bg-dark-950 border-dark-100 dark:border-dark-800 text-dark-500 hover:border-purple-500/50'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChannel === 'Email' ? 'bg-purple-500 text-white' : 'bg-dark-50 dark:bg-dark-800'}`}>
                                            <FiMail size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold">Campagne Email</div>
                                            <div className="text-xs opacity-80 mt-0.5">Idéal pour les newsletters longues et reçus</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compose */}
                    <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-dark-100 dark:border-dark-800 pb-3">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-black">2</span>
                            Rédaction du message
                        </h2>

                        {selectedChannel === 'Email' && (
                            <input
                                type="text"
                                placeholder="Sujet de l'email..."
                                className="w-full mb-4 px-4 py-3 bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-700 rounded-xl font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        )}

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Rédigez votre ${selectedChannel === 'WhatsApp' ? 'message WhatsApp' : selectedChannel === 'SMS' ? 'SMS' : 'email'} ici...\n\nUtilisez des variables comme {prenom} pour personnaliser.`}
                            className="w-full h-40 px-4 py-3 bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        ></textarea>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-xs font-bold text-dark-500 bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-1">
                                    <FiFileText /> Utiliser un modèle
                                </button>
                                {selectedChannel === 'WhatsApp' && (
                                    <button className="px-3 py-1.5 text-xs font-bold text-dark-500 bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                        😊 Emojis
                                    </button>
                                )}
                            </div>

                            <div className="text-xs text-dark-400 font-medium">
                                {message.length} caractères {selectedChannel === 'SMS' && `(${Math.ceil(message.length / 160)} SMS)`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Preview & Send Actions (Takes 1/3) */}
                <div className="space-y-6">
                    {/* Phone Preview Simulator */}
                    <div className="bg-dark-100 dark:bg-dark-950 rounded-[40px] p-4 border-8 border-dark-200 dark:border-dark-800 shadow-xl overflow-hidden relative mx-auto w-full max-w-[320px] aspect-[9/19] flex flex-col">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-dark-200 dark:border-dark-800 rounded-b-3xl z-20"></div>

                        {/* Header App */}
                        <div className={`pt-6 pb-3 px-4 flex items-center gap-3 shrink-0 text-white ${selectedChannel === 'WhatsApp' ? 'bg-[#075E54]' : selectedChannel === 'SMS' ? 'bg-blue-600' : 'bg-dark-800'}`}>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                🕌
                            </div>
                            <div className="font-bold text-sm truncate">Quran School</div>
                        </div>

                        {/* Screen Content */}
                        <div className={`p-4 flex-1 flex flex-col justify-end ${selectedChannel === 'WhatsApp' ? 'bg-[#E5DDD5]' : selectedChannel === 'SMS' ? 'bg-white dark:bg-black' : 'bg-white'}`}>

                            {selectedChannel === 'WhatsApp' && (
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            )}

                            {message ? (
                                <div className={`relative z-10 animate-fade-in ${selectedChannel === 'WhatsApp' ? 'bg-[#DCF8C6] p-3 rounded-xl rounded-tr-none text-dark-900 text-sm shadow-sm' :
                                    selectedChannel === 'SMS' ? 'bg-blue-500 p-3 rounded-2xl rounded-br-none text-white text-sm' :
                                        'bg-dark-50 border border-dark-100 p-4 rounded-lg text-dark-900 text-sm'
                                    }`}>
                                    <div className="whitespace-pre-wrap break-words">
                                        {message}
                                    </div>
                                    <div className={`text-[10px] text-right mt-1 opacity-60 ${selectedChannel === 'SMS' ? 'text-blue-100' : 'text-dark-500'}`}>
                                        12:00
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-xs opacity-50 mb-10 w-full flex justify-center bg-transparent relative z-10 text-dark-900 dark:text-white">Prévisualisation du message</div>
                            )}
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 shadow-sm sticky top-24 relative overflow-hidden">
                        {showSuccess && (
                            <div className="absolute inset-0 z-20 bg-emerald-500 flex flex-col items-center justify-center text-white animate-fade-in">
                                <FiCheckCircle size={48} className="mb-4 animate-bounce" />
                                <h3 className="text-xl font-bold">Campagne Envoyée !</h3>
                                <p className="text-emerald-100 text-sm mt-1">{getAudienceCount(selectedAudience)} destinataires atteints</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-2">Résumé de la campagne</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-950 p-2 rounded-lg">
                                    <span className="text-dark-500">Destinataires</span>
                                    <span className="font-bold text-dark-900 dark:text-white">{getAudienceCount(selectedAudience)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-dark-50 dark:bg-dark-950 p-2 rounded-lg">
                                    <span className="text-dark-500">Canal</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${selectedChannel === 'WhatsApp' ? 'bg-[#25D366]/20 text-[#128C7E]' :
                                        selectedChannel === 'SMS' ? 'bg-blue-100 text-blue-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>{selectedChannel}</span>
                                </div>
                                {selectedChannel === 'SMS' && (
                                    <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg border border-orange-100 dark:border-orange-800/50">
                                        <span className="text-orange-700 dark:text-orange-400">Coût estimé</span>
                                        <span className="font-bold text-orange-700 dark:text-orange-400">~ ${(getAudienceCount(selectedAudience) * 0.05 * Math.ceil(message.length / 160 || 1)).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg ${!message.trim() ? 'bg-dark-300 dark:bg-dark-700 cursor-not-allowed shadow-none' :
                                selectedChannel === 'WhatsApp' ? 'bg-[#25D366] hover:bg-[#128C7E] shadow-[#25D366]/30' :
                                    selectedChannel === 'SMS' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' :
                                        'bg-primary-600 hover:bg-primary-700 shadow-primary-600/30'
                                }`}
                        >
                            {isSending ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Envoi en cours...</>
                            ) : (
                                <><FiSend size={18} /> Envoyer la diffusion</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 shadow-sm mt-8">
                <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                    <FiClock className="text-primary-500" />
                    Historique des diffusions
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-black text-dark-400 uppercase tracking-widest border-b border-dark-100 dark:border-dark-800">
                                <th className="pb-3 font-medium min-w-[200px]">Campagne</th>
                                <th className="pb-3 font-medium">Date d'envoi</th>
                                <th className="pb-3 font-medium">Canal</th>
                                <th className="pb-3 font-medium">Audience</th>
                                <th className="pb-3 font-medium text-right">Performances</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50 dark:divide-dark-800/50">
                            {recentCampaigns.map(c => (
                                <tr key={c.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                                    <td className="py-4 font-bold text-dark-900 dark:text-white">{c.title}</td>
                                    <td className="py-4 text-dark-500 font-medium text-sm">{c.date}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${c.channel === 'WhatsApp' ? 'bg-[#25D366]/10 text-[#128C7E]' :
                                            c.channel === 'SMS' ? 'bg-blue-50 text-blue-700' :
                                                'bg-purple-50 text-purple-700'
                                            }`}>
                                            {c.channel === 'WhatsApp' ? <FiMessageCircle size={10} /> : c.channel === 'SMS' ? <FiMessageSquare size={10} /> : <FiMail size={10} />}
                                            {c.channel}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-medium text-dark-600 dark:text-dark-300">
                                        <div className="flex items-center gap-1.5">
                                            <FiUsers className="text-dark-400" /> {c.audience}
                                        </div>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1 rounded-xl">
                                            <FiCheckCircle /> {c.sentCount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
