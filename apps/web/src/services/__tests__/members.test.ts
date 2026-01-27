/**
 * @vitest-environment node
 * 
 * Tests for members service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock api
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from '../../lib/api';
import { membersService } from '../members';
import type { MemberCreateData } from '../../types/members.types';

const mockMember = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  tenant_id: '123e4567-e89b-12d3-a456-426614174001',
  full_name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-9999',
  status: 'COMUNGANTE',
  office: 'MEMBRO',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockMembersList = [
  mockMember,
  {
    ...mockMember,
    id: '123e4567-e89b-12d3-a456-426614174002',
    full_name: 'Maria Santos',
    email: 'maria@email.com',
  },
];

describe('membersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMembers', () => {
    it('should fetch members for a tenant', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMembersList });

      const tenantId = 'tenant-123';
      const result = await membersService.listMembers(tenantId);

      expect(api.get).toHaveBeenCalledWith(`/tenants/${tenantId}/members`);
      expect(result).toEqual(mockMembersList);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no members', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

      const result = await membersService.listMembers('tenant-123');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(membersService.listMembers('tenant-123')).rejects.toThrow('Network error');
    });
  });

  describe('createMember', () => {
    it('should create a new member', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockMember });

      const tenantId = 'tenant-123';
      const memberData = {
        full_name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        status: 'COMUNGANTE',
        office: 'MEMBRO',
      };

      const result = await membersService.createMember(tenantId, memberData as MemberCreateData);

      expect(api.post).toHaveBeenCalledWith(`/tenants/${tenantId}/members`, memberData);
      expect(result).toEqual(mockMember);
    });

    it('should throw error on validation failure', async () => {
      const validationError = {
        response: {
          status: 422,
          data: { detail: 'Validation error' },
        },
      };
      vi.mocked(api.post).mockRejectedValueOnce(validationError);

      const memberData = { full_name: 'Jo' }; // Too short

      await expect(
        membersService.createMember('tenant-123', memberData as Partial<MemberCreateData>)
      ).rejects.toEqual(validationError);
    });
  });

  describe('updateMember', () => {
    it('should update an existing member', async () => {
      const updatedMember = { ...mockMember, full_name: 'João Pedro Silva' };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedMember });

      const tenantId = 'tenant-123';
      const memberId = mockMember.id;
      const updateData = { full_name: 'João Pedro Silva' };

      const result = await membersService.updateMember(tenantId, memberId, updateData);

      expect(api.patch).toHaveBeenCalledWith(
        `/tenants/${tenantId}/members/${memberId}`,
        updateData
      );
      expect(result.full_name).toBe('João Pedro Silva');
    });

    it('should update member status', async () => {
      const updatedMember = { ...mockMember, status: 'TRANSFERIDO' };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedMember });

      const result = await membersService.updateMember(
        'tenant-123',
        mockMember.id,
        { status: 'TRANSFERIDO' }
      );

      expect(result.status).toBe('TRANSFERIDO');
    });

    it('should update member office', async () => {
      const updatedMember = { ...mockMember, office: 'DIACONO' };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedMember });

      const result = await membersService.updateMember(
        'tenant-123',
        mockMember.id,
        { office: 'DIACONO' }
      );

      expect(result.office).toBe('DIACONO');
    });

    it('should throw error when member not found', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { detail: 'Member not found' },
        },
      };
      vi.mocked(api.patch).mockRejectedValueOnce(notFoundError);

      await expect(
        membersService.updateMember('tenant-123', 'non-existent-id', { full_name: 'Test' })
      ).rejects.toEqual(notFoundError);
    });
  });
});
