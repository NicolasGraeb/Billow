// app/_layout.tsx
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const TransparentDark = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" },
};

function RootLayoutNav() {
    const { accessToken, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        // @ts-ignore
        if (!segments || segments.length === 0) return;
        const inAuthGroup = segments[0] === "(auth)";
        const inTabsGroup = segments[0] === "(tabs)";
        const inEventGroup = segments[0] === "event";
        if (!accessToken && !inAuthGroup) {
            router.replace("/login");
            return;
        }
        if (accessToken && !inTabsGroup && !inEventGroup && !inAuthGroup) {
            router.replace("/");
            return;
        }
    }, [accessToken, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#080B12", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="event/[id]" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: "#080B12" }}>
            <LinearGradient colors={["#080B12", "#0B101A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["rgba(0,128,255,0.18)", "transparent"]} start={{ x: 0.06, y: 0 }} end={{ x: 0.6, y: 0.4 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["transparent", "rgba(0,128,255,0.12)"]} start={{ x: 0.4, y: 0.7 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <StatusBar style="light" />
            <ThemeProvider value={TransparentDark}>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </ThemeProvider>
        </View>
    );
}
