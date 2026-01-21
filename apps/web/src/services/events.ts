import { api } from '../lib/api';

export interface Event {
    id: string;
    tenant_id: string;
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date?: string;
    all_day: boolean;
    category?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEventDTO {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date?: string;
    all_day?: boolean;
    category?: string;
}

export interface UpdateEventDTO {
    title?: string;
    description?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    all_day?: boolean;
    category?: string;
}

export const eventService = {
    listEvents: async (tenantId: string) => {
        const { data } = await api.get<Event[]>('/events', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createEvent: async (tenantId: string, event: CreateEventDTO) => {
        const { data } = await api.post<Event>('/events', event, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    updateEvent: async (tenantId: string, eventId: string, event: UpdateEventDTO) => {
        const { data } = await api.patch<Event>(`/events/${eventId}`, event, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    deleteEvent: async (tenantId: string, eventId: string) => {
        await api.delete(`/events/${eventId}`, {
            params: { tenant_id: tenantId }
        });
    }
};
