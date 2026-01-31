import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { initDatabase } from "@/lib/database";

export default function RootLayout() {
    const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Initialize database for offline support
        initDatabase();
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === "(auth)";
        const inPublicGroup = segments[0] === "(public)";
        const inMemberGroup = segments[0] === "(member)";
        const inAdminGroup = segments[0] === "(admin)";

        if (!isAuthenticated && (inMemberGroup || inAdminGroup)) {
            // Não autenticado tentando acessar área protegida
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            // Autenticado na tela de login - redirecionar baseado no role
            const role = user?.memberships?.[0]?.role;
            if (role === "ADMIN" || role === "OWNER") {
                router.replace("/(admin)");
            } else {
                router.replace("/(member)");
            }
        } else if (isAuthenticated && inPublicGroup && segments[1] === undefined) {
            // Autenticado na home pública - redirecionar para área de membros
            const role = user?.memberships?.[0]?.role;
            if (role === "ADMIN" || role === "OWNER") {
                router.replace("/(admin)");
            } else {
                router.replace("/(member)");
            }
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return (
            <SafeAreaProvider>
                <LoadingScreen message="Carregando..." />
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <Stack 
                    screenOptions={{ 
                        headerShown: false,
                        // Workaround para bug do Fabric no Android
                        // Desabilita o detach de telas inativas para evitar o erro addViewAt
                        freezeOnBlur: false,
                    }} 
                />
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
