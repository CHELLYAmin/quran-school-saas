'use client';

import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, ReactNode } from 'react';
import {
    FiHome, FiUsers, FiGrid, FiBook, FiCalendar, FiCheckSquare,
    FiMessageCircle, FiDollarSign, FiTrendingUp, FiMail, FiBell, FiSettings,
    FiLogOut, FiSun, FiMoon, FiMenu, FiGlobe, FiBookOpen, FiLayers, FiShield,
    FiChevronDown, FiChevronRight, FiX, FiTarget, FiAward, FiPieChart, FiMusic,
    FiMapPin, FiBriefcase, FiCreditCard, FiClock, FiPocket, FiFileText, FiHeart
} from 'react-icons/fi';
import { usePermission, Permissions } from '@/hooks/usePermission';
import { UserRole } from '@/types';
import { notificationsService, NotificationResponse } from '@/lib/services/notifications';

type NavItem = { icon: ReactNode; label: string; href: string; permissions?: string[] };
type NavGroup = { title: string; items: NavItem[]; module?: string };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const { sidebarOpen, darkMode, locale, toggleSidebar, toggleDarkMode, setLocale } = useUIStore();
    const { t } = useTranslation(locale);
    const router = useRouter();
    const pathname = usePathname();

    // Section collapse state
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
    const [activeModule, setActiveModule] = useState<'scolarite' | 'gestion' | 'web' | 'admin'>('scolarite');
    const [moduleMenuOpen, setModuleMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const sidebarModules = [
        { id: 'scolarite', label: 'École', icon: '🎓' },
        { id: 'gestion', label: 'Mosquée / Gestion', icon: '🕌' },
        { id: 'web', label: 'Site Web & CMS', icon: '🌐' },
        { id: 'admin', label: 'Administration', icon: '⚙️' },
    ];

    useEffect(() => {
        // Only redirect if loading is finished and not authenticated
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications();
            // Default active module by role
            const primaryRole = user?.roles?.[0];
            if (primaryRole === 'Admin' || primaryRole === 'Teacher' || primaryRole === 'Examiner') {
                setActiveModule('scolarite');
            } else if (pathname.includes('/mosque/hub') || pathname.includes('/mosque/pages')) {
                setActiveModule('web');
            }
        }
    }, [isAuthenticated, pathname, user]);

    const loadNotifications = async () => {
        try {
            const data = await notificationsService.getMyNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (e) {
            console.error('Failed to load notifications', e);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        }
    };

    // Close sidebar on navigation on mobile
    useEffect(() => {
        if (sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleSidebar();
        }
    }, [pathname]);

    const { hasAnyPermission } = usePermission();

    const navGroups: NavGroup[] = [
        {
            title: 'Général',
            items: [
                { icon: <FiHome size={18} />, label: t.common.dashboard, href: '/dashboard' },
                { icon: <FiShield size={18} />, label: 'Rôles & Accès', href: '/dashboard/roles', permissions: [Permissions.RolesManage] },
                { icon: <FiUsers size={18} />, label: 'Espace Famille', href: '/dashboard/parent', permissions: [Permissions.ParentDashboardView] },
                { icon: <FiMail size={18} />, label: t.common.messages, href: '/dashboard/messages', permissions: [Permissions.MessagesView] },
            ]
        },
        {
            title: 'Pédagogie',
            module: 'scolarite',
            items: [
                { icon: <FiTarget size={18} />, label: 'Missions & Révisions', href: '/dashboard/missions' },
                { icon: <FiCheckSquare size={18} />, label: 'Corrections Audio', href: '/dashboard/missions/review', permissions: [Permissions.HomeworkManage] },
                { icon: <FiCheckSquare size={18} />, label: 'Évaluations', href: '/dashboard/evaluations', permissions: [Permissions.ExamsView] },
                { icon: <FiCalendar size={18} />, label: t.common.sessions, href: '/dashboard/sessions', permissions: [Permissions.SessionsView] },
                { icon: <FiBookOpen size={18} />, label: t.common.mushaf, href: '/dashboard/mushaf' },
                { icon: <FiBook size={18} />, label: t.common.exams, href: '/dashboard/exams', permissions: [Permissions.ExamsView] },
                { icon: <FiBookOpen size={18} />, label: t.common.homework, href: '/dashboard/homework' },
            ]
        },
        {
            title: 'Contenu & Site',
            module: 'web',
            items: [
                { icon: <FiGrid size={18} />, label: 'Dashboard Hub', href: '/dashboard/mosque/hub' },
                { icon: <FiFileText size={18} />, label: 'Page et contenu', href: '/dashboard/mosque/pages' },
                { icon: <FiMenu size={18} />, label: 'Menu du site', href: '/dashboard/mosque/menu' },
                { icon: <FiHeart size={18} />, label: 'Campagnes de Dons', href: '/dashboard/mosque/donations' },
                { icon: <FiUsers size={18} />, label: 'Missions Bénévolat', href: '/dashboard/mosque/volunteering' },
            ]
        },
        {
            title: 'Activités Mosquée',
            module: 'gestion',
            items: [
                { icon: <FiShield size={18} />, label: 'Service Funéraire', href: '/dashboard/mosque/funeral' },
                { icon: <FiMapPin size={18} />, label: 'Cimetière', href: '/dashboard/mosque/cemetery' },
            ]
        },
        {
            title: 'Organisation',
            module: 'scolarite',
            items: [
                { icon: <FiGrid size={18} />, label: t.common.groups, href: '/dashboard/groups', permissions: [Permissions.GroupsView] },
                { icon: <FiLayers size={18} />, label: t.common.levels, href: '/dashboard/levels', permissions: [Permissions.SettingsView] },
                { icon: <FiCalendar size={18} />, label: t.common.schedule, href: '/dashboard/schedule', permissions: [Permissions.ScheduleView] },
            ]
        },
        {
            title: 'Communauté',
            module: 'scolarite',
            items: [
                { icon: <FiUsers size={18} />, label: t.common.students, href: '/dashboard/students', permissions: [Permissions.StudentsView, Permissions.UsersView] },
                { icon: <FiUsers size={18} />, label: t.common.teachers, href: '/dashboard/teachers?role=Teacher', permissions: [Permissions.TeachersView, Permissions.UsersView] },
                { icon: <FiShield size={18} />, label: t.common.roles.Examiner, href: '/dashboard/teachers?role=Examiner', permissions: [Permissions.ExamsView, Permissions.UsersView] },
                { icon: <FiUsers size={18} />, label: 'Parents', href: '/dashboard/parents', permissions: [Permissions.UsersView, Permissions.UsersManage] },
            ]
        },
        {
            title: 'Suivi & Performance',
            module: 'scolarite',
            items: [
                { icon: <FiCheckSquare size={18} />, label: t.common.attendance, href: '/dashboard/attendance', permissions: [Permissions.AttendanceView] },
                { icon: <FiTrendingUp size={18} />, label: t.common.progress, href: '/dashboard/progress', permissions: [Permissions.ProgressView] },
                { icon: <FiAward size={18} />, label: 'Palmarès', href: '/dashboard/leaderboard' },
            ]
        },
        {
            title: 'Finances Scolaires',
            module: 'scolarite',
            items: [
                { icon: <FiDollarSign size={18} />, label: 'Paiements & Scolarité', href: '/dashboard/payments', permissions: [Permissions.PaymentsView] },
            ]
        },
        {
            title: 'Ressources Humaines',
            module: 'admin',
            items: [
                { icon: <FiBriefcase size={18} />, label: 'Gestion du Personnel', href: '/dashboard/staff', permissions: [Permissions.StaffView] },
                { icon: <FiCalendar size={18} />, label: 'Congés & Absences', href: '/dashboard/staff/absences', permissions: [Permissions.StaffView] },
            ]
        },
        {
            title: 'Trésorerie',
            module: 'admin',
            items: [
                { icon: <FiTrendingUp size={18} />, label: 'Dashboard Financier', href: '/dashboard/finance', permissions: [Permissions.FinanceView] },
                { icon: <FiDollarSign size={18} />, label: 'Grand Livre', href: '/dashboard/finance/transactions', permissions: [Permissions.FinanceView] },
                { icon: <FiPocket size={18} />, label: 'Budgets Projets', href: '/dashboard/finance/projects', permissions: [Permissions.FinanceView] },
            ]
        },
        {
            title: 'Configuration Rapide',
            module: 'web',
            items: [
                { icon: <FiClock size={18} />, label: 'Horaires de Prière', href: '/dashboard/mosque/prayer-times' },
                { icon: <FiCalendar size={18} />, label: 'Calendrier Ramadan', href: '/dashboard/mosque/ramadan' },
                { icon: <FiBell size={18} />, label: 'Bandeau actualité', href: '/dashboard/mosque/banner' },
                { icon: <FiSettings size={18} />, label: 'Réglages Web', href: '/dashboard/mosque/settings' },
            ]
        },
        {
            title: 'Administration Système',
            module: 'admin',
            items: [
                { icon: <FiUsers size={18} />, label: 'Utilisateurs', href: '/dashboard/users', permissions: [Permissions.UsersManage] },
                { icon: <FiPieChart size={18} />, label: 'Statistiques Globales', href: '/dashboard/analytics', permissions: [Permissions.AdminDashboardView] },
            ]
        }
    ];

    const toggleSection = (title: string) => {
        setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const toggleAllSections = () => {
        const visibleGroups = navGroups.filter(g => (!g.module || g.module === activeModule) && g.title !== 'Général').map(g => g.title);
        const allExpanded = visibleGroups.every(title => !collapsedSections[title]);
        const newState = { ...collapsedSections };
        visibleGroups.forEach(title => { newState[title] = allExpanded; });
        setCollapsedSections(newState);
    };

    const handleLogout = () => { logout(); router.push('/login'); };

    if (isLoading || !isAuthenticated) return (
        <div className="h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
            <div className="spinner w-10 h-10 border-primary-600" />
        </div>
    );

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-dark-50 dark:bg-dark-950">
            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 h-[100dvh] bg-white dark:bg-dark-900 border-r border-dark-100 dark:border-dark-800/50 
                flex flex-col transition-all duration-300 overflow-hidden
                lg:translate-x-0 lg:static lg:flex
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-20 lg:translate-x-0'}
            `}>
                {/* Logo & Module Switcher */}
                <div className="p-4 flex flex-col gap-4 border-b border-dark-100 dark:border-dark-800/50 bg-white dark:bg-dark-900 z-10 shrink-0">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-900 text-accent-gold rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/10">
                                <span className="material-symbols-outlined text-2xl">mosque</span>
                            </div>
                            {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                <div className="animate-fade-in overflow-hidden whitespace-nowrap">
                                    <h1 className="font-bold text-lg text-dark-900 dark:text-white leading-tight">Quran School</h1>
                                    <Link href="/site" className="mt-1 flex items-center gap-1.5 text-primary-600 dark:text-accent-gold text-[9px] font-black uppercase tracking-widest group/site">
                                        <span className="material-symbols-outlined text-[12px]">public</span>
                                        <span className="group-hover/site:underline decoration-2 underline-offset-4">Voir le site</span>
                                    </Link>
                                    <p className="text-[10px] text-dark-400 capitalize font-medium tracking-wide mt-1">
                                        {(() => {
                                            const primaryRole = user?.roles?.[0];
                                            if (!primaryRole) return 'Utilisateur';
                                            return t.common.roles[primaryRole as keyof typeof t.common.roles] || String(primaryRole);
                                        })()}
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={toggleSidebar}
                            className="p-2 lg:hidden text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Module Selector - Only visible when sidebar expanded */}
                    {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                        <div className="relative mt-2">
                            <button
                                onClick={() => setModuleMenuOpen(!moduleMenuOpen)}
                                className="w-full flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 rounded-2xl transition-all hover:bg-white dark:hover:bg-dark-800 hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{sidebarModules.find(m => m.id === activeModule)?.icon}</span>
                                    <span className="text-sm font-bold text-dark-900 dark:text-white">{sidebarModules.find(m => m.id === activeModule)?.label}</span>
                                </div>
                                <FiChevronDown className={`text-dark-400 transition-transform ${moduleMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {moduleMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setModuleMenuOpen(false)} />
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-dark-100 dark:border-700/50 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {sidebarModules.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => {
                                                    setActiveModule(m.id as any);
                                                    setModuleMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeModule === m.id ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-400' : 'text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-700/50'}`}
                                            >
                                                <span>{m.icon}</span>
                                                <span>{m.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation - Main scrolling area */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 py-4 space-y-4 touch-pan-y overscroll-contain min-h-0 scroll-smooth custom-scrollbar">

                    {/* Expand/Collapse All Toggle */}
                    {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                        <div className="flex justify-end px-2 mb-2">
                            <button
                                onClick={toggleAllSections}
                                className="text-[10px] font-bold text-dark-400 hover:text-primary-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                <FiLayers size={10} />
                                Tout plier / déplier
                            </button>
                        </div>
                    )}

                    {navGroups.map((group: any) => {
                        // Filter by module if applicable
                        if (group.module && group.module !== activeModule) return null;

                        const filteredItems = group.items.filter((item: any) => !item.permissions || hasAnyPermission(item.permissions));
                        if (filteredItems.length === 0) return null;

                        const isSidebarVisible = sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024);
                        const isCollapsed = collapsedSections[group.title];

                        return (
                            <div key={group.title} className="space-y-1">
                                {isSidebarVisible && (
                                    <button
                                        onClick={() => toggleSection(group.title)}
                                        className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 dark:text-dark-500 hover:text-primary-600 transition-colors"
                                    >
                                        <span>{group.title}</span>
                                        {isCollapsed ? <FiChevronRight size={12} /> : <FiChevronDown size={12} />}
                                    </button>
                                )}
                                {!isSidebarVisible && group.title !== 'Général' && <div className="h-px bg-dark-100 dark:bg-dark-800 mx-2 my-4" />}

                                <div className={`${isCollapsed && isSidebarVisible ? 'hidden' : 'block'} space-y-1`}>
                                    {filteredItems.map((item: any) => {
                                        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
                                        const itemUrl = new URL(item.href, 'http://localhost');
                                        const itemSearch = itemUrl.search;
                                        
                                        const isActive = item.href === '/dashboard'
                                            ? pathname === '/dashboard'
                                            : (pathname === itemUrl.pathname && (itemSearch === '' || window.location.search === itemSearch)) || 
                                              (pathname.startsWith(itemUrl.pathname + '/') && item.href !== '/dashboard');
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                                title={!isSidebarVisible ? item.label : undefined}
                                            >
                                                {item.icon}
                                                {isSidebarVisible && <span className="animate-fade-in truncate font-bold">{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {/* Safe area for mobile scrolling to reach the bottom item and avoid being cut by Safari/Chrome bars */}
                    <div className="h-32 lg:hidden pointer-events-none" />
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-dark-100 dark:border-dark-800/50 bg-white dark:bg-dark-900 shrink-0 relative">
                    <button
                        onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                        className="w-full flex items-center justify-center p-3 text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white rounded-xl transition-all"
                    >
                        <FiSettings size={20} className={`transition-transform duration-300 ${settingsMenuOpen ? 'rotate-90' : ''}`} />
                        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 1024)) && <span className="ml-3 font-bold text-sm">Paramètres</span>}
                    </button>

                    {settingsMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setSettingsMenuOpen(false)} />
                            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700/50 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <button onClick={() => { toggleDarkMode(); setSettingsMenuOpen(false); }} className="sidebar-item w-full !py-2.5 !text-sm">
                                    {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                                    <span className="font-bold">Mode {darkMode ? 'Clair' : 'Sombre'}</span>
                                </button>

                                <div className="h-px bg-dark-100 dark:bg-dark-800 my-2 mx-2" />

                                <div className="px-4 py-1 text-[10px] font-black text-dark-400 uppercase tracking-widest">Langue</div>
                                {(['fr', 'ar', 'en'] as const).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => { setLocale(l); setSettingsMenuOpen(false); }}
                                        className={`sidebar-item w-full !py-2 !text-sm ${locale === l ? 'active' : ''}`}
                                    >
                                        <span className="font-bold">{l === 'fr' ? 'Français' : l === 'ar' ? 'العربية' : 'English'}</span>
                                    </button>
                                ))}

                                <div className="h-px bg-dark-100 dark:bg-dark-800 my-2 mx-2" />

                                <button onClick={handleLogout} className="sidebar-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 !py-2.5 !text-sm">
                                    <FiLogOut size={16} />
                                    <span className="font-bold">{t.common.logout}</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content Area (Header + Body) */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar - Full Width */}
                <header className="h-20 bg-white/90 dark:bg-dark-900/95 backdrop-blur-md border-b border-dark-100 dark:border-dark-800/50 flex items-center shrink-0 z-20 shadow-sm px-4 sm:px-8">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-6">
                            <button onClick={toggleSidebar} className="p-3 hover:bg-dark-50 dark:hover:bg-dark-800 rounded-2xl transition-all text-dark-600 dark:text-dark-300 border border-transparent hover:border-dark-100">
                                <FiMenu size={22} />
                            </button>
                            <h2 className="text-base sm:text-xl font-black text-primary-950 dark:text-white truncate tracking-tight">
                                {t.common.welcome}, <span className="text-primary-600 dark:text-primary-400">{user?.fullName?.split(' ')[0]}</span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-6">
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="relative p-3.5 bg-dark-50 hover:bg-white dark:bg-dark-800/80 dark:hover:bg-dark-700 rounded-2xl transition-all text-dark-600 dark:text-dark-300 border border-dark-100 dark:border-dark-700/50 shadow-sm"
                                >
                                    <FiBell size={20} />
                                    {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white dark:border-dark-900" />}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700/50 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-dark-100 dark:border-dark-700/50 flex items-center justify-between bg-dark-50/50 dark:bg-dark-900/50">
                                                <h3 className="font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                                    Notifications
                                                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-primary-600 hover:text-primary-700">Tout marquer lu</button>
                                                )}
                                            </div>
                                            <div className="max-h-[60vh] overflow-y-auto w-full custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-12 text-center text-dark-400">
                                                        <FiBell size={32} className="mx-auto mb-3 text-dark-200 dark:text-dark-700" />
                                                        <p className="text-sm">Aucune notification.</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
                                                        {notifications.map(n => (
                                                            <div
                                                                key={n.id}
                                                                className={`p-4 transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                                                onClick={() => {
                                                                    if (!n.isRead) handleMarkAsRead(n.id);
                                                                    if (n.type === 'Mission') {
                                                                        router.push('/dashboard/missions');
                                                                        setIsNotificationsOpen(false);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-transparent'}`} />
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <p className={`text-sm ${!n.isRead ? 'font-bold text-dark-950 dark:text-white' : 'font-medium text-dark-700 dark:text-dark-300'}`}>{n.title}</p>
                                                                        </div>
                                                                        <p className="text-xs text-dark-500 line-clamp-2 mt-0.5 leading-relaxed">{n.body}</p>
                                                                        <p className="text-[10px] text-dark-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-6 border-l border-dark-100 dark:border-dark-800">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-black text-dark-950 dark:text-white leading-none mb-1">{user?.fullName}</p>
                                    <p className="text-[10px] font-black text-accent-500 uppercase tracking-widest">{user?.roles?.[0]}</p>
                                </div>
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary-500/20 flex-shrink-0 border-2 border-white/20">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-50 dark:bg-dark-950 relative custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
