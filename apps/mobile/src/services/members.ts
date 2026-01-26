import { api } from '@/services/api';

export interface Member {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
}

export const membersService = {
    getAll: async (tenantId: string): Promise<Member[]> => {
        const response = await api.get(`/tenants/${tenantId}/members`);
        return response.data;
    },
};
