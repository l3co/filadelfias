import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCurrentUser } from '../hooks/useAuth';
import type { Tenant, User, UserMembership } from '../types';

export interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  membership: UserMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTenantAdmin: boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const membership = user?.memberships?.[0] ?? null;
  const tenant = membership?.tenant ?? null;
  const normalizedRole = membership?.role?.toUpperCase();

  const value = useMemo<AuthContextValue>(() => ({
    user: user ?? null,
    tenant,
    membership,
    isLoading,
    isAuthenticated: Boolean(user),
    isTenantAdmin: normalizedRole === 'ADMIN' || normalizedRole === 'MODERATOR',
    hasPermission: () => false,
  }), [isLoading, membership, normalizedRole, tenant, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function useAuthUser() {
  return useAuth().user;
}

export function useAuthTenant() {
  return useAuth().tenant;
}

export function useAuthMembership() {
  return useAuth().membership;
}
