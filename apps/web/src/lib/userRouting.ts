import type { User } from '../types';
import type { EcclesiasticalOffice, EcclesiasticalFunction } from '../types';

export type UserExperience = 'admin' | 'member' | 'teacher';

/**
 * Determina qual experiência/rota o usuário deve acessar
 * Baseado no office, functions e systemRole
 */
export function getUserExperience(user: User | null | undefined): UserExperience {
  if (!user || !user.memberships || user.memberships.length === 0) {
    return 'member';
  }

  const membership = user.memberships[0];
  
  // Admin do sistema sempre vai para /app
  if (membership.role === 'ADMIN') {
    return 'admin';
  }

  // Buscar member associado para verificar office e functions
  // Por enquanto, verificamos apenas o role do membership
  // TODO: Buscar dados do member quando disponível
  
  // Se tem role de moderador, vai para admin
  if (membership.role === 'MODERATOR') {
    return 'admin';
  }

  // Default: experiência de membro
  return 'member';
}

/**
 * Determina a experiência baseada nos dados do membro
 */
export function getMemberExperience(
  office?: EcclesiasticalOffice,
  functions?: EcclesiasticalFunction[],
  systemRole?: string
): UserExperience {
  // Admin sempre vai para /app
  if (systemRole === 'ADMIN' || systemRole === 'MODERATOR') {
    return 'admin';
  }

  // Oficiais da igreja vão para /app
  const adminOffices: EcclesiasticalOffice[] = ['PASTOR', 'PRESBITERO', 'DIACONO'];
  if (office && adminOffices.includes(office)) {
    return 'admin';
  }

  // Professor de EBD vai para portal do professor
  if (functions?.includes('PROFESSOR_EBD')) {
    return 'teacher';
  }

  // Demais casos: experiência de membro
  return 'member';
}

/**
 * Retorna a rota base para cada experiência
 */
export function getExperienceRoute(experience: UserExperience): string {
  switch (experience) {
    case 'admin':
      return '/app';
    case 'teacher':
      return '/portal-professor';
    case 'member':
    default:
      return '/membro';
  }
}

/**
 * Determina a rota de destino após login
 */
export function getPostLoginRoute(user: User | null | undefined): string {
  const experience = getUserExperience(user);
  return getExperienceRoute(experience);
}
