import React from 'react';
import { useAuthStore } from '@/lib/store';
import { usePermission } from '@/hooks/usePermission';
import { UserRole } from '@/types';

interface RequirePermissionProps {
    children: React.ReactNode;
    requiredPermission?: string;
    anyOf?: string[];
    allOf?: string[];
    fallback?: React.ReactNode;
}

export default function RequirePermission({
    children,
    requiredPermission,
    anyOf,
    allOf,
    fallback = null,
}: RequirePermissionProps) {
    const { user, isAuthenticated } = useAuthStore();
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    // SuperAdmin bypasses all permission checks in UI for convenience
    if (user.roles?.includes(UserRole.SuperAdmin)) {
        return <>{children}</>;
    }

    let isAuthorized = true;

    if (requiredPermission && !hasPermission(requiredPermission)) {
        isAuthorized = false;
    }

    if (anyOf && anyOf.length > 0 && !hasAnyPermission(anyOf)) {
        isAuthorized = false;
    }

    if (allOf && allOf.length > 0 && !hasAllPermissions(allOf)) {
        isAuthorized = false;
    }

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
