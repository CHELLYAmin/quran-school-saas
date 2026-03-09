import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion',
                style: 'destructive',
                onPress: () => logout()
            },
        ]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Premium Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.name}>{user?.fullName || 'Utilisateur'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
                <View style={[styles.roleBadge, { backgroundColor: COLORS.accent }]}>
                    <Text style={styles.roleText}>{user?.role || 'Admin'}</Text>
                </View>
            </View>

            {/* Premium Menu */}
            <View style={styles.menuCard}>
                {[
                    { icon: '🏫', label: 'Mon école', sub: 'Informations de l\'école' },
                    { icon: '🌙', label: 'Mode sombre', sub: 'Automatique' },
                    { icon: '🌐', label: 'Langue', sub: 'Français' },
                    { icon: '🔔', label: 'Notifications', sub: 'Gérer les alertes' },
                    { icon: '🔒', label: 'Sécurité', sub: 'Mot de passe, 2FA' },
                    { icon: 'ℹ️', label: 'À propos', sub: 'Version 2.0.0 Premium' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.menuItem, i === 5 && { borderBottomWidth: 0 }]}>
                        <View style={styles.menuIconBg}>
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                        </View>
                        <View style={styles.menuInfo}>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Text style={styles.menuSub}>{item.sub}</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Section */}
            <View style={{ paddingHorizontal: SPACING.lg }}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 32,
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.subtle
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: COLORS.accent
    },
    avatarText: { color: COLORS.surface, fontSize: 36, fontWeight: 'bold' },
    name: { ...TYPOGRAPHY.h2, color: COLORS.text },
    email: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4 },
    roleBadge: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full
    },
    roleText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },

    menuCard: {
        backgroundColor: COLORS.surface,
        margin: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...SHADOWS.subtle
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    menuIcon: { fontSize: 20 },
    menuInfo: { flex: 1 },
    menuLabel: { ...TYPOGRAPHY.body, fontWeight: '600' },
    menuSub: { ...TYPOGRAPHY.caption, fontSize: 12, marginTop: 2 },
    menuArrow: { fontSize: 24, color: COLORS.textMuted },

    logoutButton: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        ...SHADOWS.subtle
    },
    logoutText: { color: COLORS.error, fontSize: 16, fontWeight: 'bold' },
});
