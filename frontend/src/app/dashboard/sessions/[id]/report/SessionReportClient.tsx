'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiShare2, FiFileText, FiAward, FiTarget, FiAlertCircle, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { sessionApi } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function SessionReportClient() {
    const { id } = useParams();
    const [shareToast, setShareToast] = useState<string | null>(null);

    const handleDownloadPDF = () => {
        window.print();
    };

    const [report, setReport] = useState<any>(null);
    const [originalSession, setOriginalSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const [repRes, sessRes] = await Promise.all([
                    sessionApi.getReport(id as string),
                    sessionApi.getById(id as string)
                ]);
                setReport(repRes.data);
                setOriginalSession(sessRes.data);
            } catch (error) {
                console.error('Failed to load report', error);
                toast.error('Erreur lors du chargement du rapport');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id]);

    const handleShare = async () => {
        const url = window.location.href;
        const title = 'Rapport de Séance — Quran School';

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (e) {
                // User cancelled or not supported
            }
        } else {
            // Fallback: copy link to clipboard
            try {
                await navigator.clipboard.writeText(url);
                setShareToast('Lien copié dans le presse-papier !');
                setTimeout(() => setShareToast(null), 3000);
            } catch {
                setShareToast('Impossible de copier le lien');
                setTimeout(() => setShareToast(null), 2000);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="spinner border-primary-600 w-12 h-12" /></div>;
    }

    if (!report || !originalSession) {
        return <div className="text-center p-12 text-dark-500">Rapport introuvable pour la session #{id}</div>;
    }

    return (
        <>
            {/* Print styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area { position: absolute; top: 0; left: 0; width: 100%; border: none; shadow: none; }
                    .no-print { display: none !important; }
                    .print-area .gradient-primary { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
                }
            ` }} />

            {/* Toast */}
            {shareToast && (
                <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in">
                    <FiCheck /> {shareToast}
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6 pb-20 print-area">
                <Link href="/dashboard/sessions" className="inline-flex items-center gap-2 text-dark-500 hover:text-primary transition-colors font-medium no-print">
                    <FiArrowLeft /> Retour aux séances
                </Link>

                <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-xl overflow-hidden border border-dark-100 dark:border-dark-800">
                    {/* Report Header */}
                    <div className="gradient-primary p-8 md:p-12 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FiFileText size={160} />
                        </div>
                        <div className="relative">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">Rapport de Séance</span>
                            <h1 className="text-3xl md:text-5xl font-black mt-4 mb-2">{originalSession.groupName}</h1>
                            <p className="text-primary-100 text-lg">
                                {new Date(originalSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {originalSession.startTime} - {originalSession.endTime}
                            </p>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-8 md:p-12 space-y-12">
                        {/* Key Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Présence', value: `${report.presentCount} / ${report.totalStudents}`, color: 'text-dark-900 dark:text-white' },
                                { label: 'Récitations', value: report.totalRecitations, color: 'text-dark-900 dark:text-white' },
                                { label: 'Erreurs de Tajwid', value: report.totalTajwidErrors, color: 'text-yellow-600' },
                                { label: 'Oublis', value: report.totalForgotten, color: 'text-red-500' },
                            ].map((stat, i) => (
                                <div key={i} className="p-6 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 text-center">
                                    <p className="text-[10px] uppercase font-bold text-dark-400 mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pedagogical Summary */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FiTarget className="text-primary-500" /> Résumé Pédagogique
                            </h3>
                            <div className="p-6 bg-primary-50/30 dark:bg-primary-900/10 border-l-4 border-primary-500 rounded-r-2xl">
                                <p className="text-dark-700 dark:text-dark-300 leading-relaxed italic whitespace-pre-wrap">
                                    {report.pedagogicalSummary || "Aucun résumé pédagogique n'a été rédigé pour cette séance."}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Report Footer Actions */}
                    <div className="p-8 bg-dark-50 dark:bg-dark-800 border-t border-dark-100 dark:border-dark-700 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
                        <p className="text-sm text-dark-400 font-medium">Validé par : <strong>{originalSession.teacherName || 'Enseignant'}</strong></p>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={handleShare}
                                className="flex-1 btn btn-outline flex items-center justify-center gap-2 px-6 py-3 rounded-2xl hover:-translate-y-0.5 transition-all"
                            >
                                <FiShare2 /> Partager
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex-1 btn btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-2xl shadow-xl shadow-primary-500/20 hover:-translate-y-0.5 transition-all"
                            >
                                <FiDownload /> Télécharger PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
