import { api } from "./api";
import type { Devotional } from "@/types/member";

interface ApiDevotional {
  id?: string | number;
  title?: string;
  content?: string;
  scripture?: string;
  verse_reference?: string;
  author?: string;
  author_name?: string;
  date?: string;
}

function normalizeDevotional(devotional: ApiDevotional): Devotional {
  return {
    id: String(devotional.id ?? ""),
    title: devotional.title || "Devocional",
    content: devotional.content || "",
    scripture: devotional.scripture || devotional.verse_reference || "",
    author: devotional.author || devotional.author_name || "",
    date: devotional.date || new Date().toISOString(),
  };
}

export const devotionalsService = {
  async getDevotionals(churchId?: string): Promise<Devotional[]> {
    const endpoint = churchId ? `/tenants/${churchId}/devotionals` : "/devotionals";
    const { data } = await api.get<ApiDevotional[]>(endpoint);
    return data.map(normalizeDevotional);
  },

  async getDevotional(id: string, churchId?: string): Promise<Devotional> {
    const endpoint = churchId ? `/tenants/${churchId}/devotionals/${id}` : `/devotionals/${id}`;
    const { data } = await api.get<ApiDevotional>(endpoint);
    return normalizeDevotional(data);
  },

  async getTodayDevotional(churchId?: string): Promise<Devotional | null> {
    try {
      const endpoint = churchId ? `/tenants/${churchId}/devotionals/today` : "/devotionals/today";
      const { data } = await api.get<ApiDevotional>(endpoint);
      return normalizeDevotional(data);
    } catch {
      const devotionals = await this.getDevotionals(churchId);
      return devotionals[0] ?? null;
    }
  },
};
