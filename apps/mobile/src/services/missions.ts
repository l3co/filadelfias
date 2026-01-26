import { api } from '@/services/api';

export interface Missionary {
    id: string;
    name: string;
    field: string;
    country: string;
    description?: string;
    photo_url?: string;
    start_date: string;
    is_active: boolean;
}

export const missionsService = {
    getAll: async (tenantId: string): Promise<Missionary[]> => {
        const response = await api.get(`/tenants/${tenantId}/missions`);
        return response.data;
    },
};
