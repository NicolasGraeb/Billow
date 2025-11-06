import BackgroundGradient from "@/components/BackgroundGradient";
import { API_ENDPOINTS } from "@/urls/api";
import UserRegister from "@/types/UserRegister";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState<UserRegister>({confirmPassword: "", username: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const hasUppercase = useMemo(() => /[A-Z]/.test(form.password), [form.password]);
    const hasSpecial = useMemo(() => /[^A-Za-z0-9]/.test(form.password), [form.password]);
    const hasMinLength = useMemo(() => form.password.length >= 6, [form.password]);
    const isPasswordValid = hasUppercase && hasSpecial && hasMinLength;

    const handleChange = (key: keyof UserRegister, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        if (!form.username || !form.email || !form.password) {
            Alert.alert("Błąd", "Wypełnij wszystkie pola");
            return;
        }
        if (!isPasswordValid) {
            Alert.alert("Błąd", "Hasło musi mieć min. 6 znaków, 1 wielką literę i 1 znak specjalny");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || `Błąd rejestracji: ${res.status}`);
            }
            await res.json().catch(() => ({}));
            Alert.alert("Sukces", "Konto zostało utworzone", [{ text: "OK", onPress: () => router.push("/login") }]);
        } catch (e: any) {
            Alert.alert("Błąd rejestracji", e.message || "Wystąpił błąd");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={styles.title}>Rejestracja</Text>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={form.username}
                                onChangeText={(v) => handleChange("username", v)}
                                placeholder="Nazwa użytkownika"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={form.email}
                                onChangeText={(v) => handleChange("email", v)}
                                placeholder="Email"
                                placeholderTextColor="#6B7280"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={form.password}
                                onChangeText={(v) => handleChange("password", v)}
                                placeholder="Hasło"
                                placeholderTextColor="#6B7280"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(s => !s)}>
                                <Text style={styles.showPasswordText}>{showPassword ? "Ukryj" : "Pokaż"}</Text>
                            </TouchableOpacity>
                            <View style={styles.passwordHints}>
                                <Text style={[styles.hintRow, hasUppercase ? styles.hintOk : styles.hintBad]}>
                                    {hasUppercase ? "✓" : "•"} Zawiera wielką literę
                                </Text>
                                <Text style={[styles.hintRow, hasSpecial ? styles.hintOk : styles.hintBad]}>
                                    {hasSpecial ? "✓" : "•"} Zawiera znak specjalny
                                </Text>
                                <Text style={[styles.hintRow, hasMinLength ? styles.hintOk : styles.hintBad]}>
                                    {hasMinLength ? "✓" : "•"} Min. 6 znaków
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.button, (loading || !isPasswordValid) && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading || !isPasswordValid}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Zarejestruj się</Text>}
                        </TouchableOpacity>
                        <View style={styles.linkButton}>
                            <TouchableOpacity onPress={() => router.push("/login")}>
                                <Text style={styles.linkText}>Mam już konto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#080B12" },
    safeArea: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: "center" },
    title: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF", marginBottom: 32, textAlign: "center" },
    form: { width: "100%" },
    inputContainer: { marginBottom: 16, position: "relative" },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#FFFFFF",
        paddingRight: 80,
    },
    showPasswordButton: { position: "absolute", right: 16, top: 16 },
    showPasswordText: { color: "#0080FF", fontSize: 14, fontWeight: "600" },
    passwordHints: { marginTop: 8, gap: 4 },
    hintRow: { fontSize: 12, fontWeight: "600" },
    hintOk: { color: "#22C55E" },
    hintBad: { color: "#F59E0B" },
    button: { backgroundColor: "#0080FF", borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 52 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
    linkButton: { marginTop: 24, alignItems: "center" },
    linkText: { color: "#0080FF", fontSize: 14, fontWeight: "600" },
});
