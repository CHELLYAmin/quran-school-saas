import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { authApi } from '../api/client';
import { useAuthStore } from '../store';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('admin@alnoor-quran.fr');
    const [password, setPassword] = useState('Admin@123');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { data } = await authApi.login(email, password);
            await login(data);
        } catch (err: any) {
            Alert.alert('Erreur', err.response?.data?.message || 'Connexion échouée');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>📖</Text>
                </View>
                <Text style={styles.title}>Quran School</Text>
                <Text style={styles.subtitle}>Gestion d'excellence & spiritualité</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Connexion</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="votre@email.com"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.surface} />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter ➔</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.hint}>Démo: admin@alnoor-quran.fr / Admin@123</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', padding: SPACING.lg },
    header: { alignItems: 'center', marginBottom: 40 },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    logoEmoji: { fontSize: 40 },
    title: { ...TYPOGRAPHY.h1, color: COLORS.surface, fontSize: 32 },
    subtitle: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: 28,
        ...SHADOWS.medium
    },
    cardTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: 24 },
    inputGroup: { marginBottom: 20 },
    label: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        padding: 16,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    button: {
        backgroundColor: COLORS.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.subtle
    },
    buttonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
    hint: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 24 },
});
