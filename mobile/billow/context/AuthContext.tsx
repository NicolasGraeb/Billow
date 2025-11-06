import { API_ENDPOINTS } from "@/urls/api";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    refreshTokens: async () => false,
});

// Funkcja do dekodowania JWT tokena (bez weryfikacji podpisu, tylko dekodowanie base64)
const decodeJWT = (token: string): { sub?: string } | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        // Dekoduj payload (druga część tokena)
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

const timeoutFetch = async (url: string, options: RequestInit = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(id);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const extractUserId = (token: string): number | null => {
        const payload = decodeJWT(token);
        if (!payload || !payload.sub) {
            return null;
        }
        const userIdNum = parseInt(payload.sub, 10);
        return isNaN(userIdNum) ? null : userIdNum;
    };

    const login = async (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        
        const userIdFromToken = extractUserId(access);
        if (userIdFromToken) {
            setUserId(userIdFromToken);
            await SecureStore.setItemAsync("user_id", userIdFromToken.toString());
        }
        
        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", refresh);
    };

    const logout = async () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUserId(null);
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("user_id");
    };

    const refreshTokens = async (): Promise<boolean> => {
        const currentRefresh = refreshToken || (await SecureStore.getItemAsync("refresh_token"));
        if (!currentRefresh) return false;
        try {
            const response = await timeoutFetch(API_ENDPOINTS.AUTH.REFRESH, {
                method: "POST",
                headers: { Authorization: `Bearer ${currentRefresh}`, "Content-Type": "application/json" },
            });
            if (!response.ok) {
                await logout();
                return false;
            }
            const data = await response.json();
            if (data.access_token && data.refresh_token) {
                await login(data.access_token, data.refresh_token);
                return true;
            }
            await logout();
            return false;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedAccess = await SecureStore.getItemAsync("access_token");
                const storedRefresh = await SecureStore.getItemAsync("refresh_token");
                const storedUserId = await SecureStore.getItemAsync("user_id");
                
                if (storedAccess) {
                    setAccessToken(storedAccess);
                    // Wyciągnij userId z tokena, jeśli nie ma w SecureStore
                    const userIdFromToken = extractUserId(storedAccess);
                    if (userIdFromToken) {
                        setUserId(userIdFromToken);
                        if (!storedUserId) {
                            await SecureStore.setItemAsync("user_id", userIdFromToken.toString());
                        }
                    } else if (storedUserId) {
                        setUserId(parseInt(storedUserId, 10));
                    }
                } else if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10));
                }
                
                if (storedRefresh) setRefreshToken(storedRefresh);
            } finally {
                setLoading(false);
            }
            try {
                const refreshed = await refreshTokens();
                // userId jest już aktualizowany w funkcji login, która jest wywoływana w refreshTokens
            } catch {}
        };
        bootstrap();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                userId,
                loading,
                login,
                logout,
                refreshTokens,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
