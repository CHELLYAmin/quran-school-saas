import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { sessionApi } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

type SessionStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';

const STATUS_CFG: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    InProgress: { label: 'En cours', color: COLORS.info, bg: '#DBEAFE' },
    Completed: { label: 'Terminée', color: COLORS.success, bg: '#D1FAE5' },
    Planned: { label: 'Planifiée', color: COLORS.textSecondary, bg: COLORS.background },
    Cancelled: { label: 'Annulée', color: COLORS.error, bg: '#FEE2E2' },
};

export default function SessionsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const { data } = await sessionApi.getAll();
            const sorted = data.sort((a: any, b: any) =>
                new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
            );
            setSessions(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSessionPress = (session: any) => {
        if (!session.groupName) return;
        navigation.navigate('LiveSession', { sessionId: session.id });
    };

    // Group sessions by Date
    const groupedSessions = sessions.reduce((acc, session: any) => {
        const dateStr = session.date.split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(session);
        return acc;
    }, {} as Record<string, any[]>);

    if (loading && sessions.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={fetchSessions}
                    colors={[COLORS.primary]}
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Séances</Text>
                <Text style={styles.headerSub}>Planification & Suivi en temps réel</Text>
            </View>

            {Object.keys(groupedSessions).length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucune séance planifiée.</Text>
                </View>
            ) : (
                Object.keys(groupedSessions).map(dateStr => (
                    <View key={dateStr} style={styles.dayGroup}>
                        <Text style={styles.dateLabel}>
                            {new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>

                        {groupedSessions[dateStr].map((session: any) => {
                            const cfg = STATUS_CFG[session.status as SessionStatus] || STATUS_CFG['Planned'];
                            return (
                                <TouchableOpacity
                                    key={session.id}
                                    style={styles.card}
                                    onPress={() => handleSessionPress(session)}
                                    disabled={!session.groupName}
                                >
                                    <View style={styles.cardTop}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.groupName}>{session.groupName || 'Non assigné'}</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                                                <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.objective} numberOfLines={1}>
                                            {session.sessionObjective || 'Sujet à définir'}
                                        </Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.timeWrapper}>
                                            <Text style={styles.timeIcon}>🕒</Text>
                                            <Text style={styles.timeText}>{session.startTime} - {session.endTime}</Text>
                                        </View>
                                        <Text style={[
                                            styles.actionLabel,
                                            session.status === 'InProgress' ? styles.actionActive : styles.actionPlanned
                                        ]}>
                                            {session.status === 'Completed' ? 'Revoir' : 'Gérer'} ➔
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))
            )}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
    headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.primary },
    headerSub: { ...TYPOGRAPHY.caption, marginTop: 4 },
    emptyState: { padding: 60, alignItems: 'center' },
    emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
    dayGroup: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    dateLabel: { ...TYPOGRAPHY.small, color: COLORS.primaryLight, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    cardTop: { marginBottom: SPACING.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    groupName: { ...TYPOGRAPHY.h3, color: COLORS.text },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
    statusText: { ...TYPOGRAPHY.small, fontSize: 10 },
    objective: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, fontSize: 13 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md
    },
    timeWrapper: { flexDirection: 'row', alignItems: 'center' },
    timeIcon: { marginRight: 6, fontSize: 14 },
    timeText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
    actionLabel: { ...TYPOGRAPHY.small, fontWeight: 'bold' },
    actionActive: { color: COLORS.primaryLight },
    actionPlanned: { color: COLORS.secondary },
});
