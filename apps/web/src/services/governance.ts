import { api } from '../lib/api';

export interface Council {
    id: string;
    tenant_id: string;
    name: string;
    type: string;
    description?: string;
    member_ids?: string[];
}

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MeetingType = 'ORDINARY' | 'EXTRAORDINARY';

export interface Meeting {
    id: string;
    council_id: string;
    date: string;
    status: MeetingStatus;
    agenda?: string;
    location?: string;
    meeting_type: MeetingType;
    minutes?: string;
    attendees: string[];
    completed_at?: string;
    created_at: string;
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
    meeting_type?: MeetingType;
}

export interface UpdateMeetingDTO {
    date?: string;
    agenda?: string;
    location?: string;
    meeting_type?: MeetingType;
    minutes?: string;
    attendees?: string[];
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

    listMeetings: async (tenantId: string, councilId: string) => {
        const { data } = await api.get<Meeting[]>(`/governance/councils/${councilId}/meetings`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    getMeeting: async (tenantId: string, meetingId: string) => {
        const { data } = await api.get<Meeting>(`/governance/meetings/${meetingId}`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createMeeting: async (tenantId: string, meeting: CreateMeetingDTO) => {
        const { data } = await api.post<Meeting>('/governance/meetings', meeting, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    updateMeeting: async (tenantId: string, meetingId: string, meeting: UpdateMeetingDTO) => {
        const { data } = await api.patch<Meeting>(`/governance/meetings/${meetingId}`, meeting, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    completeMeeting: async (tenantId: string, meetingId: string) => {
        const { data } = await api.post<Meeting>(`/governance/meetings/${meetingId}/complete`, {}, {
            params: { tenant_id: tenantId }
        });
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

