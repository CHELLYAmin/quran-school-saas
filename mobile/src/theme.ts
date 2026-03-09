/**
 * Premium Mobile Design System
 * Royal Islamic Aesthetic for Quran School SaaS
 */

export const COLORS = {
    // Primary Brand
    primary: '#16423C',      // Deep Royal Green
    primaryLight: '#2F9268', // Active Green
    secondary: '#C7A351',    // Elegant Gold
    accent: '#F8F4E1',       // Soft Ivory / Cream

    // Neutrals
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',         // Slate 900
    textSecondary: '#6B7280', // Gray 500
    textMuted: '#9CA3AF',    // Gray 400
    border: '#E5E7EB',       // Gray 200

    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Specials
    glass: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.05)',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const SHADOWS = {
    subtle: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
    },
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const TYPOGRAPHY = {
    h1: { fontSize: 28, fontWeight: 'bold' as const, color: COLORS.text },
    h2: { fontSize: 22, fontWeight: 'bold' as const, color: COLORS.text },
    h3: { fontSize: 18, fontWeight: '600' as const, color: COLORS.text },
    body: { fontSize: 15, fontWeight: 'normal' as const, color: COLORS.text },
    caption: { fontSize: 13, fontWeight: '500' as const, color: COLORS.textSecondary },
    small: { fontSize: 11, fontWeight: '600' as const, color: COLORS.textMuted },
};
