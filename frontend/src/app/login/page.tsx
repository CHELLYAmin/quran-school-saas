'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@alnoor-quran.fr');
    const [password, setPassword] = useState('Admin@123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authApi.login(email, password);
            login(data);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pearl dark:bg-dark-950 p-4 font-sans islamic-pattern relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 p-10 opacity-10 dark:opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-primary-900 scale-[5] rotate-45">filter_vintage</span>
            </div>
            <div className="absolute bottom-0 left-0 p-10 opacity-10 dark:opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-primary-900 scale-[5] -rotate-12">filter_vintage</span>
            </div>

            <div className="relative w-full max-w-[480px] z-10">
                {/* Branding */}
                <div className="text-center mb-10">
                    <Link href="/site" className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-900 shadow-xl mb-6 text-accent-gold transform rotate-3 hover:rotate-0 transition-transform duration-500 hover:scale-105 group">
                        <span className="material-symbols-outlined text-4xl font-bold">mosque</span>
                    </Link>
                    <h1 className="cinzel-title text-4xl font-bold text-primary-900 dark:text-accent-gold mb-2 tracking-widest uppercase">CCIQ</h1>
                    <p className="text-dark-500 dark:text-dark-400 text-sm font-medium tracking-widest uppercase">Centre Culturel Islamique de Québec</p>
                    <div className="flex justify-center mt-4">
                        <div className="h-0.5 w-12 bg-accent-gold rounded-full"></div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full bg-white dark:bg-dark-900 p-8 sm:p-12 rounded-lg shadow-2xl border border-primary-900/5 backdrop-blur-sm bg-white/90 animate-slide-up">
                    <h2 className="cinzel-title text-2xl font-bold mb-8 text-primary-900 dark:text-dark-50 text-center">Connexion</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary-900/80 dark:text-dark-300 ml-1">Adresse courriel</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 rounded-xl text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="nom@exemple.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-primary-900/80 dark:text-dark-300">Mot de passe</label>
                                <a href="#" className="text-xs font-bold text-accent-gold hover:text-primary-900 transition-colors">Oublié ?</a>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 rounded-xl text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-1 pt-1">
                            <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-900 focus:ring-accent-gold" />
                            <span className="text-sm font-medium text-dark-600 dark:text-dark-400">Se souvenir de moi</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    <div className="relative flex items-center py-8">
                        <div className="flex-grow border-t border-dark-100 dark:border-dark-800"></div>
                        <span className="flex-shrink mx-4 text-dark-400 text-xs font-medium uppercase tracking-widest">ou</span>
                        <div className="flex-grow border-t border-dark-100 dark:border-dark-800"></div>
                    </div>

                    <button
                        onClick={() => router.push('/register')}
                        className="w-full bg-white dark:bg-transparent border-2 border-primary-900/10 hover:border-primary-900/30 text-primary-900 dark:text-accent-gold font-bold py-4 rounded-xl transition-all"
                    >
                        Créer un compte
                    </button>

                    {/* Demo Accounts - Minimal */}
                    <div className="mt-8 text-center text-[10px] text-dark-400 uppercase tracking-tighter">
                        <p>Mode Démo : admin@alnoor-quran.fr / Teacher@123</p>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-dark-400 px-4">
                    En continuant, vous acceptez nos <a className="underline" href="#">Conditions d&apos;utilisation</a> et notre <a className="underline" href="#">Politique de confidentialité</a>.
                </p>
            </div>
        </div>
    );
}
