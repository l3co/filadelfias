import { api } from '../lib/api';
import type { Member, MemberCreateData } from '../types';

export const membersService = {
    /**
     * List members by tenant
     */
    listMembers: async (tenantId: string): Promise<Member[]> => {
        const response = await api.get<Member[]>(`/tenants/${tenantId}/members`);
        return response.data;
    },

    /**
     * Create a new member
     */
    createMember: async (tenantId: string, data: MemberCreateData): Promise<Member> => {
        const response = await api.post<Member>(`/tenants/${tenantId}/members`, data);
        return response.data;
    },
};
