import { api } from '@/services/api';

export interface TitheRecord {
    id: string;
    amount: number;
    type: 'DIZIMO' | 'OFERTA';
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    notes?: string;
    receipt_url?: string;
}

export interface TitheSummary {
    total_year: number;
    total_month: number;
    pending_count: number;
}

export const titheService = {
    getMyRecords: async (tenantId: string): Promise<TitheRecord[]> => {
        const response = await api.get(`/tenants/${tenantId}/my-tithes`);
        return response.data;
    },

    getSummary: async (tenantId: string): Promise<TitheSummary> => {
        const response = await api.get(`/tenants/${tenantId}/my-tithes/summary`);
        return response.data;
    },

    submit: async (tenantId: string, data: {
        amount: number;
        type: 'DIZIMO' | 'OFERTA';
        notes?: string;
    }): Promise<TitheRecord> => {
        const response = await api.post(`/tenants/${tenantId}/my-tithes`, data);
        return response.data;
    },
};
