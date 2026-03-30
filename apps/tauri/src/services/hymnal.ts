import { getDatabase } from "@/lib/database";
import { api } from "./api";

export interface HymnLyricLine {
  type: "verse" | "chorus" | "bridge";
  number?: number;
  lines: string[];
}

export interface Hymn {
  number: number;
  title: string;
  author?: string;
  lyrics: HymnLyricLine[];
}

function normalizeLyrics(lyrics: string[] | HymnLyricLine[]): HymnLyricLine[] {
  if (!Array.isArray(lyrics)) {
    return [];
  }

  if (lyrics.length === 0 || typeof lyrics[0] !== "string") {
    return lyrics as HymnLyricLine[];
  }

  return [
    {
      type: "verse",
      number: 1,
      lines: lyrics as string[],
    },
  ];
}

export const hymnalService = {
  getHymns: async (): Promise<Pick<Hymn, "number" | "title" | "author">[]> => {
    const database = await getDatabase();
    const offline = await database.select<{ number: number; title: string; author: string }[]>(
      "SELECT number, title, author FROM hymns ORDER BY number",
    );

    if (offline.length > 0) {
      return offline;
    }

    const { data } = await api.get("/hymnal/");
    return data;
  },

  getHymn: async (number: number): Promise<Hymn> => {
    const database = await getDatabase();
    const offline = await database.select<{ number: number; title: string; author: string; lyrics: string }[]>(
      "SELECT number, title, author, lyrics FROM hymns WHERE number = ?",
      [number],
    );

    if (offline.length > 0) {
      return {
        ...offline[0],
        lyrics: JSON.parse(offline[0].lyrics),
      };
    }

    const { data } = await api.get(`/hymnal/${number}`);
    return {
      number: data.number,
      title: data.title,
      author: data.author,
      lyrics: normalizeLyrics(data.lyrics),
    };
  },

  search: async (query: string): Promise<Pick<Hymn, "number" | "title">[]> => {
    const database = await getDatabase();
    const offline = await database.select<{ number: number; title: string }[]>(
      "SELECT number, title FROM hymns_fts WHERE hymns_fts MATCH ? LIMIT 30",
      [query],
    );

    if (offline.length > 0) {
      return offline;
    }

    const { data } = await api.get("/hymnal/search", {
      params: { q: query },
    });

    return data;
  },
};
