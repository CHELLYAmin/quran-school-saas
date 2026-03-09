'use client';

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiUsers, FiAward, FiClock, FiBookOpen, FiArrowLeft, FiAlertTriangle, FiSend, FiPlusCircle } from 'react-icons/fi';
import { sessionApi } from '@/lib/api/client';
import { missionsService } from '@/lib/services/missions';
import { MissionTargetType } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SessionSummaryDashboard({ sessionId, groupName }: { sessionId: string; groupName: string }) {
    const [report, setReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await sessionApi.getReport(sessionId);
                setReport(data);
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement du rapport de séance');
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [sessionId]);

    const handleSendReports = async () => {
        setIsSending(true);
        try {
            await sessionApi.sendReports(sessionId);
            setSendSuccess(true);
            setTimeout(() => setSendSuccess(false), 5000);
        } catch (err: any) {
            alert(err.message || "Erreur lors de l'envoi des rapports.");
        } finally {
            setIsSending(false);
        }
    };

    const handleAssignMission = async (studentId: string, studentName: string) => {
        try {
            await missionsService.createManualMission({
                studentId,
                targetType: MissionTargetType.CustomText,
                customDescription: 'Réviser les erreurs de la séance précédente',
                dueDate: new Date(Date.now() + 86400000 * 3).toISOString() // in 3 days default
            });
            toast.success(`Mission assignée à ${studentName}`);
        } catch (error) {
            toast.error('Erreur lors de l\'assignation de la mission');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 h-full bg-dark-50 dark:bg-dark-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 h-full bg-dark-50 dark:bg-dark-950">
                <div className="text-center bg-white dark:bg-dark-900 p-8 rounded-2xl border border-red-200 dark:border-red-900/30">
                    <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">Impossible de charger le rapport</h3>
                    <p className="text-dark-500 dark:text-dark-400">{error}</p>
                </div>
            </div>
        );
    }

    const attendanceRate = report.totalStudents > 0
        ? Math.round((report.presentCount / report.totalStudents) * 100)
        : 0;

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-50 dark:bg-dark-950 font-sans overflow-y-auto">
            {/* Header */}
            <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-100 dark:border-dark-800 px-4 sm:px-8 py-6 sticky top-0 z-10 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-6xl mx-auto gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-xl shadow-inner">
                                <FiCheckCircle className="w-6 h-6" />
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white tracking-tight">Séance Terminée</h1>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-dark-500 capitalize">{groupName} <span className="mx-2 text-dark-300">•</span> {report.date ? new Date(report.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-3">
                        <button
                            onClick={handleSendReports}
                            disabled={isSending || sendSuccess}
                            className={`flex-1 sm:flex-none btn flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold ${sendSuccess
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-2 border-transparent shadow-none'
                                : 'bg-white text-dark-900 border-2 border-dark-200 hover:border-primary-500 hover:text-primary-600 dark:bg-dark-800 dark:text-white dark:border-dark-700 shadow-sm'
                                }`}
                        >
                            {isSending ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : sendSuccess ? (
                                <FiCheckCircle className="w-5 h-5 shrink-0" />
                            ) : (
                                <FiSend className="w-5 h-5 shrink-0" />
                            )}
                            {isSending ? 'Envoi...' : sendSuccess ? 'Envoyés !' : 'Envoyer aux parents'}
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/sessions')}
                            className="flex-1 sm:flex-none btn bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2 py-3 rounded-2xl shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all font-bold"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            Retour
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-fade-in relative">

                {/* Pedagogical Summary (if any) */}
                {report.pedagogicalSummary && (
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 border-2 border-primary-200 dark:border-primary-800/50 rounded-4xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300 mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-200/50 dark:bg-primary-800/50 flex items-center justify-center">
                                <FiBookOpen className="w-4 h-4" />
                            </div>
                            Note Pédagogique du Professeur
                        </h3>
                        <p className="text-primary-900 dark:text-primary-100 text-lg leading-relaxed font-medium">"{report.pedagogicalSummary}"</p>
                    </div>
                )}

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-dark-900 p-6 md:p-8 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                                <FiUsers className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-dark-500 text-sm font-bold uppercase tracking-wider">Présence</h3>
                                <div className="text-3xl font-extrabold text-dark-900 dark:text-white mt-1">{attendanceRate}%</div>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-dark-400 bg-dark-50 dark:bg-dark-800/50 py-2 px-3 rounded-xl inline-block">{report.presentCount} présents sur {report.totalStudents}</p>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-6 md:p-8 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center border border-green-100 dark:border-green-800/50">
                                <FiAward className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-dark-500 text-sm font-bold uppercase tracking-wider">Évalués</h3>
                                <div className="text-3xl font-extrabold text-dark-900 dark:text-white mt-1">{report.totalRecitations}</div>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-dark-400 bg-dark-50 dark:bg-dark-800/50 py-2 px-3 rounded-xl inline-block">Versets évalués</p>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-6 md:p-8 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-2xl flex items-center justify-center border border-accent-100 dark:border-accent-800/50">
                                <FiAlertTriangle className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-dark-500 text-sm font-bold uppercase tracking-wider">Erreurs Mém.</h3>
                                <div className="text-3xl font-extrabold text-dark-900 dark:text-white mt-1">
                                    {report.totalBlocked + report.totalForgotten}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-accent-600 bg-accent-50 dark:bg-accent-900/30 px-2 py-1 rounded-lg">{report.totalBlocked} Blocages</span>
                            <span className="text-xs font-bold text-accent-600 bg-accent-50 dark:bg-accent-900/30 px-2 py-1 rounded-lg">{report.totalForgotten} Oublis</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-6 md:p-8 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-800/50">
                                <FiClock className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-dark-500 text-sm font-bold uppercase tracking-wider">Fautes Tajwid</h3>
                                <div className="text-3xl font-extrabold text-dark-900 dark:text-white mt-1">
                                    {report.totalTajwidErrors}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-dark-400 bg-dark-50 dark:bg-dark-800/50 py-2 px-3 rounded-xl inline-block">À corriger à la maison</p>
                    </div>
                </div>

                {/* Top Performers / Difficulties */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performers */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm p-6 md:p-8 overflow-hidden flex flex-col">
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                <span className="w-2.5 h-2.5 bg-primary-500 rounded-full"></span>
                            </div>
                            <span>Excellentes récitations <span className="text-sm font-medium text-dark-400 ml-2">(Score &gt; 90)</span></span>
                        </h3>
                        {report.topPerformers?.length > 0 ? (
                            <div className="space-y-4">
                                {report.topPerformers.map((student: any) => (
                                    <div key={student.studentId} className="flex items-center justify-between p-4 bg-dark-50/50 hover:bg-dark-50 dark:bg-dark-950/50 dark:hover:bg-dark-800 rounded-3xl transition-colors border border-transparent hover:border-dark-100 dark:hover:border-dark-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-base shadow-sm border-2 border-primary-200/50 shrink-0">
                                                {student.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base text-dark-900 dark:text-white">{student.studentName}</div>
                                                <div className="text-xs font-semibold text-dark-500 mt-0.5">{student.versesEvaluated} versets évalués</div>
                                            </div>
                                        </div>
                                        <div className="text-right bg-white dark:bg-dark-900 py-2 px-4 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm shrink-0">
                                            <div className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{student.score}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-dark-50 dark:bg-dark-800/30 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <FiAward className="w-10 h-10 text-dark-300 mb-3" />
                                <p className="text-dark-500 font-medium text-center">Aucune récitation évaluée dans cette catégorie.</p>
                            </div>
                        )}
                    </div>

                    {/* Needs Attention */}
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 shadow-sm p-6 md:p-8 overflow-hidden flex flex-col">
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                            </div>
                            <span>Élèves en difficulté <span className="text-sm font-medium text-dark-400 ml-2">(Score &lt; 70)</span></span>
                        </h3>
                        {report.needsAttention?.length > 0 ? (
                            <div className="space-y-4">
                                {report.needsAttention.map((student: any) => (
                                    <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dark-50/50 hover:bg-orange-50/50 dark:bg-dark-950/50 dark:hover:bg-orange-900/10 rounded-3xl transition-colors border border-transparent hover:border-orange-100 dark:hover:border-orange-900/30 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-base shadow-sm border-2 border-orange-200/50 shrink-0">
                                                {student.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base text-dark-900 dark:text-white">{student.studentName}</div>
                                                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1 flex flex-wrap gap-1.5">
                                                    <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-800/50">{student.memorizationErrors} err. mém.</span>
                                                    <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-800/50">{student.tajwidErrors} err. tajwid</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0 self-start sm:self-auto items-end">
                                            <div className="text-right bg-white dark:bg-dark-900 py-2 px-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm">
                                                <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{student.score}</div>
                                            </div>
                                            <button
                                                onClick={() => handleAssignMission(student.studentId, student.studentName)}
                                                className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                                            >
                                                <FiPlusCircle size={14} />
                                                Assigner Devoir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-dark-50 dark:bg-dark-800/30 rounded-3xl border border-dashed border-dark-200 dark:border-dark-700">
                                <FiCheckCircle className="w-10 h-10 text-primary-300 mb-3" />
                                <p className="text-dark-500 font-medium text-center">Aucun élève signalé en difficulté pour cette séance.<br />Excellent travail du groupe !</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
