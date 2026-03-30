import { api } from "./api";
import type { CreatePrayerInput, PrayerRequest } from "@/types/community";

interface ApiPrayerRequest {
  id?: string | number;
  tenant_id?: string | number;
  member_id?: string | number;
  author_name?: string;
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  is_anonymous?: boolean;
  prayer_count?: number;
  prayed_by?: string[];
  created_at?: string;
}

function buildPrayerTitle(prayer: ApiPrayerRequest) {
  if (prayer.title) {
    return prayer.title;
  }

  const content = prayer.content || prayer.description || "";
  if (!content) {
    return "Pedido de oracao";
  }

  const firstLine = content.split("\n")[0]?.trim() || content.trim();
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
}

function normalizePrayer(prayer: ApiPrayerRequest, currentUserId?: string): PrayerRequest {
  const prayedBy = prayer.prayed_by || [];

  return {
    id: String(prayer.id ?? ""),
    title: buildPrayerTitle(prayer),
    description: prayer.description || prayer.content || "",
    category: prayer.category || "other",
    author_name: prayer.author_name || "Anonimo",
    author_id: String(prayer.member_id ?? ""),
    prayer_count: prayer.prayer_count ?? prayedBy.length,
    already_prayed: currentUserId ? prayedBy.includes(currentUserId) : false,
    created_at: prayer.created_at || new Date().toISOString(),
    church_id: String(prayer.tenant_id ?? ""),
    is_anonymous: Boolean(prayer.is_anonymous),
  };
}

export const prayerService = {
  async getPrayers(churchId: string, currentUserId?: string): Promise<PrayerRequest[]> {
    const { data } = await api.get<ApiPrayerRequest[]>("/prayer/requests", {
      params: { tenant_id: churchId },
    });

    return data.map((prayer) => normalizePrayer(prayer, currentUserId));
  },

  async getPrayer(prayerId: string, churchId?: string, currentUserId?: string): Promise<PrayerRequest> {
    const { data } = await api.get<ApiPrayerRequest>(`/prayer/requests/${prayerId}`, {
      params: churchId ? { tenant_id: churchId } : undefined,
    });

    return normalizePrayer(data, currentUserId);
  },

  async createPrayer(churchId: string, input: CreatePrayerInput): Promise<PrayerRequest> {
    const payload = {
      title: input.title,
      content: `${input.title}\n\n${input.description}`,
      category: input.category,
      is_anonymous: input.is_anonymous,
    };

    const { data } = await api.post<ApiPrayerRequest>("/prayer/requests", payload, {
      params: { tenant_id: churchId },
    });

    return normalizePrayer(data);
  },

  async pray(prayerId: string, churchId: string): Promise<void> {
    await api.post(`/prayer/requests/${prayerId}/pray`, null, {
      params: { tenant_id: churchId },
    });
  },
};
