import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { examApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

export default function ExamsScreen() {
    const navigation = useNavigation<any>();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const { data } = await examApi.getAll();
            setExams(data.sort((a: any, b: any) =>
                new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
            ));
        } catch (err) {
            console.error('Error fetching exams:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const renderExamCard = ({ item }: { item: any }) => {
        const isCompleted = item.status === 'Completed';
        const isInProgress = item.status === 'InProgress' || item.status === 'Started';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ExamSession', { examId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.studentName}</Text>
                        <Text style={styles.examSub}>Niveau {item.level} • {item.surahName || 'Global'}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isCompleted ? '#D1FAE5' : isInProgress ? '#DBEAFE' : COLORS.background }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: isCompleted ? COLORS.success : isInProgress ? COLORS.info : COLORS.textMuted }
                        ]}>
                            {isCompleted ? 'Terminé' : isInProgress ? 'En cours' : 'Prévu'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                        {new Date(item.startedAt || item.createdAt).toLocaleDateString()}
                    </Text>
                    {isCompleted ? (
                        <Text style={styles.gradeText}>{item.finalGrade}/100</Text>
                    ) : (
                        <Text style={styles.actionText}>Continuer ➔</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Examens</Text>
                <Text style={styles.headerSub}>Évaluations et passages de niveaux</Text>

                <TouchableOpacity
                    style={styles.newExamBtn}
                    onPress={() => Alert.alert("Nouveau", "Veuillez sélectionner un élève depuis la liste pour démarrer un examen.")}
                >
                    <Text style={styles.newExamBtnText}>+ NOUVEL EXAMEN</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={exams}
                keyExtractor={item => item.id.toString()}
                renderItem={renderExamCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchExams}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun examen récent.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.primary },
    headerSub: { ...TYPOGRAPHY.caption, marginTop: 4 },
    newExamBtn: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: 20,
        ...SHADOWS.subtle
    },
    newExamBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },

    listContent: { padding: SPACING.lg, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    studentInfo: { flex: 1 },
    studentName: { ...TYPOGRAPHY.h3, color: COLORS.text },
    examSub: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
        paddingTop: 12
    },
    dateText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
    gradeText: { ...TYPOGRAPHY.h3, color: COLORS.success },
    actionText: { ...TYPOGRAPHY.small, color: COLORS.primaryLight, fontWeight: 'bold' },

    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted }
});
