import { api } from '@/services/api';
import { logger } from '@/lib/logger';

const log = logger.createModuleLogger('PrayerService');

/**
 * Prayer Request interface matching backend PrayerRequestResponse schema
 * @see apps/backend/src/modules/prayer/schemas.py
 */
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

export const prayerService = {
    getAll: async (tenantId: string): Promise<PrayerRequest[]> => {
        log.apiRequest('getAll', '/prayer/requests', { tenant_id: tenantId });
        try {
            const response = await api.get(`/prayer/requests`, {
                params: { tenant_id: tenantId }
            });
            log.apiResponse('getAll', response.status, response.data);
            return response.data;
        } catch (error) {
            log.apiError('getAll', error);
            throw error;
        }
    },

    create: async (tenantId: string, data: { content: string; is_anonymous: boolean; category?: string }): Promise<PrayerRequest> => {
        log.apiRequest('create', '/prayer/requests', { tenant_id: tenantId, ...data });
        try {
            const response = await api.post(`/prayer/requests`, data, {
                params: { tenant_id: tenantId }
            });
            log.apiResponse('create', response.status, response.data);
            return response.data;
        } catch (error) {
            log.apiError('create', error);
            throw error;
        }
    },

    pray: async (tenantId: string, requestId: string): Promise<void> => {
        log.apiRequest('pray', `/prayer/requests/${requestId}/pray`, { tenant_id: tenantId });
        try {
            const response = await api.post(`/prayer/requests/${requestId}/pray`, null, {
                params: { tenant_id: tenantId }
            });
            log.apiResponse('pray', response.status);
        } catch (error) {
            log.apiError('pray', error);
            throw error;
        }
    },

    delete: async (tenantId: string, requestId: string): Promise<void> => {
        log.apiRequest('delete', `/prayer/requests/${requestId}`, { tenant_id: tenantId });
        try {
            const response = await api.delete(`/prayer/requests/${requestId}`, {
                params: { tenant_id: tenantId }
            });
            log.apiResponse('delete', response.status);
        } catch (error) {
            log.apiError('delete', error);
            throw error;
        }
    },
};
