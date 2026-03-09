'use client';

/**
 * PageSkeleton - Reusable skeleton loading component for all dashboard pages.
 * Provides a polished shimmer animation while content is loading.
 * 
 * Usage:
 *   <PageSkeleton variant="table" />      // For list/table pages (students, teachers, sessions, etc.)
 *   <PageSkeleton variant="cards" />       // For card grid pages (groups, levels, etc.)
 *   <PageSkeleton variant="detail" />      // For detail/profile pages ([id])
 *   <PageSkeleton variant="form" />        // For forms (create, edit)
 *   <PageSkeleton variant="dashboard" />   // For main dashboard with stats + charts
 *   <PageSkeleton variant="calendar" />    // For schedule/calendar pages
 */

const Bone = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`bg-dark-100 dark:bg-dark-800 rounded-xl animate-pulse ${className}`} style={style} />
);

// ─── TABLE / LIST SKELETON ─────────────────────────
function TableSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with title + action */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bone className="h-8 w-56" />
                    <Bone className="h-4 w-80" />
                </div>
                <Bone className="h-11 w-40 !rounded-full" />
            </div>

            {/* Search + Filters */}
            <div className="flex items-center gap-4">
                <Bone className="h-11 w-80 flex-1 max-w-md" />
                <Bone className="h-11 w-32 !rounded-full" />
                <Bone className="h-11 w-32 !rounded-full" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-dark-100 dark:border-dark-800">
                        <Bone className="h-4 w-20 mb-3" />
                        <Bone className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                {/* Table header */}
                <div className="flex items-center gap-4 p-4 border-b border-dark-100 dark:border-dark-800">
                    {[120, 160, 100, 80, 60].map((w, i) => (
                        <Bone key={i} className="h-4" style={{ width: w }} />
                    ))}
                </div>
                {/* Table rows */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-dark-50 dark:border-dark-800/50" style={{ opacity: 1 - i * 0.08 }}>
                        <Bone className="size-10 !rounded-full flex-shrink-0" />
                        <Bone className="h-4 w-36" />
                        <Bone className="h-4 w-28" />
                        <Bone className="h-6 w-20 !rounded-full" />
                        <Bone className="h-4 w-16 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── CARD GRID SKELETON ────────────────────────────
function CardsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bone className="h-8 w-48" />
                    <Bone className="h-4 w-72" />
                </div>
                <Bone className="h-11 w-40 !rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 space-y-4" style={{ opacity: 1 - i * 0.1 }}>
                        <div className="flex items-center gap-3">
                            <Bone className="size-12 !rounded-2xl flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Bone className="h-5 w-32" />
                                <Bone className="h-3 w-20" />
                            </div>
                        </div>
                        <Bone className="h-3 w-full" />
                        <Bone className="h-3 w-3/4" />
                        <div className="flex items-center justify-between pt-4 border-t border-dark-50 dark:border-dark-800">
                            <Bone className="h-6 w-20 !rounded-full" />
                            <Bone className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── DETAIL / PROFILE SKELETON ─────────────────────
function DetailSkeleton() {
    return (
        <div className="space-y-8">
            {/* Back Button */}
            <Bone className="h-4 w-24" />

            {/* Profile Header */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 border border-dark-100 dark:border-dark-800 flex items-start gap-6">
                <Bone className="size-24 !rounded-3xl flex-shrink-0" />
                <div className="space-y-3 flex-1">
                    <Bone className="h-8 w-56" />
                    <Bone className="h-4 w-40" />
                    <div className="flex gap-3 mt-4">
                        <Bone className="h-7 w-24 !rounded-full" />
                        <Bone className="h-7 w-28 !rounded-full" />
                        <Bone className="h-7 w-20 !rounded-full" />
                    </div>
                </div>
                <Bone className="h-11 w-28 !rounded-full" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-dark-100 dark:border-dark-800">
                        <Bone className="h-3 w-16 mb-3" />
                        <Bone className="h-7 w-12" />
                    </div>
                ))}
            </div>

            {/* Tabs + Content */}
            <div className="flex gap-4 border-b border-dark-100 dark:border-dark-800 pb-3">
                {[80, 100, 72].map((w, i) => (
                    <Bone key={i} className="h-8 !rounded-full" style={{ width: w }} />
                ))}
            </div>
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3" style={{ opacity: 1 - i * 0.12 }}>
                        <Bone className="size-8 !rounded-lg flex-shrink-0" />
                        <Bone className="h-4 w-48" />
                        <Bone className="h-4 w-32 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── FORM SKELETON ─────────────────────────────────
function FormSkeleton() {
    return (
        <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
                <Bone className="h-8 w-48" />
                <Bone className="h-4 w-80" />
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 border border-dark-100 dark:border-dark-800 space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Bone className="h-4 w-24" />
                        <Bone className="h-12 w-full !rounded-xl" />
                    </div>
                ))}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Bone className="h-4 w-20" />
                        <Bone className="h-12 w-full !rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Bone className="h-4 w-28" />
                        <Bone className="h-12 w-full !rounded-xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Bone className="h-4 w-20" />
                    <Bone className="h-32 w-full !rounded-xl" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Bone className="h-11 w-28 !rounded-full" />
                    <Bone className="h-11 w-36 !rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ─── DASHBOARD SKELETON ────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="space-y-2">
                <Bone className="h-9 w-72" />
                <Bone className="h-4 w-96" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <Bone className="size-12 !rounded-2xl" />
                            <Bone className="h-4 w-12" />
                        </div>
                        <Bone className="h-8 w-20" />
                        <Bone className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Two columns */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 space-y-4">
                    <Bone className="h-6 w-40" />
                    <Bone className="h-48 w-full !rounded-2xl" />
                </div>
                {/* List */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 border border-dark-100 dark:border-dark-800 space-y-4">
                    <Bone className="h-6 w-40" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-2" style={{ opacity: 1 - i * 0.12 }}>
                            <Bone className="size-10 !rounded-full" />
                            <div className="space-y-1.5 flex-1">
                                <Bone className="h-4 w-32" />
                                <Bone className="h-3 w-20" />
                            </div>
                            <Bone className="h-6 w-14 !rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── CALENDAR SKELETON ─────────────────────────────
function CalendarSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Bone className="h-8 w-48" />
                    <Bone className="h-4 w-64" />
                </div>
                <div className="flex gap-3">
                    <Bone className="h-11 w-11 !rounded-xl" />
                    <Bone className="h-11 w-36 !rounded-full" />
                    <Bone className="h-11 w-11 !rounded-xl" />
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-dark-900 rounded-3xl border border-dark-100 dark:border-dark-800 p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                        <div key={i} className="text-center">
                            <Bone className="h-4 w-8 mx-auto" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {[...Array(35)].map((_, i) => (
                        <Bone key={i} className="h-20 w-full !rounded-xl" style={{ opacity: 0.3 + Math.random() * 0.4 }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── MAIN EXPORT ───────────────────────────────────
export type SkeletonVariant = 'table' | 'cards' | 'detail' | 'form' | 'dashboard' | 'calendar';

interface PageSkeletonProps {
    variant?: SkeletonVariant;
    rows?: number;
}

export default function PageSkeleton({ variant = 'table' }: PageSkeletonProps) {
    return (
        <div className="p-6 lg:p-8">
            {variant === 'table' && <TableSkeleton />}
            {variant === 'cards' && <CardsSkeleton />}
            {variant === 'detail' && <DetailSkeleton />}
            {variant === 'form' && <FormSkeleton />}
            {variant === 'dashboard' && <DashboardSkeleton />}
            {variant === 'calendar' && <CalendarSkeleton />}
        </div>
    );
}

// Export individual components for custom layouts
export { Bone, TableSkeleton, CardsSkeleton, DetailSkeleton, FormSkeleton, DashboardSkeleton, CalendarSkeleton };
