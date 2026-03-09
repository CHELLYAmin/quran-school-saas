import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { studentApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

export default function StudentsScreen() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await studentApi.getAll();
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStudents();
    }, []);

    const filtered = students.filter(s =>
        (s.fullName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading && students.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un élève..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchStudents}
                        colors={[COLORS.primary]}
                    />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{(item.fullName || '?').charAt(0)}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.fullName}</Text>
                            <Text style={styles.group}>{item.groupName || 'Sans groupe'}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: item.isActive ? '#D1FAE5' : '#FEE2E2' }]}>
                            <View style={[styles.dot, { backgroundColor: item.isActive ? COLORS.success : COLORS.error }]} />
                            <Text style={[styles.badgeText, { color: item.isActive ? COLORS.success : COLORS.error }]}>
                                {item.isActive ? 'Actif' : 'Inactif'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border
    },
    searchInput: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        padding: 14,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.sm,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarText: { color: COLORS.surface, fontSize: 18, fontWeight: 'bold' },
    info: { flex: 1, marginLeft: 12 },
    name: { ...TYPOGRAPHY.h3, fontSize: 16 },
    group: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    badgeText: { ...TYPOGRAPHY.small, fontSize: 10, fontWeight: 'bold' },
});
