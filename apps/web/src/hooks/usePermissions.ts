/**
 * Hook para gerenciamento de permissões
 * Integra dados do usuário com o sistema RBAC
 */

import { useMemo } from 'react';
import { useCurrentUser, useCurrentTenant } from './useAuth';
import { useMembers } from '../features/members/hooks/useMembers';
import {
  getMemberPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isLeadership,
  isOrdainedOfficer,
  type Resource,
  type Action,
  type Permission,
  type SystemRole,
} from '../lib/permissions';
import type { Member, EcclesiasticalOffice } from '../types';

interface UsePermissionsReturn {
  // Estado
  isLoading: boolean;
  currentMember: Member | null;
  systemRole: SystemRole;
  permissions: Set<Permission>;
  
  // Verificações de permissão
  can: (resource: Resource, action: Action) => boolean;
  canAny: (checks: Array<{ resource: Resource; action: Action }>) => boolean;
  canAll: (checks: Array<{ resource: Resource; action: Action }>) => boolean;
  
  // Verificações de ofício
  isLeader: boolean;
  isOfficer: boolean;
  office: EcclesiasticalOffice | null;
  
  // Atalhos comuns
  canViewMembers: boolean;
  canManageMembers: boolean;
  canViewGovernance: boolean;
  canManageGovernance: boolean;
  canViewFinancial: boolean;
  canManageFinancial: boolean;
  canViewEBD: boolean;
  canManageEBD: boolean;
  canViewMissions: boolean;
  canManageMissions: boolean;
  canViewSettings: boolean;
  canManageSettings: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const tenant = useCurrentTenant();
  
  // Busca membros do tenant para encontrar o membro atual
  const { data: members, isLoading: isLoadingMembers } = useMembers(tenant?.id);

  // Encontra o membro associado ao usuário atual
  const currentMember = useMemo(() => {
    if (!user?.id || !members) return null;
    return members.find((m: Member) => m.user_id === user.id) || null;
  }, [user, members]);

  // Determina o role do sistema (do membership)
  const systemRole = useMemo((): SystemRole => {
    if (!user?.memberships?.length) return 'ATTENDEE';
    
    const currentMembership = user.memberships.find(
      m => m.tenant.id === tenant?.id
    );
    
    const role = currentMembership?.role?.toUpperCase();
    if (role === 'ADMIN') return 'ADMIN';
    if (role === 'MODERATOR') return 'MODERATOR';
    return 'ATTENDEE';
  }, [user, tenant]);

  // Calcula permissões
  const permissions = useMemo(() => {
    return getMemberPermissions(currentMember, systemRole);
  }, [currentMember, systemRole]);

  // Função helper para verificar permissão
  const can = (resource: Resource, action: Action): boolean => {
    return hasPermission(permissions, resource, action);
  };

  const canAny = (checks: Array<{ resource: Resource; action: Action }>): boolean => {
    return hasAnyPermission(permissions, checks);
  };

  const canAll = (checks: Array<{ resource: Resource; action: Action }>): boolean => {
    return hasAllPermissions(permissions, checks);
  };

  // Verificações de ofício
  const office = currentMember?.office as EcclesiasticalOffice | null;
  const isLeader = isLeadership(office ?? undefined);
  const isOfficer = isOrdainedOfficer(office ?? undefined);

  // Atalhos de permissão comuns
  const canViewMembers = can('members', 'view');
  const canManageMembers = can('members', 'manage');
  const canViewGovernance = can('governance', 'view');
  const canManageGovernance = can('governance', 'manage');
  const canViewFinancial = can('financial', 'view');
  const canManageFinancial = can('financial', 'manage');
  const canViewEBD = can('ebd', 'view');
  const canManageEBD = can('ebd', 'manage');
  const canViewMissions = can('missions', 'view');
  const canManageMissions = can('missions', 'manage');
  const canViewSettings = can('settings', 'view');
  const canManageSettings = can('settings', 'manage');

  return {
    isLoading: isLoadingUser || isLoadingMembers,
    currentMember,
    systemRole,
    permissions,
    
    can,
    canAny,
    canAll,
    
    isLeader,
    isOfficer,
    office,
    
    canViewMembers,
    canManageMembers,
    canViewGovernance,
    canManageGovernance,
    canViewFinancial,
    canManageFinancial,
    canViewEBD,
    canManageEBD,
    canViewMissions,
    canManageMissions,
    canViewSettings,
    canManageSettings,
  };
}

/**
 * Hook para verificar uma permissão específica
 * Útil para verificações simples em componentes
 */
export function useCanAccess(resource: Resource, action: Action = 'view'): boolean {
  const { can, isLoading } = usePermissions();
  
  if (isLoading) return false;
  return can(resource, action);
}

/**
 * Hook para verificar se pode acessar um módulo (rota)
 */
export function useCanAccessModule(path: string): boolean {
  const { can, isLoading } = usePermissions();
  
  if (isLoading) return false;

  // Mapeia path para resource
  const resourceMap: Record<string, Resource> = {
    '/app/members': 'members',
    '/app/governance': 'governance',
    '/app/financial': 'financial',
    '/app/ebd': 'ebd',
    '/app/missions': 'missions',
    '/app/events': 'events',
    '/app/settings': 'settings',
  };

  const resource = resourceMap[path];
  if (!resource) return true; // Se não está mapeado, permite acesso
  
  return can(resource, 'view');
}
