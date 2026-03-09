'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { FiSend, FiInbox, FiMail, FiCheck } from 'react-icons/fi';

const mockMessages = [
    { id: '1', senderName: 'Mohamed Al-Husseini', subject: 'Progression de Youssef', body: 'Youssef a fait d\'excellents progrès cette semaine...', isRead: false, sentAt: '2025-02-14T10:30:00' },
    { id: '2', senderName: 'Admin École', subject: 'Planning modifié', body: 'Le planning du groupe Al-Fatiha a été modifié pour la semaine prochaine.', isRead: true, sentAt: '2025-02-13T14:00:00' },
    { id: '3', senderName: 'Fatima Zahra', subject: 'Absence prévue', body: 'Mes enfants seront absents le lundi prochain pour raison familiale.', isRead: true, sentAt: '2025-02-12T09:15:00' },
    { id: '4', senderName: 'Admin École', subject: 'Examens de fin de semestre', body: 'Les examens de fin de semestre auront lieu du 15 au 20 mars.', isRead: false, sentAt: '2025-02-11T16:45:00' },
];

const mockNotifications = [
    { id: '1', title: 'Paiement en retard', body: 'Le paiement de Mohamed Ali pour janvier est en retard.', isRead: false, type: 'payment', createdAt: '2025-02-14T08:00:00' },
    { id: '2', title: 'Nouvel examen créé', body: 'Un examen de Tajwid a été créé pour le 20 février.', isRead: false, type: 'exam', createdAt: '2025-02-13T11:30:00' },
    { id: '3', title: 'Absence signalée', body: 'Amina Zahra a été marquée absente aujourd\'hui.', isRead: true, type: 'attendance', createdAt: '2025-02-12T09:00:00' },
];

