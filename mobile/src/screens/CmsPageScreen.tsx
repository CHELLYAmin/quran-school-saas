import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { cmsApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

export default function CmsPageScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { slug } = route.params;
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPage = async () => {
        setLoading(true);
        try {
            const { data } = await cmsApi.getPageBySlug(slug);
            setPage(data);
        } catch (err) {
            console.error('Error fetching CMS page:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!page) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>Page introuvable.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Retourner à l'accueil</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Page Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerSubtitle}>ANNONCE DU JOUR</Text>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.date}>{new Date(page.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            </View>

            {/* Content Area */}
            <View style={styles.contentCard}>
                <Text style={styles.contentText}>{page.content}</Text>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOWS.medium
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    closeIcon: { color: COLORS.surface, fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { ...TYPOGRAPHY.small, color: COLORS.secondary, letterSpacing: 2, marginBottom: 8 },
    title: { ...TYPOGRAPHY.h1, color: COLORS.surface, fontSize: 26, lineHeight: 32 },
    date: { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.6)', marginTop: 12 },

    contentCard: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        marginTop: -30,
        borderRadius: BORDER_RADIUS.lg,
        padding: 24,
        ...SHADOWS.subtle
    },
    contentText: { ...TYPOGRAPHY.body, color: COLORS.text, lineHeight: 26, fontSize: 16 },

    errorText: { ...TYPOGRAPHY.body, color: COLORS.error, marginBottom: 20 },
    backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BORDER_RADIUS.md },
    backBtnText: { color: COLORS.surface, fontWeight: 'bold' }
});
