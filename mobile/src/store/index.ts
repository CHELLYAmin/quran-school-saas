import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    schoolId: string;
    token: string;
    refreshToken: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (user: User) => {
        await AsyncStorage.setItem('token', user.token);
        await AsyncStorage.setItem('refreshToken', user.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        set({ user: null, isAuthenticated: false });
    },

    loadUser: async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            if (userStr && token) {
                set({ user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
