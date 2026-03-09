'use client';

import { useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';

export default function StoreInitializer() {
    useEffect(() => {
        useAuthStore.getState().init();
        useUIStore.getState().init();
    }, []);

    return null;
}
