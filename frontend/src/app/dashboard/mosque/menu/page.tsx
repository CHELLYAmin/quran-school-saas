'use client';

import React, { useEffect, useState } from 'react';
import { FiMenu, FiSave, FiMove, FiCheck, FiGlobe } from 'react-icons/fi';
import { cmsApi, CmsPage } from '@/lib/api/cms';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/ui/PageSkeleton';

export default function MenuBuilderPage() {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            const res = await cmsApi.getPages(true);
            setPages(res.data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        } catch (e) {
            toast.error("Erreur lors du chargement des pages");
        } finally {
            setLoading(false);
        }
    };

    const toggleInMenu = (id: string) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, showInMenu: !p.showInMenu } : p));
    };

    const updateOrder = (id: string, newOrder: number) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, sortOrder: newOrder } : p).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await Promise.all(pages.map(p => cmsApi.updatePage(p.id, {
                title: p.title,
                slug: p.slug,
                content: p.content,
                category: p.category,
                showInMenu: p.showInMenu,
                sortOrder: p.sortOrder
            })));
            toast.success("Menu mis à jour avec succès !");
        } catch (e) {
            toast.error("Erreur lors de la sauvegarde du menu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-black text-dark-950 dark:text-white tracking-tight flex items-center gap-3">
                        <FiMenu className="text-primary-600" /> Menu du site
                    </h1>
                    <p className="text-dark-500 font-medium mt-2">Gérez la navigation principale du site vitrine.</p>
                </div>
                <button onClick={handleSaveAll} disabled={saving} className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={20} />}
                    Enregistrer
                </button>
            </div>

            {/* Menu List */}
            <div className="grid gap-4">
                {pages.map((page: CmsPage, index: number) => (
                    <div key={page.id} className={`bg-white dark:bg-dark-900 rounded-3xl p-6 border-2 transition-all duration-300 relative overflow-hidden ${page.showInMenu ? 'border-primary-500/20 shadow-lg shadow-primary-500/5' : 'border-dark-100 dark:border-dark-800 opacity-60 grayscale'}`}>
                        {page.showInMenu && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-dark-50 dark:bg-dark-800 text-dark-400 font-black text-xs shrink-0">
                                    <FiMove size={14} className="mb-0.5" />
                                    {index + 1}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-dark-900 dark:text-white tracking-tight truncate">{page.title}</h3>
                                        <span className="text-[9px] px-2 py-1 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-500 font-black uppercase tracking-[0.15em] border border-dark-200/50 dark:border-dark-700">{page.category}</span>
                                    </div>
                                    <p className="text-xs text-primary-600 dark:text-accent-gold font-mono font-bold mt-1 tracking-tight">/{page.slug}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-dark-50 dark:border-dark-800/50">
                                <div className="flex flex-col gap-1.5 min-w-[100px]">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 ml-1">Ordre</label>
                                    <input 
                                        type="number" 
                                        value={page.sortOrder} 
                                        onChange={(e) => updateOrder(page.id, parseInt(e.target.value) || 0)}
                                        className="w-full bg-dark-50 dark:bg-dark-950 border-2 border-transparent focus:border-primary-500 rounded-xl px-3 py-2 text-center font-black text-sm transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400">Visible</label>
                                    <button 
                                        onClick={() => toggleInMenu(page.id)}
                                        className={`relative inline-flex items-center h-8 w-14 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${page.showInMenu ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-dark-200 dark:bg-dark-700'}`}
                                    >
                                        <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 shadow-md ${page.showInMenu ? 'translate-x-7' : 'translate-x-1'}`} />
                                        {page.showInMenu && <FiCheck className="absolute left-2.5 text-white" size={10} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Section */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-dark-100 dark:border-dark-800 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/30">
                        <FiGlobe size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-dark-900 dark:text-white tracking-tight uppercase">Aperçu du Menu</h2>
                        <p className="text-sm text-dark-500 font-medium mt-2 leading-relaxed">Seules les pages avec le bouton vert activé apparaîtront dans la barre de navigation de votre site vitrine, dans l'ordre défini.</p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {pages.filter((p: CmsPage) => p.showInMenu).length === 0 ? (
                                <p className="text-xs text-dark-400 font-bold italic">Aucun lien visible dans le menu pour le moment.</p>
                            ) : pages.filter((p: CmsPage) => p.showInMenu).map((p: CmsPage) => (
                                <span key={p.id} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30 text-primary-600 dark:text-accent-gold text-xs font-black uppercase tracking-wider shadow-sm">
                                    {p.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
