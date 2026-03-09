import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { examApi, mushafApi } from '../api/client';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

const ERROR_TYPES = [
    { label: 'Oubli (Hifdh)', value: 'Hifdh', icon: '❓' },
    { label: 'Tajwid', value: 'Tajwid', icon: '💎' },
    { label: 'Harakat', value: 'Harakat', icon: '✒️' },
    { label: 'Blocage', value: 'Stuck', icon: '🛑' },
];

export default function ExamSessionScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { examId } = route.params;

    const [exam, setExam] = useState<any>(null);
    const [surahs, setSurahs] = useState<any[]>([]);
    const [verses, setVerses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Annotation State
    const [showModal, setShowModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const [finalGrade, setFinalGrade] = useState('85');
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
    const [verseNumber, setVerseNumber] = useState('');
    const [selectedError, setSelectedError] = useState('Hifdh');
    const [comment, setComment] = useState('');

    const fetchVerses = async (surahId: number) => {
        try {
            const { data } = await mushafApi.getVerses(surahId);
            setVerses(data);
        } catch (err) {
            console.error('Error fetching verses:', err);
        }
    };

    useEffect(() => {
        if (selectedSurah) {
            fetchVerses(selectedSurah);
        }
    }, [selectedSurah]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examRes, surahRes] = await Promise.all([
                examApi.getById(examId),
                mushafApi.getSurahs()
            ]);
            setExam(examRes.data);
            setSurahs(surahRes.data);

            if (examRes.data.status === 'Started') {
                await examApi.markInProgress(examId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [examId]);

    const handleAddAnnotation = async () => {
        if (!selectedSurah || !verseNumber) {
            Alert.alert('Erreur', 'Veuillez remplir au moins la sourate et le verset.');
            return;
        }

        setIsSubmitting(true);
        try {
            await examApi.annotateVerse(examId, {
                surahId: selectedSurah,
                verseNumber: parseInt(verseNumber),
                errorType: selectedError,
                comment: comment
            });
            setShowModal(false);
            setVerseNumber('');
            setComment('');
            fetchData(); // Refresh to see new annotation
        } catch (err) {
            Alert.alert('Erreur', 'Impossible d\'ajouter l\'annotation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = () => setShowFinalModal(true);

    const submitComplete = async () => {
        setIsSubmitting(true);
        try {
            await examApi.complete(examId, parseInt(finalGrade));
            setShowFinalModal(false);
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de clôturer l\'examen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !exam) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.studentName}>{exam.studentName}</Text>
                    <Text style={styles.examMeta}>Niveau {exam.level} • {exam.status}</Text>
                </View>
                <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                    <Text style={styles.completeBtnText}>Clôturer</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Statistics Summary */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{exam.annotations?.length || 0}</Text>
                        <Text style={styles.statLabel}>Erreurs</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                            {surahs.find(s => s.id === (exam.surahId || 1))?.name || 'Global'}
                        </Text>
                        <Text style={styles.statLabel}>Cible</Text>
                    </View>
                </View>

                {/* Annotations List */}
                <Text style={styles.sectionTitle}>Journal d'Évaluation</Text>
                {exam.annotations && exam.annotations.length > 0 ? (
                    exam.annotations.map((ann: any, idx: number) => (
                        <View key={idx} style={styles.annCard}>
                            <View style={styles.annHeader}>
                                <Text style={styles.annType}>{(ERROR_TYPES.find(t => t.value === ann.errorType)?.icon || '📍')} {ann.errorType}</Text>
                                <Text style={styles.annVerse}>Vers. {ann.verseNumber}</Text>
                            </View>
                            {ann.comment && <Text style={styles.annComment}>{ann.comment}</Text>}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Aucune annotation pour le moment.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Float Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowModal(true)}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Annotation Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouvelle Annotation</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Sourate</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.surahPicker}>
                                {surahs.map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.surahChip, selectedSurah === s.id && styles.surahChipActive]}
                                        onPress={() => setSelectedSurah(s.id)}
                                    >
                                        <Text style={[styles.surahChipText, selectedSurah === s.id && styles.surahChipTextActive]}>{s.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.inputLabel}>Verset</Text>
                            {selectedSurah && verses.length > 0 ? (
                                <View style={styles.verseGrid}>
                                    {verses.map(v => (
                                        <TouchableOpacity
                                            key={v.id}
                                            style={[styles.verseChip, verseNumber === v.verseNumber.toString() && styles.surahChipActive]}
                                            onPress={() => setVerseNumber(v.verseNumber.toString())}
                                        >
                                            <Text style={[styles.verseChipText, verseNumber === v.verseNumber.toString() && styles.surahChipTextActive]}>{v.verseNumber}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sélectionnez d'abord une sourate"
                                    keyboardType="numeric"
                                    value={verseNumber}
                                    onChangeText={setVerseNumber}
                                    editable={!!selectedSurah}
                                />
                            )}

                            <Text style={styles.inputLabel}>Type d'erreur</Text>
                            <View style={styles.errorGrid}>
                                {ERROR_TYPES.map(err => (
                                    <TouchableOpacity
                                        key={err.value}
                                        style={[styles.errorBtn, selectedError === err.value && styles.errorBtnActive]}
                                        onPress={() => setSelectedError(err.value)}
                                    >
                                        <Text style={styles.errorIcon}>{err.icon}</Text>
                                        <Text style={[styles.errorLabel, selectedError === err.value && styles.errorLabelActive]}>{err.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Commentaire (optionnel)</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Note additionnelle..."
                                multiline
                                value={comment}
                                onChangeText={setComment}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleAddAnnotation}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.saveBtnText}>Ajouter l'Evaluation</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Finalization Modal */}
            <Modal visible={showFinalModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: 'auto', paddingBottom: 40 }]}>
                        <Text style={styles.modalTitle}>Clôturer l'Examen</Text>
                        <Text style={styles.inputLabel}>Note Finale (0-100)</Text>
                        <TextInput
                            style={[styles.input, { textAlign: 'center', fontSize: 24, fontWeight: 'bold' }]}
                            keyboardType="numeric"
                            value={finalGrade}
                            onChangeText={setFinalGrade}
                        />
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <TouchableOpacity
                                style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.background }]}
                                onPress={() => setShowFinalModal(false)}
                            >
                                <Text style={{ color: COLORS.textMuted, fontWeight: 'bold' }}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, { flex: 2 }]}
                                onPress={submitComplete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.saveBtnText}>Valider & Terminer</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingTop: 50, paddingBottom: 20,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surface,
        flexDirection: 'row', alignItems: 'center',
        ...SHADOWS.subtle
    },
    backBtn: { paddingRight: SPACING.md },
    backIcon: { fontSize: 24, color: COLORS.textMuted },
    headerInfo: { flex: 1 },
    studentName: { ...TYPOGRAPHY.h3, color: COLORS.text },
    examMeta: { ...TYPOGRAPHY.small, color: COLORS.secondary },
    completeBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm },
    completeBtnText: { color: COLORS.surface, fontSize: 12, fontWeight: 'bold' },

    content: { padding: SPACING.lg },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 16, borderRadius: BORDER_RADIUS.md, alignItems: 'center', ...SHADOWS.subtle },
    statValue: { ...TYPOGRAPHY.h2, color: COLORS.primary },
    statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

    sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: 16 },
    annCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: 16, marginBottom: 12, ...SHADOWS.subtle },
    annHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    annType: { ...TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.error },
    annVerse: { ...TYPOGRAPHY.small, color: COLORS.textSecondary },
    annComment: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontStyle: 'italic' },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },

    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center', alignItems: 'center',
        ...SHADOWS.medium
    },
    fabIcon: { fontSize: 32, color: COLORS.surface },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    modalTitle: { ...TYPOGRAPHY.h2 },
    modalClose: { fontSize: 24, color: COLORS.textMuted },
    modalBody: { flex: 1 },
    inputLabel: { ...TYPOGRAPHY.small, marginBottom: 8, marginTop: 16, color: COLORS.primary },
    surahPicker: { flexDirection: 'row', marginBottom: 8 },
    surahChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
    surahChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    surahChipText: { ...TYPOGRAPHY.small, color: COLORS.text },
    surahChipTextActive: { color: COLORS.surface },
    input: { backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, padding: 12, borderWidth: 1, borderColor: COLORS.border, ...TYPOGRAPHY.body },
    verseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    verseChip: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    verseChipText: { ...TYPOGRAPHY.small, color: COLORS.text },
    errorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    errorBtn: { width: '47%', padding: 12, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    errorBtnActive: { borderColor: COLORS.error, backgroundColor: '#FEE2E2' },
    errorIcon: { fontSize: 20, marginBottom: 4 },
    errorLabel: { fontSize: 12, color: COLORS.textSecondary },
    errorLabelActive: { color: COLORS.error, fontWeight: 'bold' },
    saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: 24 },
    saveBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 }
});
