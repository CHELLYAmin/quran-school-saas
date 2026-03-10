'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/client';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            const [firstName, ...lastNameParts] = formData.fullName.trim().split(/\s+/);
            const lastName = lastNameParts.join(' ') || '.';
            
            await authApi.register({
                email: formData.email,
                password: formData.password,
                firstName,
                lastName,
                role: 'Student',
                profileType: 1, // Student
                profileId: '00000000-0000-0000-0000-000000000000',
                schoolId: '00000000-0000-0000-0000-000000000000' // Default / SaaS School
            });
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'L\'inscription a échoué');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-pearl dark:bg-dark-950 font-sans arabesque-bg">
            <div className="relative w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row shadow-2xl overflow-hidden min-h-screen lg:min-h-[auto] lg:h-[90vh] lg:my-auto lg:rounded-lg border border-white/50">

                {/* Left Side: Branding / Visual */}
                <div className="hidden lg:flex lg:w-5/12 bg-primary-900 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-40 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuATgZ7tsCONceuJtpaoU59ly3cIcCaYPAL8dCPO1yZdqCZP-li-DBXV2AwNNLr5cQ0zOXcoT7KPtK2TCuw_EXL_pRmlpG1tgIbiPMVeeeMO56ssiBohcZrrUG8ddiiFyoiS3Uff_Ih13U96CXdLzjGL5gFlQajqSPwNJ_KkXyAueRrRvCdcvzdCdN3RYRviPF78RGBjhNOSkeXnuhL3l8PGWrm-tDo1ErbzHfcF66PDyqXH8eR5bWE-_seEc8x_qrRdQde7R4QGqJW9')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent"></div>

                    <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
                        <div className="flex items-center gap-3">
                            <Link href="/site" className="size-12 bg-accent-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group">
                                <span className="material-symbols-outlined text-primary-900 text-2xl font-bold">mosque</span>
                            </Link>
                            <h2 className="cinzel-title text-2xl font-bold tracking-widest uppercase">CCIQ</h2>
                        </div>

                        <div>
                            <h1 className="cinzel-title text-5xl font-bold leading-tight mb-6">Rejoignez la Communauté</h1>
                            <p className="text-white/80 text-xl leading-relaxed max-w-sm">
                                Connectez-vous avec nos initiatives spirituelles et sociales.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <div className="h-1 w-12 bg-accent-gold rounded-full"></div>
                            <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                            <div className="h-1 w-4 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 bg-white/80 backdrop-blur-md p-8 lg:p-16 flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10 text-center lg:text-left">
                            <h2 className="cinzel-title text-4xl font-bold text-primary-900 mb-2">Créer un compte</h2>
                            <p className="text-dark-500 font-medium">Veuillez entrer vos informations pour vous inscrire</p>
                        </header>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-primary-900/80 ml-1 uppercase tracking-wider">Nom complet</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">person</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-dark-100 rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200 text-dark-900 placeholder:text-dark-400"
                                        placeholder="Abdullah Al-Mansur"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-primary-900/80 ml-1 uppercase tracking-wider">Adresse courriel</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">mail</span>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-dark-100 rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200 text-dark-900 placeholder:text-dark-400"
                                        placeholder="nom@exemple.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-primary-900/80 ml-1 uppercase tracking-wider">Téléphone</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">call</span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-dark-100 rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200 text-dark-900 placeholder:text-dark-400"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-primary-900/80 ml-1 uppercase tracking-wider">Mot de passe</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">lock</span>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-dark-100 rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200 text-dark-900 placeholder:text-dark-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-primary-900/80 ml-1 uppercase tracking-wider">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">shield_lock</span>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-dark-100 rounded-xl focus:ring-2 focus:ring-accent-gold focus:border-transparent outline-none transition-all duration-200 text-dark-900 placeholder:text-dark-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input id="terms" type="checkbox" required className="w-5 h-5 mt-0.5 border-dark-100 text-primary-900 focus:ring-accent-gold rounded" />
                                <label htmlFor="terms" className="text-sm text-dark-600 leading-tight">
                                    J'accepte les <a className="text-primary-900 font-bold hover:text-accent-gold underline underline-offset-4" href="#">Conditions d'utilisation</a> et la <a className="text-primary-900 font-bold hover:text-accent-gold underline underline-offset-4" href="#">Politique de confidentialité</a>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary-900/20 transition-all transform active:scale-[0.98] cinzel-title tracking-widest mt-4"
                            >
                                {loading ? 'Chargement...' : 'Continuer l\'inscription'}
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-dark-500">Déjà membre ?
                                <Link href="/login" className="text-accent-gold font-bold hover:text-primary-900 transition-colors underline underline-offset-4 ml-1">
                                    Se connecter ici
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
