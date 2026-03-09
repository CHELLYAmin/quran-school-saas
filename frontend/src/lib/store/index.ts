import { create } from 'zustand';
import { AuthResponse, UserRole } from '@/types';
import { parseJwt } from '@/lib/jwt';

interface AuthState {
    user: AuthResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: AuthResponse) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    init: () => {
        if (typeof window === 'undefined') return;
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userStr && token) {
            const userObj = JSON.parse(userStr);
            const decoded = parseJwt(token);
            if (decoded?.Permission) {
                userObj.permissions = Array.isArray(decoded.Permission) ? decoded.Permission : [decoded.Permission];
            }
            set({ user: userObj, isAuthenticated: true, isLoading: false });
        } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: (user: AuthResponse) => {
        const decoded = parseJwt(user.token);
        if (decoded?.Permission) {
            user.permissions = Array.isArray(decoded.Permission) ? decoded.Permission : [decoded.Permission];
        }
        localStorage.setItem('token', user.token);
        localStorage.setItem('refreshToken', user.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// === UI Store ===
interface UIState {
    sidebarOpen: boolean;
    darkMode: boolean;
    locale: 'fr' | 'ar' | 'en';
    viewPreferences: {
        students: 'table' | 'cards';
        teachers: 'list' | 'grid';
        groups: 'list' | 'grid';
        users: 'table' | 'cards';
    };
    init: () => void;
    toggleSidebar: () => void;
    toggleDarkMode: () => void;
    setLocale: (locale: 'fr' | 'ar' | 'en') => void;
    setViewPreference: (page: 'students' | 'teachers' | 'groups' | 'users', mode: 'list' | 'grid' | 'table' | 'cards') => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    darkMode: false,
    locale: 'fr',
    viewPreferences: {
        students: 'table',
        teachers: 'list',
        groups: 'grid',
        users: 'table',
    },

    init: () => {
        if (typeof window === 'undefined') return;

        const darkMode = localStorage.getItem('darkMode') === 'true';
        const locale = (localStorage.getItem('locale') as 'fr' | 'ar' | 'en') || 'fr';

        let viewPreferences = { students: 'table', teachers: 'list', groups: 'grid', users: 'table' } as UIState['viewPreferences'];
        try {
            const savedPrefs = localStorage.getItem('viewPreferences');
            if (savedPrefs) {
                viewPreferences = { ...viewPreferences, ...JSON.parse(savedPrefs) };
            }
        } catch (e) {
            console.error('Failed to parse view preferences', e);
        }

        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;

        set({ darkMode, locale, viewPreferences });
    },

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    toggleDarkMode: () =>
        set((state) => {
            const newMode = !state.darkMode;
            localStorage.setItem('darkMode', String(newMode));
            document.documentElement.classList.toggle('dark', newMode);
            return { darkMode: newMode };
        }),

    setLocale: (locale) => {
        localStorage.setItem('locale', locale);
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
        set({ locale });
    },

    setViewPreference: (page, mode) =>
        set((state) => {
            const newPrefs = { ...state.viewPreferences, [page]: mode };
            localStorage.setItem('viewPreferences', JSON.stringify(newPrefs));
            return { viewPreferences: newPrefs };
        }),
}));
