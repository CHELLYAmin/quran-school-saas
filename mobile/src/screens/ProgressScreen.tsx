import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { progressApi } from '../api/client';
import { useAuthStore } from '../store';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    Memorized: { bg: '#D1FAE5', text: COLORS.success, label: 'Mémorisé' },
    InProgress: { bg: '#DBEAFE', text: COLORS.info, label: 'En cours' },
    Mastered: { bg: '#D1FAE5', text: COLORS.success, label: 'Maîtrisé' },
    NeedsRevision: { bg: '#FEF3C7', text: COLORS.warning, label: 'À réviser' },
    NotStarted: { bg: COLORS.background, text: COLORS.textMuted, label: 'Non commencé' },
};

export default function ProgressScreen() {
    const { user } = useAuthStore();
    const [progress, setProgress] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.userId) return;
        setLoading(true);
        try {
            const [progRes, sumRes] = await Promise.all([
                progressApi.getByStudent(user.userId),
                progressApi.getSummary(user.userId)
            ]);
            setProgress(progRes.data);
            setSummary(sumRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.userId]);

    if (loading && progress.length === 0) {
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
                    onRefresh={fetchData}
                    colors={[COLORS.primary]}
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ma Progression</Text>
                <Text style={styles.headerSub}>Suivi de mémorisation du Saint Coran</Text>
            </View>

            {/* Summary Row */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: COLORS.surface }]}>
                    <Text style={styles.summaryEmoji}>📖</Text>
                    <Text style={styles.summaryValue}>{summary?.memorizedSurahs || 0}</Text>
                    <Text style={styles.summaryLabel}>Mémorisés</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: COLORS.surface }]}>
                    <Text style={styles.summaryEmoji}>⭐</Text>
                    <Text style={styles.summaryValue}>{summary?.averageQualityScore || 0}/10</Text>
                    <Text style={styles.summaryLabel}>Score moyen</Text>
                </View>
            </View>

            {/* Progress list */}
            <View style={styles.listContainer}>
                {progress.map((item) => {
                    const s = statusStyles[item.status] || statusStyles.NotStarted;
                    return (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={styles.surahNumber}>
                                    <Text style={styles.surahNumberText}>{item.surahNumber}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.surahName}>{item.surahName}</Text>
                                    <Text style={styles.juzInfo}>Juz {item.juzNumber}</Text>
                                </View>
                            </View>
                            <View style={styles.cardRight}>
                                <View style={styles.scoreRow}>
                                    {[...Array(10)].map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.scoreDot,
                                                { backgroundColor: i < item.qualityScore ? COLORS.primaryLight : COLORS.border }
                                            ]}
                                        />
                                    ))}
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                                    <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.primary },
    headerSub: { ...TYPOGRAPHY.caption, marginTop: 4 },
    summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 12, marginBottom: SPACING.lg },
    summaryCard: {
        flex: 1,
        padding: 20,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    summaryEmoji: { fontSize: 24, marginBottom: 8 },
    summaryValue: { ...TYPOGRAPHY.h2, color: COLORS.text },
    summaryLabel: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, marginTop: 4 },

    listContainer: { paddingHorizontal: SPACING.lg },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.sm,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center' },
    surahNumber: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center'
    },
    surahNumberText: { ...TYPOGRAPHY.h3, color: COLORS.primary },
    cardInfo: { marginLeft: 12 },
    surahName: { ...TYPOGRAPHY.h3, fontSize: 16 },
    juzInfo: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
    cardRight: { alignItems: 'flex-end' },
    scoreRow: { flexDirection: 'row', gap: 2, marginBottom: 8 },
    scoreDot: { width: 4, height: 14, borderRadius: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
    statusText: { ...TYPOGRAPHY.small, fontSize: 10, fontWeight: 'bold' },
});
