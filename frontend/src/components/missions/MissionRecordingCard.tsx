'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare, FiPlay, FiSend, FiTrash2, FiClock } from 'react-icons/fi';
import { missionsService } from '@/lib/services/missions';
import { StudentMissionResponse } from '@/types';
import toast from 'react-hot-toast';

interface MissionRecordingCardProps {
    mission: StudentMissionResponse;
    onSuccess: () => void;
}

export default function MissionRecordingCard({ mission, onSuccess }: MissionRecordingCardProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAudioUrl(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Failed to start recording', err);
            toast.error('Erreur d\'accès au microphone. Vérifiez vos permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!audioUrl) return;

        setIsSubmitting(true);
        try {
            // Get the blob from the URL
            const response = await fetch(audioUrl);
            const blob = await response.blob();

            // Create FormData
            const formData = new FormData();
            formData.append('file', blob, `mission_${mission.id}.webm`);

            // Upload to backend
            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/uploads/audio`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            const uploadData = await uploadRes.json();
            const serverFileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${uploadData.url}`;

            // Submit to mission service
            await missionsService.submitAudio(mission.id, serverFileUrl);

            toast.success('Récitation envoyée avec succès !');
            onSuccess();
        } catch (error) {
            console.error('Submit recording failed', error);
            toast.error('Erreur lors de l\'envoi de la récitation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const discardRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setRecordingTime(0);
    };

    return (
        <div className="bg-white dark:bg-dark-950 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRecording ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
                    <FiMic size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-dark-900 dark:text-white">Enregistrement Maison</h3>
                    <p className="text-sm text-dark-500">L'enseignant corrigera votre audio plus tard.</p>
                </div>
            </div>

            <div className="bg-dark-50 dark:bg-dark-900/50 rounded-2xl p-8 flex flex-col items-center justify-center border border-dark-100 dark:border-dark-800 mb-6">
                {isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-1 items-center justify-center h-8">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-red-500 rounded-full animate-wave"
                                    style={{
                                        height: '100%',
                                        animationDelay: `${i * 0.1}s`,
                                        opacity: Math.random() * 0.5 + 0.5
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-3xl font-black font-mono text-dark-900 dark:text-white">{formatTime(recordingTime)}</span>
                        <p className="text-sm font-bold text-red-500 animate-pulse uppercase tracking-widest">Enregistrement en cours...</p>
                    </div>
                ) : audioUrl ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <audio src={audioUrl} controls className="w-full h-10 accent-primary-600" />
                        <div className="flex gap-2 w-full mt-2">
                            <button
                                onClick={discardRecording}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-dark-200 dark:bg-dark-800 text-dark-700 dark:text-dark-300 rounded-xl font-bold hover:bg-dark-300 dark:hover:bg-dark-700 transition-colors"
                            >
                                <FiTrash2 /> Recommencer
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-dark-400 font-medium">Prêt pour votre récitation ?</p>
                        <p className="text-xs text-dark-500 max-w-[200px]">Assurez-vous d'être dans un endroit calme.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                {!isRecording && !audioUrl && (
                    <button
                        onClick={startRecording}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <FiMic size={20} /> Commencer à enregistrer
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/30"
                    >
                        <FiSquare size={20} /> Arrêter l'enregistrement
                    </button>
                )}

                {!isRecording && audioUrl && (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="spinner w-5 h-5 border-white" />
                        ) : (
                            <>
                                <FiSend size={20} /> Envoyer au professeur
                            </>
                        )}
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% { transform: scaleY(0.4); }
                    50% { transform: scaleY(1); }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
