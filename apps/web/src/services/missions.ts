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

export type UpdateMissionaryDTO = Partial<CreateMissionaryDTO>;

export interface SocialProject {
    id: string;
    tenant_id: string;
    title: string;
    summary: string;
    location?: string;
    status: string;
    target_audience?: string;
    coordinator_name?: string;
    contact_info?: string;
    start_date?: string;
    end_date?: string;
    created_at: string;
}

export interface CreateSocialProjectDTO {
    title: string;
    summary: string;
    location?: string;
    status: string;
    target_audience?: string;
    coordinator_name?: string;
    contact_info?: string;
    start_date?: string;
    end_date?: string;
}

export type UpdateSocialProjectDTO = Partial<CreateSocialProjectDTO>;

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
    },

    listSocialProjects: async (tenantId: string) => {
        const { data } = await api.get<SocialProject[]>('/missions/social-projects', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createSocialProject: async (tenantId: string, project: CreateSocialProjectDTO) => {
        const { data } = await api.post<SocialProject>('/missions/social-projects', project, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    updateSocialProject: async (tenantId: string, projectId: string, project: UpdateSocialProjectDTO) => {
        const { data } = await api.put<SocialProject>(`/missions/social-projects/${projectId}`, project, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    deleteSocialProject: async (tenantId: string, projectId: string) => {
        await api.delete(`/missions/social-projects/${projectId}`, {
            params: { tenant_id: tenantId }
        });
    },
};
