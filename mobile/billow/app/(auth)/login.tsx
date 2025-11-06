import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/context/AuthContext";
import UserLogin from "@/types/UserLogin";
import { API_ENDPOINTS } from "@/urls/api";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [userlogin, setUserLogin] = useState<UserLogin>({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (key: keyof UserLogin, value: string) => {
        setUserLogin((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogin = async () => {
        if (!userlogin.username || !userlogin.password) {
            Alert.alert("Błąd", "Wypełnij wszystkie pola");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: userlogin.username, password: userlogin.password }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({} as any));
                throw new Error((errorData as any).detail || `Błąd logowania: ${response.status}`);
            }
            const tokenData = await response.json();
            await login(tokenData.access_token, tokenData.refresh_token);
            router.replace("/(tabs)");
        } catch (err: any) {
            Alert.alert("Błąd logowania", err.message || "Wystąpił błąd podczas logowania");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={styles.title}>Zaloguj się</Text>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => handleChange("username", value)}
                                value={userlogin.username}
                                placeholder="Nazwa użytkownika"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => handleChange("password", value)}
                                value={userlogin.password}
                                placeholder="Hasło"
                                placeholderTextColor="#6B7280"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                                <Text style={styles.showPasswordText}>{showPassword ? "Ukryj" : "Pokaż"}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Zaloguj się</Text>}
                        </TouchableOpacity>
                        <View style={styles.linkButton}>
                            <TouchableOpacity onPress={() => router.push("/register")}>
                                <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
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
    button: { backgroundColor: "#0080FF", borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 52 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
    linkButton: { marginTop: 24, alignItems: "center" },
    linkText: { color: "#0080FF", fontSize: 14, fontWeight: "600" },
});
