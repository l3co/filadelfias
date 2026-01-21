/**
 * Sistema de Permissões RBAC
 * Baseado no Manual Presbiteriano da IPB
 * 
 * Hierarquia Eclesiástica (Ofícios - apenas um por membro):
 * - PASTOR: Ministro ordenado, preside o Conselho, autoridade máxima
 * - PRESBITERO: Governa a igreja com o pastor, participa do Conselho
 * - DIACONO: Serviço assistencial, pode participar de reuniões
 * - MEMBRO: Membro comungante com direito a voto em Assembleias
 * 
 * Funções (podem ter múltiplas):
 * - TESOUREIRO: Gerencia finanças
 * - SECRETARIO: Gerencia documentação
 * - EVANGELISTA: Evangelismo
 * - MISSIONARIO: Missões
 */

import type { EcclesiasticalOffice, EcclesiasticalFunction, Member } from '../types';

// ============================================================================
// TIPOS DE PERMISSÃO
// ============================================================================

export type Resource = 
  | 'members'
  | 'governance'
  | 'financial'
  | 'ebd'
  | 'missions'
  | 'events'
  | 'settings'
  | 'reports';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export type Permission = `${Resource}:${Action}`;

// ============================================================================
// MATRIZ DE PERMISSÕES POR OFÍCIO
// ============================================================================

/**
 * Permissões base por ofício eclesiástico
 * Seguindo a ordem do Manual Presbiteriano:
 * - Pastor tem autoridade máxima
 * - Presbítero governa junto ao pastor
 * - Diácono tem função de serviço
 * - Membro tem acesso básico
 */
export const OFFICE_PERMISSIONS: Record<EcclesiasticalOffice, Permission[]> = {
  PASTOR: [
    // Membros
    'members:view',
    'members:create',
    'members:edit',
    'members:delete',
    'members:manage',
    // Governança
    'governance:view',
    'governance:create',
    'governance:edit',
    'governance:delete',
    'governance:manage',
    // Financeiro
    'financial:view',
    'financial:create',
    'financial:edit',
    'financial:delete',
    'financial:manage',
    // EBD
    'ebd:view',
    'ebd:create',
    'ebd:edit',
    'ebd:delete',
    'ebd:manage',
    // Missões
    'missions:view',
    'missions:create',
    'missions:edit',
    'missions:delete',
    'missions:manage',
    // Eventos
    'events:view',
    'events:create',
    'events:edit',
    'events:delete',
    'events:manage',
    // Configurações
    'settings:view',
    'settings:edit',
    'settings:manage',
    // Relatórios
    'reports:view',
    'reports:manage',
  ],

  PRESBITERO: [
    // Membros - pode gerenciar
    'members:view',
    'members:create',
    'members:edit',
    'members:manage',
    // Governança - acesso total (compõe o Conselho)
    'governance:view',
    'governance:create',
    'governance:edit',
    'governance:delete',
    'governance:manage',
    // Financeiro - visualização e aprovação
    'financial:view',
    'financial:create',
    'financial:edit',
    // EBD
    'ebd:view',
    'ebd:create',
    'ebd:edit',
    'ebd:manage',
    // Missões
    'missions:view',
    'missions:create',
    'missions:edit',
    // Eventos
    'events:view',
    'events:create',
    'events:edit',
    // Configurações - somente visualização
    'settings:view',
    // Relatórios
    'reports:view',
  ],

  DIACONO: [
    // Membros - visualização e cadastro básico
    'members:view',
    'members:create',
    // Governança - pode visualizar (participa de reuniões)
    'governance:view',
    // Financeiro - pode visualizar e registrar (se for tesoureiro, terá mais)
    'financial:view',
    // EBD
    'ebd:view',
    'ebd:create',
    // Missões
    'missions:view',
    // Eventos
    'events:view',
    'events:create',
    // Relatórios - visualização básica
    'reports:view',
  ],

  MEMBRO: [
    // Membros - apenas visualizar lista pública
    'members:view',
    // EBD - pode se matricular
    'ebd:view',
    // Missões - pode visualizar
    'missions:view',
    // Eventos - pode visualizar
    'events:view',
  ],
};

// ============================================================================
// PERMISSÕES ADICIONAIS POR FUNÇÃO
// ============================================================================

/**
 * Permissões extras concedidas por função específica
 * Estas são ADICIONADAS às permissões do ofício
 */
export const FUNCTION_PERMISSIONS: Record<EcclesiasticalFunction, Permission[]> = {
  TESOUREIRO: [
    'financial:view',
    'financial:create',
    'financial:edit',
    'financial:delete',
    'financial:manage',
    'reports:view',
  ],

  SECRETARIO: [
    'members:view',
    'members:create',
    'members:edit',
    'governance:view',
    'governance:create', // Pode criar atas
    'reports:view',
    'reports:manage',
  ],

  EVANGELISTA: [
    'missions:view',
    'missions:create',
    'events:view',
    'events:create',
  ],

  MISSIONARIO: [
    'missions:view',
    'missions:create',
    'missions:edit',
  ],

  PROFESSOR_EBD: [
    'ebd:view',
    'ebd:create',
    'ebd:edit',
  ],
};

