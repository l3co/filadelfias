import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Usa setTimeout para evitar conflitos de navegação
            const timeout = setTimeout(() => {
                router.replace('/(auth)/login');
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <LoadingScreen message="Verificando autenticação..." />;
    }

    if (!isAuthenticated) {
        // Mostra loading enquanto redireciona
        return <LoadingScreen message="Redirecionando..." />;
    }

    return <>{children}</>;
}
