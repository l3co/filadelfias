/**
 * Centralized Query Keys for TanStack Query
 * 
 * Benefits:
 * - Type-safe query keys
 * - Easy invalidation
 * - Consistent structure across features
 */

export const queryKeys = {
  // Members
  members: {
    all: (tenantId: string) => ['members', tenantId] as const,
    detail: (tenantId: string, memberId: string) => ['members', tenantId, memberId] as const,
    search: (tenantId: string, query: string) => ['members', tenantId, 'search', query] as const,
  },

  // Financial
  financial: {
    accounts: (tenantId: string) => ['financial', 'accounts', tenantId] as const,
    transactions: (tenantId: string) => ['financial', 'transactions', tenantId] as const,
    categories: (tenantId: string) => ['financial', 'categories', tenantId] as const,
    summary: (tenantId: string) => ['financial', 'summary', tenantId] as const,
  },

  // Governance
  governance: {
    councils: (tenantId: string) => ['governance', 'councils', tenantId] as const,
    councilDetail: (tenantId: string, councilId: string) => ['governance', 'councils', tenantId, councilId] as const,
    meetings: (councilId: string) => ['governance', 'meetings', councilId] as const,
  },

  // EBD
  ebd: {
    classes: (tenantId: string) => ['ebd', 'classes', tenantId] as const,
    classDetail: (classId: string) => ['ebd', 'class', classId] as const,
    students: (classId: string) => ['ebd', 'students', classId] as const,
    lessons: (classId: string) => ['ebd', 'lessons', classId] as const,
  },

  // Missions
  missions: {
    missionaries: (tenantId: string) => ['missions', 'missionaries', tenantId] as const,
    missionaryDetail: (tenantId: string, missionaryId: string) => ['missions', 'missionaries', tenantId, missionaryId] as const,
  },

  // Events
  events: {
    all: (tenantId: string) => ['events', tenantId] as const,
    upcoming: (tenantId: string) => ['events', tenantId, 'upcoming'] as const,
  },

  // Auth
  auth: {
    currentUser: () => ['auth', 'currentUser'] as const,
  },

  // Dashboard
  dashboard: {
    stats: (tenantId: string) => ['dashboard', 'stats', tenantId] as const,
  },
} as const;

// Helper type for query key
export type QueryKey = ReturnType<
  typeof queryKeys[keyof typeof queryKeys][keyof typeof queryKeys[keyof typeof queryKeys]]
>;
