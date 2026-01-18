import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mint-50">
                <div className="text-navy-900">Carregando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
