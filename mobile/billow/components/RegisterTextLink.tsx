// components/RegisterTextLink.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

type Props = { to?: "register" | "login" };

export default function RegisterTextLink({ to = "register" }: Props) {
    const router = useRouter();
    const text = to === "register" ? "Nie masz konta? Zarejestruj się" : "Mam już konto";
    const href = to === "register" ? "/register" : "/login";
    return (
        <TouchableOpacity onPress={() => router.push(href)}>
            <Text style={styles.linkText}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    linkText: { color: "#0080FF", fontSize: 14, fontWeight: "600" },
});