export default function MessagesPage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);
    const [tab, setTab] = useState<'inbox' | 'sent' | 'notifications'>('inbox');
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [showCompose, setShowCompose] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.common.messages}</h1>
                    <p className="text-dark-500 mt-2 font-medium">Communication interne & alertes</p>
                </div>
                <button
                    onClick={() => setShowCompose(!showCompose)}
                    className="relative z-10 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                >
                    <FiSend size={18} /> Nouveau message
                </button>
            </div>

            {showCompose && (
                <div className="bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-50 dark:bg-accent-900/10 rounded-full blur-2xl -z-0" />

                    <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-4 relative z-10">
                        <span className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <FiSend size={24} />
                        </span>
                        Rédiger un message
                    </h3>
                    <form className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500 pl-2">Destinataire</label>
                            <select className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all appearance-none cursor-pointer text-dark-900 dark:text-white">
                                <option>Sélectionner le destinataire</option>
                                <option>Administration</option>
                                <option>Professeur - Tajwid</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500 pl-2">Objet</label>
                            <input type="text" placeholder="Entrez le sujet de votre message" className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 outline-none font-medium transition-all text-dark-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-dark-500 pl-2">Message</label>
                            <textarea placeholder="Votre message détaillé..." className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-[2rem] px-6 py-5 outline-none font-medium transition-all min-h-[180px] resize-y text-dark-900 dark:text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-accent-500/30 hover:-translate-y-1 transition-all text-sm uppercase tracking-widest">
                                Envoyer le message
                            </button>
                            <button type="button" onClick={() => setShowCompose(false)} className="sm:w-48 bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 font-bold py-4 rounded-2xl flex items-center justify-center transition-all text-sm uppercase tracking-widest">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-dark-50 dark:bg-dark-950/50 p-2.5 rounded-[2rem] border border-dark-100 dark:border-dark-800 shadow-inner w-full sm:w-fit">
                {[
                    { key: 'inbox' as const, label: 'Boîte de réception', icon: <FiInbox size={18} />, count: mockMessages.filter(m => !m.isRead).length },
                    { key: 'sent' as const, label: 'Envoyés', icon: <FiMail size={18} /> },
                    { key: 'notifications' as const, label: t.common.notifications, icon: <FiCheck size={18} />, count: mockNotifications.filter(n => !n.isRead).length },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-extrabold transition-all uppercase tracking-widest ${tab === t.key
                            ? 'bg-white dark:bg-dark-800 shadow-lg text-primary-600 dark:text-primary-400'
                            : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100/50 dark:hover:bg-dark-800/50'
                            }`}
                    >
                        {t.icon} {t.label}
                        {t.count ? <span className={`text-[10px] rounded-full px-2 py-0.5 ${tab === t.key ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-dark-200 dark:bg-dark-700 text-dark-700 dark:text-dark-200'}`}>{t.count}</span> : null}
                    </button>
                ))}
            </div>

            {/* Messages / Notifications List */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-xl border border-dark-100 dark:border-dark-800 overflow-hidden divide-y divide-dark-50 dark:divide-dark-800/50">
                {tab !== 'notifications' ? (
                    mockMessages.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
                            className={`p-6 sm:px-8 sm:py-6 cursor-pointer transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50 ${!msg.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-sm ${!msg.isRead ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20' : 'bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 text-dark-500'}`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className={`block text-lg tracking-tight ${!msg.isRead ? 'font-extrabold text-dark-900 dark:text-white' : 'font-bold text-dark-700 dark:text-dark-200'}`}>{msg.senderName}</span>
                                        <p className={`text-sm mt-0.5 ${!msg.isRead ? 'font-bold text-dark-800 dark:text-dark-100' : 'font-medium text-dark-500'}`}>{msg.subject}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row-reverse sm:flex-row items-center gap-3 self-end sm:self-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-dark-400 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-700">
                                        {new Date(msg.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!msg.isRead && <span className="bg-primary-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">Nouveau</span>}
                                </div>
                            </div>

                            <div className={`grid transition-all duration-300 ease-in-out ${selectedMessage === msg.id ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="pt-6 border-t border-dark-100 dark:border-dark-800">
                                        <div className="bg-dark-50 dark:bg-dark-950/50 p-6 rounded-[2rem] text-dark-700 dark:text-dark-300 leading-relaxed font-medium border border-dark-100 dark:border-dark-800/50">
                                            {msg.body}
                                        </div>
                                        {/* Action buttons inside open message */}
                                        <div className="flex gap-4 mt-6 px-2">
                                            <button className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5"><FiSend size={12} /> Répondre</button>
                                            <button className="text-xs font-bold uppercase tracking-widest text-dark-400 hover:text-dark-700 dark:hover:text-dark-200">Marquer comme lu</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    mockNotifications.map(notif => (
                        <div key={notif.id} className={`p-6 sm:px-8 sm:py-6 flex gap-5 ${!notif.isRead ? 'bg-accent-50/20 dark:bg-accent-900/10' : ''}`}>
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${notif.type === 'payment' ? 'bg-amber-50 border-amber-100 text-amber-500 dark:bg-amber-900/20 dark:border-amber-800' :
                                notif.type === 'exam' ? 'bg-purple-50 border-purple-100 text-purple-500 dark:bg-purple-900/20 dark:border-purple-800' :
                                    'bg-blue-50 border-blue-100 text-blue-500 dark:bg-blue-900/20 dark:border-blue-800'
                                }`}>
                                {notif.type === 'payment' ? '💳' : notif.type === 'exam' ? '📝' : '📅'}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-3">
                                        {!notif.isRead && <div className="w-2.5 h-2.5 rounded-full bg-accent-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />}
                                        <span className={`text-lg tracking-tight ${!notif.isRead ? 'font-extrabold text-dark-900 dark:text-white' : 'font-bold text-dark-700 dark:text-dark-200'}`}>{notif.title}</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-dark-400 bg-dark-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-700 self-start">
                                        {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <p className="text-sm text-dark-600 dark:text-dark-400 font-medium leading-relaxed max-w-2xl">{notif.body}</p>
                            </div>
                        </div>
                    ))
                )}
                {/* Empty State fallback (optional but good context) */}
                {tab !== 'notifications' && mockMessages.length === 0 && (
                    <div className="p-12 text-center text-dark-400 font-medium">
                        Aucun message dans cette boîte.
                    </div>
                )}
            </div>
        </div>
    );
}
