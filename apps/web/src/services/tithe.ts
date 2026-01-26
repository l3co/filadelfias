import { api } from '../lib/api';

export type TitheType = 'DIZIMO' | 'OFERTA';
export type TitheStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TitheRecord {
    id: string;
    tenant_id: string;
    member_id: string;
    member_name?: string;
    amount: number;
    type: TitheType;
    date: string;
    status: TitheStatus;
    notes?: string;
    attachment_url?: string;
    rejection_reason?: string;
    approved_by?: string;
    approved_at?: string;
    transaction_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface TitheSummary {
    total_dizimo: number;
    total_oferta: number;
    total: number;
    count_dizimo: number;
    count_oferta: number;
    count_pending: number;
    year: number;
}

export interface CreateTitheRecordDTO {
    amount: number;
    type: TitheType;
    date: string;
    notes?: string;
    attachment_url?: string;
}

export interface ApproveTitheDTO {
    status: 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
}

export const titheService = {
    submitRecord: async (tenantId: string, data: CreateTitheRecordDTO) => {
        const { data: result } = await api.post<TitheRecord>('/tithe/records', data, {
            params: { tenant_id: tenantId }
        });
        return result;
    },

    getMyRecords: async (tenantId: string, year?: number) => {
        const { data } = await api.get<TitheRecord[]>('/tithe/records/me', {
            params: { tenant_id: tenantId, year }
        });
        return data;
    },

    getMySummary: async (tenantId: string, year?: number) => {
        const { data } = await api.get<TitheSummary>('/tithe/records/me/summary', {
            params: { tenant_id: tenantId, year }
        });
        return data;
    },

    deleteMyRecord: async (tenantId: string, recordId: string) => {
        const { data } = await api.delete<{ success: boolean; message: string }>(
            `/tithe/records/${recordId}`,
            { params: { tenant_id: tenantId } }
        );
        return data;
    },

    getPendingRecords: async (tenantId: string) => {
        const { data } = await api.get<TitheRecord[]>('/tithe/records/pending', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    getAllRecords: async (tenantId: string, year?: number) => {
        const { data } = await api.get<TitheRecord[]>('/tithe/records', {
            params: { tenant_id: tenantId, year }
        });
        return data;
    },

    approveRecord: async (tenantId: string, recordId: string, data: ApproveTitheDTO) => {
        const { data: result } = await api.post<TitheRecord>(
            `/tithe/records/${recordId}/approve`,
            data,
            { params: { tenant_id: tenantId } }
        );
        return result;
    }
};
