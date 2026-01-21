import { api } from '../lib/api';

export interface Missionary {
    id: string;
    tenant_id: string;
    name: string;
    field_name: string;
    country_code: string;
    latitude: number;
    longitude: number;
    bio?: string;
    photo_url?: string;
    newsletter_url?: string;
}

export interface CreateMissionaryDTO {
    name: string;
    field_name: string;
    country_code: string;
    latitude: number;
    longitude: number;
    bio?: string;
    photo_url?: string;
    newsletter_url?: string;
}

export const missionService = {
    listMissionaries: async (tenantId: string) => {
        const { data } = await api.get<Missionary[]>('/missions/missionaries', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createMissionary: async (tenantId: string, missionary: CreateMissionaryDTO) => {
        const { data } = await api.post<Missionary>('/missions/missionaries', missionary, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    deleteMissionary: async (tenantId: string, missionaryId: string) => {
        await api.delete(`/missions/missionaries/${missionaryId}`, {
            params: { tenant_id: tenantId }
        });
    }
};
