import { api } from "./api";
import type { Event } from "@/types/member";

interface ApiEvent {
  id?: string | number;
  title?: string;
  description?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  date?: string;
  time?: string;
  church_id?: string | number;
  tenant_id?: string | number;
}

function buildDateTime(date?: string, time?: string) {
  if (!date) {
    return new Date().toISOString();
  }

  if (!time) {
    return new Date(date).toISOString();
  }

  return new Date(`${date}T${time}`).toISOString();
}

function normalizeEvent(event: ApiEvent): Event {
  const startsAt = event.starts_at || buildDateTime(event.date, event.time);
  return {
    id: String(event.id ?? ""),
    title: event.title || "Evento",
    description: event.description || "",
    location: event.location || "",
    starts_at: startsAt,
    ends_at: event.ends_at || startsAt,
    church_id: String(event.church_id ?? event.tenant_id ?? ""),
  };
}

export const eventsService = {
  async getEvents(churchId: string): Promise<Event[]> {
    const { data } = await api.get<ApiEvent[]>(`/tenants/${churchId}/events`);
    return data.map(normalizeEvent);
  },

  async getEvent(eventId: string): Promise<Event> {
    const { data } = await api.get<ApiEvent>(`/events/${eventId}`);
    return normalizeEvent(data);
  },
};
