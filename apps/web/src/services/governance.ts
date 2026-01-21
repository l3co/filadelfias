import { api } from '../lib/api';

export interface Council {
    id: string;
    tenant_id: string;
    name: string;
    type: string;
    description?: string;
    member_ids?: string[];
}

export interface Meeting {
    id: string;
    council_id: string;
    date: string;
    status: string;
    agenda?: string;
    location?: string;
}

export interface CreateCouncilDTO {
    name: string;
    type: string; // SESSION | DEACONS | ASSEMBLY | COMMITTEE
    description?: string;
}

export interface CreateMeetingDTO {
    council_id: string;
    date: string;
    agenda?: string;
    location?: string;
}

export const governanceService = {
    listCouncils: async (tenantId: string) => {
        const { data } = await api.get<Council[]>('/governance/councils', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createCouncil: async (tenantId: string, council: CreateCouncilDTO) => {
        const { data } = await api.post<Council>('/governance/councils', council, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    listMeetings: async (councilId: string) => {
        const { data } = await api.get<Meeting[]>(`/governance/councils/${councilId}/meetings`);
        return data;
    },

    createMeeting: async (meeting: CreateMeetingDTO) => {
        const { data } = await api.post<Meeting>('/governance/meetings', meeting);
        return data;
    },

    deleteCouncil: async (tenantId: string, councilId: string) => {
        await api.delete(`/governance/councils/${councilId}`, {
            params: { tenant_id: tenantId }
        });
    },

    updateCouncil: async (tenantId: string, councilId: string, council: Partial<CreateCouncilDTO>) => {
        const { data } = await api.patch<Council>(`/governance/councils/${councilId}`, council, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    addMember: async (tenantId: string, councilId: string, memberId: string) => {
        const { data } = await api.post<Council>(`/governance/councils/${councilId}/members`, 
            { member_id: memberId },
            { params: { tenant_id: tenantId } }
        );
        return data;
    },

    removeMember: async (tenantId: string, councilId: string, memberId: string) => {
        const { data } = await api.delete<Council>(`/governance/councils/${councilId}/members/${memberId}`, {
            params: { tenant_id: tenantId }
        });
        return data;
    }
};
