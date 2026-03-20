import { useNavigate as useReactRouterNavigate } from 'react-router-dom';

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    BIBLE: '/bible',
    BIBLE_READER: (book: string, chapter: number | string) => `/bible/${book}/${chapter}`,
    HYMNAL: '/hymnal',
    HYMNAL_READER: (number: number | string) => `/hymnal/${number}`,
    MANUAL: '/manual',
    MANUAL_ARTICLE: (articleId: string) => `/manual/${articleId}`,
    TERMS: '/terms',
    PRIVACY: '/privacy',
  },
  AUTH: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    REGISTER: '/register',
    ONBOARDING: '/onboarding',
  },
  ADMIN: {
    ROOT: '/admin',
    MEMBERS: '/admin/members',
    GOVERNANCE: '/admin/governance',
    TREASURY: '/admin/treasury',
    MISSIONS: '/admin/missions',
    EDUCATION: '/admin/education',
    EDUCATION_CLASS: (classId: string) => `/admin/education/${classId}`,
    EVENTS: '/admin/events',
    DEVOTIONALS: '/admin/devotionals',
    SETTINGS: '/admin/settings',
    PROFILE: '/admin/profile',
  },
  MEMBER: {
    ROOT: '/member',
    DIRECTORY: '/member/directory',
    EVENTS: '/member/events',
    MISSIONS: '/member/missions',
    BIBLE: '/member/bible',
    HYMNAL: '/member/hymnal',
    MANUAL: '/member/manual',
    EDUCATION: '/member/education',
    PRAYER: '/member/prayer',
    DEVOTIONALS: '/member/devotionals',
    GOVERNANCE: '/member/governance',
    TITHES: '/member/tithes',
    EXPENSES: '/member/expenses',
    PROFILE: '/member/profile',
  },
  LEGACY: {
    APP: '/app',
    APP_ANY: '/app/*',
    MEMBER_PT: '/membro',
    MEMBER_PT_ANY: '/membro/*',
  },
} as const;

export const MODULE_ROUTES = {
  members: ROUTES.ADMIN.MEMBERS,
  governance: ROUTES.ADMIN.GOVERNANCE,
  financial: ROUTES.ADMIN.TREASURY,
  ebd: ROUTES.ADMIN.EDUCATION,
  missions: ROUTES.ADMIN.MISSIONS,
  events: ROUTES.ADMIN.EVENTS,
  settings: ROUTES.ADMIN.SETTINGS,
} as const;

export function useAppNavigate() {
  const navigate = useReactRouterNavigate();

  return {
    to: (path: string) => navigate(path),
    toAdmin: (path: string = ROUTES.ADMIN.ROOT) => navigate(path),
    toMember: (path: string = ROUTES.MEMBER.ROOT) => navigate(path),
    back: () => navigate(-1),
  };
}
