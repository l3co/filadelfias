import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { useCurrentUser } from '../hooks/useAuth';
import { createTestQueryClient } from '../test/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

vi.mock('../hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
}));

function createAuthWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user, tenant and membership from the current user query', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Maria Silva',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        memberships: [
          {
            id: 'membership-1',
            role: 'ADMIN',
            status: 'ACTIVE',
            joined_at: '2026-01-01T00:00:00Z',
            tenant: {
              id: 'tenant-1',
              name: 'Igreja Filadélfia',
              slug: 'igreja-filadelfia',
            },
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useCurrentUser>);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAuthWrapper(),
    });

    expect(result.current.user?.name).toBe('Maria Silva');
    expect(result.current.tenant?.name).toBe('Igreja Filadélfia');
    expect(result.current.membership?.id).toBe('membership-1');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isTenantAdmin).toBe(true);
  });

  it('throws when useAuth is used outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
  });
});
