import { api } from '@/services/api';

export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
}

export const eventsService = {
    getAll: async (tenantId: string): Promise<Event[]> => {
        const response = await api.get(`/tenants/${tenantId}/events`);
        return response.data;
    },
};
