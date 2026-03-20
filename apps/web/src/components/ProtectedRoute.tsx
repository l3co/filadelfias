import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../lib/routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mint-50">
                <div className="text-navy-900">Carregando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
    }

    return <>{children}</>;
}