// ============================================================================
// PERMISSÕES POR ROLE DO SISTEMA (membership.role)
// ============================================================================

export type SystemRole = 'ADMIN' | 'MODERATOR' | 'ATTENDEE';

/**
 * Roles do sistema (diferentes de ofícios eclesiásticos)
 * - ADMIN: Administrador do tenant (quem criou a igreja)
 * - MODERATOR: Moderador com poderes administrativos
 * - ATTENDEE: Frequentador/visitante
 */
export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  ADMIN: [
    // Admin tem acesso total às configurações
    'settings:view',
    'settings:edit',
    'settings:manage',
    // E pode gerenciar tudo
    'members:manage',
    'financial:manage',
    'governance:manage',
    'ebd:manage',
    'missions:manage',
    'events:manage',
    'reports:manage',
  ],

  MODERATOR: [
    'settings:view',
    'members:view',
    'members:create',
    'members:edit',
  ],

  ATTENDEE: [
    // Visitante só visualiza informações públicas
    'events:view',
    'ebd:view',
  ],
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Calcula todas as permissões de um membro
 */
export function getMemberPermissions(
  member: Member | null,
  systemRole: SystemRole = 'ATTENDEE'
): Set<Permission> {
  const permissions = new Set<Permission>();

  // 1. Adiciona permissões do role do sistema
  SYSTEM_ROLE_PERMISSIONS[systemRole]?.forEach(p => permissions.add(p));

  if (!member) {
    return permissions;
  }

  // 2. Adiciona permissões do ofício eclesiástico
  const officePerms = OFFICE_PERMISSIONS[member.office as EcclesiasticalOffice];
  officePerms?.forEach(p => permissions.add(p));

  // 3. Adiciona permissões das funções
  member.functions?.forEach(func => {
    const funcPerms = FUNCTION_PERMISSIONS[func as EcclesiasticalFunction];
    funcPerms?.forEach(p => permissions.add(p));
  });

  return permissions;
}

/**
 * Verifica se tem uma permissão específica
 */
export function hasPermission(
  permissions: Set<Permission>,
  resource: Resource,
  action: Action
): boolean {
  const permission: Permission = `${resource}:${action}`;
  
  // Verifica permissão exata
  if (permissions.has(permission)) {
    return true;
  }

  // Verifica se tem permissão de 'manage' (implica todas as outras)
  if (permissions.has(`${resource}:manage` as Permission)) {
    return true;
  }

  return false;
}

/**
 * Verifica se tem pelo menos uma das permissões
 */
export function hasAnyPermission(
  permissions: Set<Permission>,
  checks: Array<{ resource: Resource; action: Action }>
): boolean {
  return checks.some(({ resource, action }) => 
    hasPermission(permissions, resource, action)
  );
}

/**
 * Verifica se tem todas as permissões
 */
export function hasAllPermissions(
  permissions: Set<Permission>,
  checks: Array<{ resource: Resource; action: Action }>
): boolean {
  return checks.every(({ resource, action }) => 
    hasPermission(permissions, resource, action)
  );
}

/**
 * Verifica se é um ofício de liderança (pode acessar governança)
 */
export function isLeadership(office: EcclesiasticalOffice | undefined): boolean {
  return office === 'PASTOR' || office === 'PRESBITERO';
}

/**
 * Verifica se é um oficial (ordenado)
 */
export function isOrdainedOfficer(office: EcclesiasticalOffice | undefined): boolean {
  return office === 'PASTOR' || office === 'PRESBITERO' || office === 'DIACONO';
}

/**
 * Descrições amigáveis dos ofícios
 */
export const OFFICE_LABELS: Record<EcclesiasticalOffice, string> = {
  PASTOR: 'Pastor',
  PRESBITERO: 'Presbítero',
  DIACONO: 'Diácono',
  MEMBRO: 'Membro',
};

/**
 * Descrições amigáveis das funções
 */
export const FUNCTION_LABELS: Record<EcclesiasticalFunction, string> = {
  TESOUREIRO: 'Tesoureiro',
  SECRETARIO: 'Secretário',
  EVANGELISTA: 'Evangelista',
  MISSIONARIO: 'Missionário',
  PROFESSOR_EBD: 'Professor de EBD',
};

/**
 * Recursos que cada módulo da aplicação requer
 */
export const MODULE_RESOURCES: Record<string, Resource> = {
  '/app/members': 'members',
  '/app/governance': 'governance',
  '/app/financial': 'financial',
  '/app/ebd': 'ebd',
  '/app/missions': 'missions',
  '/app/events': 'events',
  '/app/settings': 'settings',
};
