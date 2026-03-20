import { api } from '../lib/api';

export interface Country {
    id: string;
    code: string;
    name: string;
    tenant_id: string;
    created_at: string;
}

export interface CreateCountryDTO {
    code: string;
    name: string;
}

export interface Missionary {
    id: string;
    tenant_id: string;
    name: string;
    field_name: string;
    country_code: string;
    state?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    bio?: string;
    photo_url?: string;
    newsletter_url?: string;
}

export interface CreateMissionaryDTO {
    name: string;
    field_name: string;
    country_code: string;
    state?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    bio?: string;
    photo_url?: string;
    newsletter_url?: string;
}

export interface UpdateMissionaryDTO extends Partial<CreateMissionaryDTO> {}

export const missionService = {
    // Countries
    listCountries: async (tenantId: string) => {
        const { data } = await api.get<Country[]>('/missions/countries', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createCountry: async (tenantId: string, country: CreateCountryDTO) => {
        const { data } = await api.post<Country>('/missions/countries', country, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    // Missionaries
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

    updateMissionary: async (tenantId: string, missionaryId: string, missionary: UpdateMissionaryDTO) => {
        const { data } = await api.put<Missionary>(`/missions/missionaries/${missionaryId}`, missionary, {
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
