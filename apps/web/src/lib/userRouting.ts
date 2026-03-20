import type { User } from '../types';
import type { EcclesiasticalOffice, EcclesiasticalFunction } from '../types';
import { ROUTES } from './routes';

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
  const role = membership.role?.toUpperCase();
  
  // Admin do sistema sempre vai para /app
  if (role === 'ADMIN') {
    return 'admin';
  }

  // Se tem role de moderador, vai para admin
  if (role === 'MODERATOR') {
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
      return ROUTES.ADMIN.ROOT;
    case 'teacher':
      return ROUTES.MEMBER.EDUCATION;
    case 'member':
    default:
      return ROUTES.MEMBER.ROOT;
  }
}

/**
 * Determina a rota de destino após login
 * Todos os usuários vão para /member primeiro, com opção de acessar admin via card
 */
export function getPostLoginRoute(): string {
  // Sempre redireciona para área de membro
  // Admins verão o AdminAccessCard na home para acessar o painel admin
  return ROUTES.MEMBER.ROOT;
}
