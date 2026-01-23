/* eslint-disable react-refresh/only-export-components */
/**
 * Componentes de controle de acesso baseado em permissões
 * 
 * Uso:
 * 
 * 1. PermissionGate - Renderiza children apenas se tiver permissão
 *    <PermissionGate resource="governance" action="view">
 *      <GovernanceContent />
 *    </PermissionGate>
 * 
 * 2. PermissionGate com fallback
 *    <PermissionGate 
 *      resource="financial" 
 *      action="manage"
 *      fallback={<AccessDenied />}
 *    >
 *      <FinancialAdmin />
 *    </PermissionGate>
 * 
 * 3. RequirePermission - HOC para componentes
 *    const ProtectedComponent = RequirePermission(MyComponent, 'governance', 'manage');
 */

import React from 'react';
import { usePermissions, useCanAccess } from '../hooks/usePermissions';
import type { Resource, Action } from '../lib/permissions';
import { Shield, Lock } from 'lucide-react';

// ============================================================================
// PERMISSION GATE COMPONENT
// ============================================================================

interface PermissionGateProps {
  children: React.ReactNode;
  resource: Resource;
  action?: Action;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * Renderiza children apenas se o usuário tiver a permissão necessária
 */
export function PermissionGate({
  children,
  resource,
  action = 'view',
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading && showLoading) {
    return <PermissionLoading />;
  }

  if (isLoading) {
    return null;
  }

  if (!can(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE ANY PERMISSION
// ============================================================================

interface RequireAnyPermissionProps {
  children: React.ReactNode;
  permissions: Array<{ resource: Resource; action: Action }>;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children se tiver QUALQUER UMA das permissões
 */
export function RequireAnyPermission({
  children,
  permissions,
  fallback = null,
}: RequireAnyPermissionProps) {
  const { canAny, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!canAny(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE ALL PERMISSIONS
// ============================================================================

interface RequireAllPermissionsProps {
  children: React.ReactNode;
  permissions: Array<{ resource: Resource; action: Action }>;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas se tiver TODAS as permissões
 */
export function RequireAllPermissions({
  children,
  permissions,
  fallback = null,
}: RequireAllPermissionsProps) {
  const { canAll, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!canAll(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE LEADERSHIP
// ============================================================================

interface RequireLeadershipProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas para Pastores e Presbíteros
 */
export function RequireLeadership({
  children,
  fallback = null,
}: RequireLeadershipProps) {
  const { isLeader, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!isLeader) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// REQUIRE OFFICER
// ============================================================================

interface RequireOfficerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas para oficiais ordenados (Pastor, Presbítero, Diácono)
 */
export function RequireOfficer({
  children,
  fallback = null,
}: RequireOfficerProps) {
  const { isOfficer, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!isOfficer) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// HOC - HIGHER ORDER COMPONENT
// ============================================================================

/**
 * HOC para proteger componentes com verificação de permissão
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: Resource,
  action: Action = 'view',
  FallbackComponent?: React.ComponentType
) {
  return function WithPermissionComponent(props: P) {
    const hasAccess = useCanAccess(resource, action);

    if (!hasAccess) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return <AccessDenied resource={resource} />;
    }

    return <WrappedComponent {...props} />;
  };
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function PermissionLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
    </div>
  );
}

interface AccessDeniedProps {
  resource?: Resource;
  title?: string;
  message?: string;
}

export function AccessDenied({ 
  resource, 
  title = 'Acesso Restrito',
  message,
}: AccessDeniedProps) {
  const resourceMessages: Record<Resource, string> = {
    members: 'Você não tem permissão para acessar o cadastro de membros.',
    governance: 'Apenas pastores e presbíteros podem acessar a área de governança.',
    financial: 'Você não tem permissão para acessar a tesouraria.',
    ebd: 'Você não tem permissão para gerenciar a Escola Bíblica.',
    missions: 'Você não tem permissão para acessar o módulo de missões.',
    events: 'Você não tem permissão para gerenciar eventos.',
    settings: 'Apenas administradores podem acessar as configurações.',
    reports: 'Você não tem permissão para visualizar relatórios.',
  };

  const displayMessage = message || (resource ? resourceMessages[resource] : 'Você não tem permissão para acessar este recurso.');

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 rounded-full bg-red-50 mb-4">
        <Lock className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{displayMessage}</p>
      <p className="text-xs text-gray-400 mt-4">
        Se você acredita que deveria ter acesso, entre em contato com o administrador da igreja.
      </p>
    </div>
  );
}

/**
 * Badge indicando nível de acesso
 */
export function PermissionBadge() {
  const { office, systemRole, isLeader } = usePermissions();

  if (!office && systemRole === 'ATTENDEE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Shield className="h-3 w-3" />
        Visitante
      </span>
    );
  }

  if (systemRole === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <Shield className="h-3 w-3" />
        Administrador
      </span>
    );
  }

  if (isLeader) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Shield className="h-3 w-3" />
        {office === 'PASTOR' ? 'Pastor' : 'Presbítero'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <Shield className="h-3 w-3" />
      {office === 'DIACONO' ? 'Diácono' : 'Membro'}
    </span>
  );
}
