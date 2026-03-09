import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLiveSessionStore } from '../store/useLiveSessionStore';
import { sessionApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

const { width } = Dimensions.get('window');

export default function LiveSessionCockpit() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const sessionId = route.params?.sessionId;

    const {
        cockpit,
        fetchCockpit,
        isLoading,
        error,
        updateAttendanceOptimistic,
        queueMode,
        setQueueMode
    } = useLiveSessionStore();

    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        if (sessionId) {
            fetchCockpit(sessionId);
        }
    }, [sessionId]);

    const handleMarkAttendance = async (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
        updateAttendanceOptimistic(studentId, status);
        try {
            const statusMap = { 'Present': 0, 'Absent': 1, 'Late': 2 };
            await sessionApi.markAttendance(sessionId, {
                studentId,
                status: statusMap[status]
            });
        } catch (err) {
            console.error(err);
            Alert.alert('Erreur', 'Impossible de sauvegarder la présence.');
        }
    };

    const handleCompleteSession = () => {
        Alert.alert(
            'Terminer la séance',
            'Êtes-vous sûr de vouloir clôturer cette séance ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    style: 'destructive',
                    onPress: async () => {
                        setIsCompleting(true);
                        try {
                            await sessionApi.complete(sessionId, "Séance complétée depuis l'application mobile.");
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Erreur', 'Impossible de clôturer la séance.');
                        } finally {
                            setIsCompleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || !cockpit) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                )}
            </View>
        );
    }

    const sortedQueue = [...cockpit.smartQueue].sort((a, b) => {
        const aIsAbsent = a.attendanceStatus === 'Absent';
        const bIsAbsent = b.attendanceStatus === 'Absent';
        if (aIsAbsent && !bIsAbsent) return 1;
        if (!aIsAbsent && bIsAbsent) return -1;

        if (queueMode === 'smart') {
            return b.priorityIndex - a.priorityIndex;
        }

        const aHasRecited = (a.recitationsInSessionCount > 0);
        const bHasRecited = (b.recitationsInSessionCount > 0);
        if (aHasRecited && !bHasRecited) return 1;
        if (!aHasRecited && bHasRecited) return -1;

        return (a.lastRecitedTimeInSession || 0) - (b.lastRecitedTimeInSession || 0);
    });

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.groupName} numberOfLines={1}>{cockpit.groupName}</Text>
                    <Text style={styles.sessionSub}>
                        {cockpit.smartQueue.length} élèves • {cockpit.smartQueue.filter(s => s.attendanceStatus === 'Present').length} présents
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={handleCompleteSession}
                    disabled={isCompleting}
                >
                    <Text style={styles.completeBtnText}>Clôturer</Text>
                </TouchableOpacity>
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeBar}>
                <TouchableOpacity
                    style={[styles.modeTab, queueMode === 'smart' && styles.modeTabActive]}
                    onPress={() => setQueueMode('smart')}
                >
                    <Text style={[styles.modeTabText, queueMode === 'smart' && styles.modeTabTextActive]}>Smart Queue ⚡</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeTab, queueMode === 'roundrobin' && styles.modeTabActive]}
                    onPress={() => setQueueMode('roundrobin')}
                >
                    <Text style={[styles.modeTabText, queueMode === 'roundrobin' && styles.modeTabTextActive]}>Classique 📋</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {sortedQueue.map((student) => {
                    const isAbsent = student.attendanceStatus === 'Absent';
                    const isLate = student.attendanceStatus === 'Late';

                    let priorityColor = COLORS.success;
                    if (student.priorityIndex > 40) priorityColor = COLORS.error;
                    else if (student.priorityIndex > 20) priorityColor = COLORS.warning;

                    return (
                        <View key={student.studentId} style={[styles.card, isAbsent && styles.cardAbsent]}>
                            {/* Card Header */}
                            <View style={styles.cardHeader}>
                                <View style={styles.studentInfo}>
                                    <Text style={[styles.studentName, isAbsent && styles.textAbsent]}>
                                        {student.firstName} {student.lastName}
                                    </Text>
                                    <Text style={styles.actionText}>{student.recommendedAction || 'Évaluation'}</Text>
                                </View>
                                {queueMode === 'smart' && !isAbsent && (
                                    <View style={[styles.prioBadge, { borderColor: priorityColor }]}>
                                        <Text style={[styles.prioText, { color: priorityColor }]}>P-{Math.round(student.priorityIndex)}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Indicators */}
                            {!isAbsent && (
                                <View style={styles.indicatorRow}>
                                    {student.suggestedSurahName && (
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>📖 {student.suggestedSurahName}</Text>
                                        </View>
                                    )}
                                    <View style={[styles.pill, { backgroundColor: COLORS.background }]}>
                                        <Text style={styles.pillText}>⚠️ {student.recentErrorsCount} erreurs réc.</Text>
                                    </View>
                                </View>
                            )}

                            {/* Attendance Controls */}
                            <View style={styles.attRow}>
                                <TouchableOpacity
                                    style={[styles.attBtn, student.attendanceStatus === 'Present' && styles.attBtnPresent]}
                                    onPress={() => handleMarkAttendance(student.studentId, 'Present')}
                                >
                                    <Text style={[styles.attText, student.attendanceStatus === 'Present' && styles.attTextActive]}>Présent</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.attBtn, isAbsent && styles.attBtnAbsent]}
                                    onPress={() => handleMarkAttendance(student.studentId, 'Absent')}
                                >
                                    <Text style={[styles.attText, isAbsent && styles.attTextActive]}>Absent</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.attBtn, isLate && styles.attBtnLate]}
                                    onPress={() => handleMarkAttendance(student.studentId, 'Late')}
                                >
                                    <Text style={[styles.attText, isLate && styles.attTextActive]}>Retard</Text>
                                </TouchableOpacity>
                            </View>

                            {/* EVALUATION CTA */}
                            {!isAbsent && (
                                <TouchableOpacity
                                    style={styles.evalBtn}
                                    onPress={() => Alert.alert("Évaluation Mushaf", "Le mode Mushaf interactif arrive bientôt.")}
                                >
                                    <Text style={styles.evalBtnText}>Démarrer l'Évaluation ➔</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    errorText: { ...TYPOGRAPHY.body, color: COLORS.error, textAlign: 'center' },
    header: {
        backgroundColor: COLORS.surface,
        paddingTop: 50,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.subtle
    },
    backBtn: { paddingRight: SPACING.md },
    backIcon: { fontSize: 24, color: COLORS.text },
    headerInfo: { flex: 1 },
    groupName: { ...TYPOGRAPHY.h3, color: COLORS.primary },
    sessionSub: { ...TYPOGRAPHY.small, color: COLORS.textSecondary },
    completeBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.sm
    },
    completeBtnText: { ...TYPOGRAPHY.small, color: COLORS.surface, fontWeight: 'bold' },

    modeBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        margin: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.md - 4 },
    modeTabActive: { backgroundColor: COLORS.accent },
    modeTabText: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
    modeTabTextActive: { color: COLORS.primary, fontWeight: 'bold' },

    list: { paddingHorizontal: SPACING.lg },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.subtle
    },
    cardAbsent: { opacity: 0.5, backgroundColor: COLORS.background },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    studentInfo: { flex: 1 },
    studentName: { ...TYPOGRAPHY.h3 },
    textAbsent: { textDecorationLine: 'line-through' },
    actionText: { ...TYPOGRAPHY.small, color: COLORS.secondary, marginTop: 2 },
    prioBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    prioText: { fontSize: 10, fontWeight: 'bold' },

    indicatorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
    pill: { backgroundColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
    pillText: { ...TYPOGRAPHY.small, fontSize: 10, color: COLORS.primary },

    attRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
    attBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.background },
    attText: { ...TYPOGRAPHY.small, color: COLORS.textSecondary },
    attBtnPresent: { backgroundColor: '#D1FAE5' },
    attBtnAbsent: { backgroundColor: '#FEE2E2' },
    attBtnLate: { backgroundColor: '#FEF3C7' },
    attTextActive: { color: COLORS.text, fontWeight: 'bold' },

    evalBtn: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        ...SHADOWS.subtle
    },
    evalBtnText: { ...TYPOGRAPHY.body, color: COLORS.surface, fontWeight: 'bold' }
});
