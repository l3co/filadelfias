import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Redirect } from 'expo-router';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <LoadingScreen message="Verificando autenticação..." />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <>{children}</>;
}
