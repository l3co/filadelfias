import { api } from '@/services/api';

export interface Devotional {
    id: string;
    title: string;
    verse_reference: string;
    verse_text: string;
    content: string;
    date: string;
    author_name: string;
}

export const devotionalsService = {
    getAll: async (tenantId: string): Promise<Devotional[]> => {
        const response = await api.get(`/tenants/${tenantId}/devotionals`);
        return response.data;
    },

    getById: async (tenantId: string, id: string): Promise<Devotional> => {
        const response = await api.get(`/tenants/${tenantId}/devotionals/${id}`);
        return response.data;
    },
};
