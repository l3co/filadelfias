import { api } from '@/services/api';

export interface PrayerRequest {
    id: string;
    content: string;
    is_anonymous: boolean;
    author_name: string;
    created_at: string;
    prayer_count: number;
    prayed_by_me: boolean;
}

export const prayerService = {
    getAll: async (tenantId: string): Promise<PrayerRequest[]> => {
        const response = await api.get(`/tenants/${tenantId}/prayer-requests`);
        return response.data;
    },

    create: async (tenantId: string, data: { content: string; is_anonymous: boolean }): Promise<PrayerRequest> => {
        const response = await api.post(`/tenants/${tenantId}/prayer-requests`, data);
        return response.data;
    },

    pray: async (tenantId: string, requestId: string): Promise<void> => {
        await api.post(`/tenants/${tenantId}/prayer-requests/${requestId}/pray`);
    },
};
