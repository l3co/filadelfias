/**
 * Componente de rota protegida com verificação de permissões
 * Combina autenticação + autorização baseada em RBAC
 */

import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { AccessDenied } from './PermissionGate';
import type { Resource, Action } from '../lib/permissions';

interface ProtectedRouteWithPermissionProps {
  children: React.ReactNode;
  resource: Resource;
  action?: Action;
  redirectTo?: string;
}

/**
 * Protege uma rota verificando autenticação E permissão
 */
export function ProtectedRouteWithPermission({
  children,
  resource,
  action = 'view',
  redirectTo,
}: ProtectedRouteWithPermissionProps) {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { can, isLoading: isLoadingPermissions } = usePermissions();

  // Loading state
  if (isLoadingUser || isLoadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#DEEFE7]/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no permission
  if (!can(resource, action)) {
    // Se tem redirectTo, redireciona
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    // Senão mostra tela de acesso negado
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <AccessDenied resource={resource} />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * HOC para criar rotas protegidas por permissão
 */
export function createProtectedRoute(
  Component: React.ComponentType,
  resource: Resource,
  action: Action = 'view'
) {
  return function ProtectedComponent() {
    return (
      <ProtectedRouteWithPermission resource={resource} action={action}>
        <Component />
      </ProtectedRouteWithPermission>
    );
  };
}
