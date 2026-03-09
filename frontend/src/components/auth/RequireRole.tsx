import React from 'react';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/types';

interface RequireRoleProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallback?: React.ReactNode;
}

export default function RequireRole({ children, allowedRoles, fallback = null }: RequireRoleProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    const hasRole = user.roles?.some(r => allowedRoles.includes(r as UserRole)) || user.roles?.includes(UserRole.SuperAdmin);

    if (!hasRole) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
