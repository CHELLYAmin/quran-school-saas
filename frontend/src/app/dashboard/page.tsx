'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';

export default function DashboardDispatcher() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const roles = user?.roles || [];

        if (roles.includes(UserRole.SuperAdmin) || roles.includes(UserRole.Admin)) {
            router.push('/dashboard/admin');
        } else if (roles.includes(UserRole.Teacher)) {
            router.push('/dashboard/teacher');
        } else if (roles.includes(UserRole.Parent)) {
            router.push('/dashboard/parent');
        } else if (roles.includes(UserRole.Student)) {
            router.push('/dashboard/student');
        } else {
            router.push('/dashboard/admin');
        }
    }, [user, isAuthenticated, router]);

    return <PageSkeleton variant="dashboard" />;
}
