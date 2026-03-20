/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../../test/utils';

vi.mock('../../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/AuthContext')>();
  return {
    ...actual,
    useAuthTenant: vi.fn(),
    useAuthUser: vi.fn(),
  };
});

vi.mock('../../features/members/hooks/useMembers', () => ({
  useMembers: vi.fn(),
}));

import { useAuthTenant, useAuthUser } from '../../contexts/AuthContext';
import { useMembers } from '../../features/members/hooks/useMembers';
import { useCanAccess, useCanAccessModule, usePermissions } from '../usePermissions';

const mockUseAuthTenant = vi.mocked(useAuthTenant);
const mockUseAuthUser = vi.mocked(useAuthUser);
const mockUseMembers = vi.mocked(useMembers);

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });

    mockUseAuthUser.mockReturnValue({
      id: 'user-1',
      email: 'admin@igreja.com',
      name: 'Administrador',
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
            name: 'Igreja Teste',
            slug: 'igreja-teste',
          },
        },
      ],
    });
  });

  it('combines system role and member data into permission shortcuts', () => {
    mockUseMembers.mockReturnValue({
      data: [
        {
          id: 'member-1',
          user_id: 'user-1',
          full_name: 'Administrador',
          office: 'DIACONO',
          functions: ['TESOUREIRO'],
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(mockUseMembers).toHaveBeenCalledWith('tenant-1');
    expect(result.current.systemRole).toBe('ADMIN');
    expect(result.current.currentMember?.id).toBe('member-1');
    expect(result.current.isTreasurer).toBe(true);
    expect(result.current.canSubmitExpenses).toBe(true);
    expect(result.current.canViewMembers).toBe(true);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.canViewFinancial).toBe(true);
    expect(result.current.canManageFinancial).toBe(true);
    expect(result.current.can('events', 'view')).toBe(true);
    expect(result.current.canAny([
      { resource: 'members', action: 'view' },
      { resource: 'settings', action: 'manage' },
    ])).toBe(true);
    expect(result.current.canAll([
      { resource: 'financial', action: 'view' },
      { resource: 'financial', action: 'manage' },
    ])).toBe(true);
  });

  it('returns attendee defaults when there is no matching member', () => {
    mockUseMembers.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentMember).toBeNull();
    expect(result.current.systemRole).toBe('ADMIN');
    expect(result.current.office).toBeUndefined();
    expect(result.current.isLeader).toBe(false);
    expect(result.current.isOfficer).toBe(false);
    expect(result.current.isTreasurer).toBe(false);
    expect(result.current.canViewEBD).toBe(true);
    expect(result.current.canManageFinancial).toBe(true);
  });

  it('propagates loading state from useMembers', () => {
    mockUseMembers.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useMembers>);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useCanAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });
    mockUseAuthUser.mockReturnValue({
      id: 'user-1',
      email: 'membro@igreja.com',
      name: 'Membro',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      memberships: [
        {
          id: 'membership-1',
          role: 'ATTENDEE',
          status: 'ACTIVE',
          joined_at: '2026-01-01T00:00:00Z',
          tenant: {
            id: 'tenant-1',
            name: 'Igreja Teste',
            slug: 'igreja-teste',
          },
        },
      ],
    });
  });

  it('returns false while permissions are loading', () => {
    mockUseMembers.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useMembers>);

    const { result } = renderHook(() => useCanAccess('members'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('checks access for a specific resource and action', () => {
    mockUseMembers.mockReturnValue({
      data: [
        {
          id: 'member-1',
          user_id: 'user-1',
          full_name: 'Membro',
          office: 'MEMBRO',
          functions: [],
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    const { result } = renderHook(() => useCanAccess('members', 'view'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(true);
  });
});

describe('useCanAccessModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });
    mockUseAuthUser.mockReturnValue({
      id: 'user-1',
      email: 'membro@igreja.com',
      name: 'Membro',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      memberships: [
        {
          id: 'membership-1',
          role: 'ATTENDEE',
          status: 'ACTIVE',
          joined_at: '2026-01-01T00:00:00Z',
          tenant: {
            id: 'tenant-1',
            name: 'Igreja Teste',
            slug: 'igreja-teste',
          },
        },
      ],
    });
  });

  it('allows unmapped routes and blocks mapped routes without permission', () => {
    mockUseMembers.mockReturnValue({
      data: [
        {
          id: 'member-1',
          user_id: 'user-1',
          full_name: 'Membro',
          office: 'MEMBRO',
          functions: [],
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    const { result: memberModule } = renderHook(() => useCanAccessModule('/admin/members'), {
      wrapper: createWrapper(),
    });

    const { result: unknownModule } = renderHook(() => useCanAccessModule('/rota-livre'), {
      wrapper: createWrapper(),
    });

    expect(memberModule.current).toBe(true);
    expect(unknownModule.current).toBe(true);
  });
});
