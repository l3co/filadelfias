import { api } from '../lib/api';

export interface PrayerRequest {
    id: string;
    tenant_id: string;
    member_id: string;
    author_name: string;
    content: string;
    category: string;
    is_anonymous: boolean;
    prayer_count: number;
    prayed_by: string[];
    created_at: string;
    updated_at: string;
}

export interface CreatePrayerRequestDTO {
    content: string;
    category?: string;
    is_anonymous?: boolean;
}

export const prayerService = {
    listRequests: async (tenantId: string) => {
        const { data } = await api.get<PrayerRequest[]>('/prayer/requests', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createRequest: async (tenantId: string, request: CreatePrayerRequestDTO) => {
        const { data } = await api.post<PrayerRequest>('/prayer/requests', request, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    prayFor: async (tenantId: string, requestId: string) => {
        const { data } = await api.post<{ message: string; prayer_count: number }>(
            `/prayer/requests/${requestId}/pray`,
            {},
            { params: { tenant_id: tenantId } }
        );
        return data;
    },

    deleteRequest: async (tenantId: string, requestId: string) => {
        await api.delete(`/prayer/requests/${requestId}`, {
            params: { tenant_id: tenantId }
        });
    }
};
