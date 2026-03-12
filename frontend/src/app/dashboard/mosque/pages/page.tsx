'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiFileText, FiSearch, FiGlobe, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cmsApi, CmsPage, CreateCmsPageDto } from '@/lib/api/cms';

const CATEGORIES = [
    { id: 'all', label: 'Toutes' },
    { id: 'page', label: 'Pages' },
    { id: 'announcement', label: 'Annonces' },
    { id: 'service', label: 'Services' },
    { id: 'about', label: 'À propos' },
    { id: 'islam', label: 'Islam' },
];

const CATEGORY_COLORS: Record<string, string> = {
    page: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
    announcement: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
    service: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
    about: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50',
    islam: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/50',
};

export default function CmsPagesPage() {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingPage, setEditingPage] = useState<CmsPage | null>(null);

    // Editor state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('page');
    const [excerpt, setExcerpt] = useState('');
    const [showInMenu, setShowInMenu] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadPages(); }, []);

    const loadPages = async () => {
        try {
            const res = await cmsApi.getPages();
            setPages(res.data);
        } catch {
            toast.error("Erreur lors du chargement des pages");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (id: string) => {
        try {
            const res = await cmsApi.togglePublish(id);
            setPages(prev => prev.map(p => p.id === id ? { ...p, isPublished: res.data.isPublished } : p));
            toast.success(res.data.isPublished ? "Page publiée !" : "Page dépubliée");
        } catch {
            toast.error("Erreur lors du changement de statut");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette page ?")) return;
        try {
            await cmsApi.deletePage(id);
            setPages(prev => prev.filter(p => p.id !== id));
            toast.success("Page supprimée");
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    const openNewEditor = () => {
        setEditingPage(null);
        setTitle(''); setSlug(''); setContent(''); setCategory('page'); setExcerpt('');
        setShowInMenu(false); setSortOrder(0);
        setShowEditor(true);
    };

    const openEditEditor = (page: CmsPage) => {
        setEditingPage(page);
        setTitle(page.title); setSlug(page.slug); setContent(page.content);
        setCategory(page.category); setExcerpt(page.excerpt || '');
        setShowInMenu(page.showInMenu || false); setSortOrder(page.sortOrder || 0);
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!title || !slug) return toast.error("Titre et slug requis");
        setSaving(true);
        try {
            const dto: CreateCmsPageDto = { 
                title, slug, content, category, excerpt, 
                isPublished: editingPage?.isPublished || false,
                showInMenu,
                sortOrder
            };
            if (editingPage) {
                const res = await cmsApi.updatePage(editingPage.id, dto);
                setPages(prev => prev.map(p => p.id === editingPage.id ? res.data : p));
                toast.success("Page mise à jour !");
            } else {
                const res = await cmsApi.createPage(dto);
                setPages(prev => [res.data, ...prev]);
                toast.success("Page créée !");
            }
            setShowEditor(false);
        } catch {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const generateSlug = (t: string) => {
        return t.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    const filtered = pages
        .filter(p => filter === 'all' || p.category === filter)
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 rounded-4xl p-6 sm:p-8 border border-dark-100 dark:border-dark-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">Pages du Site</h1>
                    <p className="text-dark-500 mt-2 font-medium text-lg">Gérez le contenu du site vitrine de la mosquée</p>
                </div>
                <button onClick={openNewEditor} className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-500/20 font-bold transition-all hover:-translate-y-0.5 relative z-10">
                    <FiPlus size={20} /> Nouvelle page
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                    <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11 w-full" />
                </div>
                <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap bg-dark-50 dark:bg-dark-800 p-1 rounded-2xl border border-dark-100 dark:border-dark-700">
                    {CATEGORIES.map(c => (
                        <button key={c.id} onClick={() => setFilter(c.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${filter === c.id ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm' : 'text-dark-400 hover:text-dark-600'}`}
                        >{c.label}</button>
                    ))}
                </div>
            </div>

            {/* Pages List */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 p-16 text-center">
                        <FiFileText size={48} className="mx-auto text-dark-200 dark:text-dark-700 mb-4" />
                        <p className="text-dark-400 font-bold">Aucune page trouvée</p>
                        <p className="text-dark-300 text-sm mt-1">Créez votre première page pour alimenter le site vitrine.</p>
                    </div>
                ) : filtered.map(page => (
                    <div key={page.id} className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-dark-900 dark:text-white truncate">{page.title}</h3>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${CATEGORY_COLORS[page.category] || CATEGORY_COLORS.page}`}>
                                        {page.category}
                                    </span>
                                    {page.isPublished ? (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 flex items-center gap-1">
                                            <FiGlobe size={10} /> Publié
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-dark-50 text-dark-400 border border-dark-100 dark:bg-dark-800 dark:border-dark-700">
                                            Brouillon
                                        </span>
                                    )}
                                    {page.showInMenu && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50 flex items-center gap-1">
                                            Menu #{page.sortOrder}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-dark-400 font-medium">/{page.slug}</p>
                                {page.excerpt && <p className="text-sm text-dark-500 mt-1 line-clamp-2">{page.excerpt}</p>}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleTogglePublish(page.id)} title={page.isPublished ? "Dépublier" : "Publier"}
                                    className={`p-2.5 rounded-xl transition-all ${page.isPublished ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20' : 'bg-dark-50 text-dark-400 hover:bg-dark-100 dark:bg-dark-800'}`}
                                >
                                    {page.isPublished ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </button>
                                <button onClick={() => openEditEditor(page)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 transition-all">
                                    <FiEdit size={16} />
                                </button>
                                <button onClick={() => handleDelete(page.id)} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 transition-all">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-900 rounded-4xl border border-dark-100 dark:border-dark-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8 border-b border-dark-100 dark:border-dark-800">
                            <h2 className="text-2xl font-extrabold text-dark-900 dark:text-white">
                                {editingPage ? 'Modifier la page' : 'Nouvelle page'}
                            </h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Titre</label>
                                    <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!editingPage) setSlug(generateSlug(e.target.value)); }}
                                        className="input w-full font-bold" placeholder="Ex: Historique de la communauté" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Slug (URL)</label>
                                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                                        className="input w-full font-mono text-sm" placeholder="historique-de-la-communaute" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Catégorie</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-full font-bold">
                                        <option value="page">Page</option>
                                        <option value="announcement">Annonce</option>
                                        <option value="service">Service</option>
                                        <option value="about">À propos</option>
                                        <option value="islam">Islam</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Résumé</label>
                                    <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                                        className="input w-full" placeholder="Court résumé de la page..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-50 dark:bg-dark-800/50 p-6 rounded-3xl border border-dark-100 dark:border-dark-800">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-dark-900 dark:text-white block">Afficher dans le menu</label>
                                        <p className="text-xs text-dark-400">Rendre visible dans la navigation principale</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={showInMenu} onChange={(e) => setShowInMenu(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none dark:bg-dark-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Ordre d'affichage</label>
                                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                        className="input w-full font-bold" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Contenu (Markdown)</label>
                                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                                    rows={16} className="input w-full font-mono text-sm leading-relaxed resize-y"
                                    placeholder="# Titre&#10;&#10;Votre contenu ici en Markdown..." />
                            </div>
                        </div>
                        <div className="p-8 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)} className="btn bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 px-6 py-3 rounded-2xl font-bold hover:bg-dark-200">
                                Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50">
                                <FiSave size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
