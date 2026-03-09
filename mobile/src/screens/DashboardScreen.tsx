import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    Dimensions,
    Image
} from 'react-native';
import { useAuthStore } from '../store';
import { dashboardApi, cmsApi, studentApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);
    const [studentStats, setStudentStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Dashboard Stats (Global/Admin)
            const { data: dashboardData } = await dashboardApi.getAdmin();
            const baseStats = [
                { label: 'Élèves', value: dashboardData.totalStudents.toString(), color: COLORS.primaryLight, icon: '👥' },
                { label: 'Groupes', value: dashboardData.totalGroups.toString(), color: COLORS.info, icon: '📚' },
                { label: 'Sessions', value: dashboardData.recentSessionsCount.toString(), color: COLORS.warning, icon: '📅' },
                { label: 'Profs', value: dashboardData.totalTeachers.toString(), color: COLORS.secondary, icon: '👨‍🏫' },
            ];
            setStats(baseStats);

            // 2. Fetch CMS News (Hub de Vie)
            const { data: cmsData } = await cmsApi.getPublishedPages();
            setNews(cmsData.slice(0, 5)); // Get last 5

            // 3. If Student, fetch specific stats
            if (user?.role === 'Student' && user.userId) {
                const { data: sStats } = await studentApi.getStats(user.userId);
                setStudentStats(sStats);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderNewsCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.newsCard}
            onPress={() => navigation.navigate('CmsPage', { slug: item.slug })}
        >
            <View style={styles.newsHeader}>
                <Text style={styles.newsCategory}>ANNOUNCEMENT</Text>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
            </View>
            <View style={styles.newsFooter}>
                <Text style={styles.newsDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.readMore}>Lire la suite →</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && stats.length === 0) {
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
                    tintColor={COLORS.primary}
                />
            }
        >
            {/* Premium Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerGreeting}>Salam, {user?.fullName?.split(' ')[0] || 'Utilisateur'} 👋</Text>
                    <Text style={styles.headerSub}>Bienvenue dans votre espace Coran</Text>
                </View>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                </View>
            </View>

            {/* Hub de Vie (Announcements) */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hub de Vie</Text>
                <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
            </View>
            <FlatList
                data={news}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={renderNewsCard}
                contentContainerStyle={styles.newsList}
                snapToInterval={CARD_WIDTH + SPACING.md}
                decelerationRate="fast"
            />

            {/* Gamification / Student Stats (Conditional) */}
            {user?.role === 'Student' && studentStats && (
                <View style={styles.gamificationContainer}>
                    <View style={styles.gamificationCard}>
                        <View style={styles.gamiRow}>
                            <View style={styles.gamiItem}>
                                <Text style={styles.gamiEmoji}>🔥</Text>
                                <Text style={styles.gamiVal}>{studentStats.currentStreak} Jours</Text>
                                <Text style={styles.gamiLabel}>Série</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.gamiItem}>
                                <Text style={styles.gamiEmoji}>✨</Text>
                                <Text style={styles.gamiVal}>{studentStats.totalXP} XP</Text>
                                <Text style={styles.gamiLabel}>Points</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.gamiItem}>
                                <Text style={styles.gamiEmoji}>🏆</Text>
                                <Text style={styles.gamiVal}>{studentStats.badges?.length || 0}</Text>
                                <Text style={styles.gamiLabel}>Badges</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Overview Stats */}
            <Text style={[styles.sectionTitle, { marginLeft: SPACING.lg, marginTop: SPACING.md }]}>Aperçu de l'école</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <View key={i} style={styles.statCard}>
                        <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { marginLeft: SPACING.lg, marginTop: SPACING.lg }]}>Actions Rapides</Text>
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconCircle}><Text style={styles.actionIconText}>📊</Text></View>
                    <Text style={styles.actionLabel}>Rapport</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconCircle}><Text style={styles.actionIconText}>💖</Text></View>
                    <Text style={styles.actionLabel}>Donation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconCircle}><Text style={styles.actionIconText}>📖</Text></View>
                    <Text style={styles.actionLabel}>Mushaf</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={styles.actionIconCircle}><Text style={styles.actionIconText}>⚙️</Text></View>
                    <Text style={styles.actionLabel}>Réglages</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.subtle
    },
    headerGreeting: { ...TYPOGRAPHY.h2, color: COLORS.primary },
    headerSub: { ...TYPOGRAPHY.caption, marginTop: 2 },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 20 },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md
    },
    sectionTitle: { ...TYPOGRAPHY.h3 },
    seeAll: { ...TYPOGRAPHY.small, color: COLORS.primaryLight },

    newsList: { paddingLeft: SPACING.lg, paddingRight: SPACING.md },
    newsCard: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginRight: SPACING.md,
        justifyContent: 'space-between',
        height: 160,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    newsHeader: {},
    newsCategory: { ...TYPOGRAPHY.small, color: COLORS.secondary, letterSpacing: 1 },
    newsTitle: { ...TYPOGRAPHY.h3, marginTop: 8, lineHeight: 22 },
    newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    newsDate: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
    readMore: { ...TYPOGRAPHY.small, color: COLORS.primaryLight },

    gamificationContainer: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
    gamificationCard: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.medium
    },
    gamiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    gamiItem: { alignItems: 'center', flex: 1 },
    gamiEmoji: { fontSize: 24, marginBottom: 4 },
    gamiVal: { color: COLORS.surface, fontSize: 18, fontWeight: 'bold' },
    gamiLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
    verticalDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.md, marginTop: SPACING.sm },
    statCard: {
        width: '44%',
        margin: '3%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    statIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statIcon: { fontSize: 20 },
    statValue: { ...TYPOGRAPHY.h2, color: COLORS.text },
    statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4 },

    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginTop: SPACING.md },
    actionItem: { alignItems: 'center', flex: 1 },
    actionIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    actionIconText: { fontSize: 24 },
    actionLabel: { ...TYPOGRAPHY.small, color: COLORS.text, marginTop: 10 }
});
