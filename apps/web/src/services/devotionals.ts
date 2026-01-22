import { api } from '../lib/api';

export interface Devotional {
    id: string;
    tenant_id: string;
    title: string;
    date: string;
    verse_reference: string;
    verse_text: string;
    meditation: string;
    reflection?: string;
    prayer?: string;
    author?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDevotionalDTO {
    title: string;
    date: string;
    verse_reference: string;
    verse_text: string;
    meditation: string;
    reflection?: string;
    prayer?: string;
    author?: string;
}

export interface UpdateDevotionalDTO {
    title?: string;
    date?: string;
    verse_reference?: string;
    verse_text?: string;
    meditation?: string;
    reflection?: string;
    prayer?: string;
    author?: string;
}

export const devotionalService = {
    list: async (tenantId: string, limit: number = 30) => {
        const { data } = await api.get<Devotional[]>('/devotionals', {
            params: { tenant_id: tenantId, limit }
        });
        return data;
    },

    getToday: async (tenantId: string) => {
        const { data } = await api.get<Devotional | null>('/devotionals/today', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    getByDate: async (tenantId: string, date: string) => {
        const { data } = await api.get<Devotional | null>(`/devotionals/date/${date}`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    getById: async (tenantId: string, devotionalId: string) => {
        const { data } = await api.get<Devotional>(`/devotionals/${devotionalId}`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    create: async (tenantId: string, devotional: CreateDevotionalDTO) => {
        const { data } = await api.post<Devotional>('/devotionals', devotional, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    update: async (tenantId: string, devotionalId: string, devotional: UpdateDevotionalDTO) => {
        const { data } = await api.patch<Devotional>(`/devotionals/${devotionalId}`, devotional, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    delete: async (tenantId: string, devotionalId: string) => {
        await api.delete(`/devotionals/${devotionalId}`, {
            params: { tenant_id: tenantId }
        });
    }
};
