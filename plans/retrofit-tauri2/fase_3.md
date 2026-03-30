# Fase 3 — Conteúdo Público Offline

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar Bíblia (múltiplas versões com FTS), Hinário Novo Cântico e Manual IPB com download offline via SQLite. Tudo acessível sem autenticação.

**Architecture:** `tauri-plugin-sql` gerencia SQLite. Cada serviço tenta dados online (API) e cai para offline (SQLite) automaticamente. Downloads são feitos item a item com progresso via Zustand store. FTS5 no SQLite para busca de versículos e hinos.

**Tech Stack:** tauri-plugin-sql, SQLite FTS5, TanStack Query, Zustand, Web Speech API.

**Referência:** Portar de `apps/mobile/src/services/bible.ts`, `hymnal.ts`, `manual.ts`, `offline.ts` e `apps/mobile/src/stores/downloadStore.ts`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── lib/
│   └── database.ts                  # inicialização SQLite + schema
├── services/
│   ├── api.ts                       # axios instance base
│   ├── bible.ts                     # Bible API + offline fallback
│   ├── hymnal.ts                    # Hymnal API + offline fallback
│   ├── manual.ts                    # Manual API + offline fallback
│   └── offline.ts                   # download manager (Bible/Hymnal/Manual)
├── stores/
│   └── downloadStore.ts             # Zustand: progresso de downloads
├── hooks/
│   ├── useBible.ts                  # queries TanStack para Bíblia
│   ├── useHymnal.ts                 # queries TanStack para Hinário
│   └── useManual.ts                 # queries TanStack para Manual
├── routes/
│   ├── public/
│   │   ├── BibleScreen.tsx          # lista de livros
│   │   ├── BibleChapterScreen.tsx   # versículos do capítulo
│   │   ├── HymnalScreen.tsx         # lista de hinos
│   │   ├── HymnScreen.tsx           # letra de um hino
│   │   ├── ManualScreen.tsx         # estrutura do manual
│   │   └── ManualArticleScreen.tsx  # artigo individual
│   └── downloads/
│       └── DownloadsScreen.tsx      # gerenciar conteúdo offline
```

---

## Task 1: Inicializar banco SQLite

**Files:**
- Create: `apps/tauri/src/lib/database.ts`

- [ ] **Criar módulo de banco de dados**

```typescript
import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:filadelfias.db");
  await migrate(db);
  return db;
}

async function migrate(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bible_chapters (
      id TEXT PRIMARY KEY,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      version TEXT NOT NULL,
      verses TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS bible_fts
    USING fts5(verse_text, book, chapter, verse_number, version, content='bible_verses_flat')
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS hymns (
      id INTEGER PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      lyrics TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS hymns_fts
    USING fts5(title, author, lyrics, content='hymns', content_rowid='id')
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS manual_articles (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      text TEXT NOT NULL,
      structure TEXT NOT NULL,
      notes TEXT NOT NULL,
      navigation TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS downloads_meta (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);
}
```

- [ ] **Inicializar banco no App.tsx**

No `App.tsx`, adicionar dentro do `ThemeProvider`:
```typescript
useEffect(() => {
  getDatabase().catch(console.error);
}, []);
```

---

## Task 2: Serviço de API base

**Files:**
- Create: `apps/tauri/src/services/api.ts`

- [ ] **Criar instância Axios**

```typescript
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.filadelfias.com";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
```

Criar `apps/tauri/.env`:
```
VITE_API_URL=http://localhost:8000
```

Criar `apps/tauri/.env.production`:
```
VITE_API_URL=https://api.filadelfias.com
```

---

## Task 3: Serviço da Bíblia

**Files:**
- Create: `apps/tauri/src/services/bible.ts`

- [ ] **Criar serviço (adaptado de apps/mobile/src/services/bible.ts)**

```typescript
import { api } from "./api";
import { getDatabase } from "@/lib/database";

export interface BibleBook {
  abbrev: string;
  name: string;
  chapters_count: number;
  testament: "OT" | "NT";
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  book_abbrev: string;
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export const bibleService = {
  getVersions: async (): Promise<BibleVersion[]> => {
    const { data } = await api.get("/bible/versions");
    return data;
  },

  getBooks: async (version: string): Promise<BibleBook[]> => {
    const { data } = await api.get(`/bible/${version}/books`);
    return data;
  },

  getChapter: async (book: string, chapter: number, version: string): Promise<BibleChapter> => {
    // Tenta offline primeiro
    const db = await getDatabase();
    const offline = await db.select<{ verses: string; book: string; chapter: number }[]>(
      "SELECT verses, book, chapter FROM bible_chapters WHERE id = ?",
      [`${version}-${book}-${chapter}`]
    );

    if (offline.length > 0) {
      return {
        book_abbrev: offline[0].book,
        book_name: offline[0].book,
        chapter: offline[0].chapter,
        verses: JSON.parse(offline[0].verses),
      };
    }

    const { data } = await api.get(`/bible/${version}/${book}/${chapter}`);
    return data;
  },

  search: async (query: string, version: string): Promise<BibleVerse[]> => {
    const db = await getDatabase();
    // Tenta FTS offline
    const results = await db.select<{ verse_text: string; book: string; verse_number: number }[]>(
      "SELECT verse_text, book, verse_number FROM bible_fts WHERE verse_text MATCH ? LIMIT 50",
      [query]
    );
    if (results.length > 0) return results.map(r => ({ number: r.verse_number, text: r.verse_text }));

    const { data } = await api.get(`/bible/${version}/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};
```

---

## Task 4: Serviço do Hinário

**Files:**
- Create: `apps/tauri/src/services/hymnal.ts`

- [ ] **Criar serviço**

```typescript
import { api } from "./api";
import { getDatabase } from "@/lib/database";

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

export const hymnalService = {
  getHymns: async (): Promise<Pick<Hymn, "number" | "title" | "author">[]> => {
    const db = await getDatabase();
    const offline = await db.select<{ number: number; title: string; author: string }[]>(
      "SELECT number, title, author FROM hymns ORDER BY number"
    );
    if (offline.length > 0) return offline;

    const { data } = await api.get("/hymnal");
    return data;
  },

  getHymn: async (number: number): Promise<Hymn> => {
    const db = await getDatabase();
    const offline = await db.select<{ number: number; title: string; author: string; lyrics: string }[]>(
      "SELECT number, title, author, lyrics FROM hymns WHERE number = ?",
      [number]
    );
    if (offline.length > 0) {
      return { ...offline[0], lyrics: JSON.parse(offline[0].lyrics) };
    }

    const { data } = await api.get(`/hymnal/${number}`);
    return data;
  },

  search: async (query: string): Promise<Pick<Hymn, "number" | "title">[]> => {
    const db = await getDatabase();
    const results = await db.select<{ number: number; title: string }[]>(
      "SELECT number, title FROM hymns_fts WHERE hymns_fts MATCH ? LIMIT 30",
      [query]
    );
    if (results.length > 0) return results;

    const { data } = await api.get(`/hymnal/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};
```

---

## Task 5: Serviço de Download Offline

**Files:**
- Create: `apps/tauri/src/services/offline.ts`
- Create: `apps/tauri/src/stores/downloadStore.ts`

- [ ] **Criar serviço offline (adaptado de apps/mobile/src/services/offline.ts)**

```typescript
import { getDatabase } from "@/lib/database";
import { bibleService } from "./bible";
import { hymnalService } from "./hymnal";

export interface DownloadProgress {
  current: number;
  total: number;
  type: string;
  name: string;
}

export interface DownloadMeta {
  id: string;
  type: "bible" | "hymnal" | "manual";
  name: string;
  size: number;
  downloaded_at: string;
}

export const offlineService = {
  downloadBibleVersion: async (
    version: string,
    onProgress?: (p: DownloadProgress) => void
  ): Promise<void> => {
    const db = await getDatabase();
    const books = await bibleService.getBooks(version);
    let current = 0;
    const total = books.reduce((a, b) => a + b.chapters_count, 0);

    for (const book of books) {
      for (let ch = 1; ch <= book.chapters_count; ch++) {
        const data = await bibleService.getChapter(book.abbrev, ch, version);
        await db.execute(
          `INSERT OR REPLACE INTO bible_chapters (id, book, chapter, version, verses, downloaded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`${version}-${book.abbrev}-${ch}`, book.abbrev, ch, version, JSON.stringify(data.verses), new Date().toISOString()]
        );
        current++;
        onProgress?.({ current, total, type: "bible", name: `${book.name} ${ch}` });
      }
    }

    await db.execute(
      `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at) VALUES (?, ?, ?, ?, ?)`,
      [`bible-${version}`, "bible", version.toUpperCase(), total, new Date().toISOString()]
    );
  },

  downloadHymnal: async (onProgress?: (p: DownloadProgress) => void): Promise<void> => {
    const db = await getDatabase();
    const hymns = await hymnalService.getHymns();
    let current = 0;

    for (const hymn of hymns) {
      const full = await hymnalService.getHymn(hymn.number);
      await db.execute(
        `INSERT OR REPLACE INTO hymns (id, number, title, author, lyrics, downloaded_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [hymn.number, hymn.number, hymn.title, hymn.author || "", JSON.stringify(full.lyrics), new Date().toISOString()]
      );
      current++;
      onProgress?.({ current, total: hymns.length, type: "hymnal", name: `Hino ${hymn.number}` });
    }

    await db.execute(
      `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at) VALUES (?, ?, ?, ?, ?)`,
      ["hymnal", "hymnal", "Novo Cântico", hymns.length, new Date().toISOString()]
    );
  },

  getDownloadedContent: async (): Promise<DownloadMeta[]> => {
    const db = await getDatabase();
    return db.select<DownloadMeta[]>(
      "SELECT id, type, name, size, downloaded_at FROM downloads_meta ORDER BY downloaded_at DESC"
    );
  },

  isContentDownloaded: async (type: string, id?: string): Promise<boolean> => {
    const db = await getDatabase();
    const downloadId = id ? `${type}-${id}` : type;
    const result = await db.select<{ id: string }[]>(
      "SELECT id FROM downloads_meta WHERE id = ?",
      [downloadId]
    );
    return result.length > 0;
  },

  deleteDownload: async (id: string): Promise<void> => {
    const db = await getDatabase();
    const meta = await db.select<{ type: string }[]>(
      "SELECT type FROM downloads_meta WHERE id = ?", [id]
    );
    if (!meta.length) return;

    if (meta[0].type === "bible") {
      await db.execute("DELETE FROM bible_chapters WHERE version = ?", [id.replace("bible-", "")]);
    } else if (meta[0].type === "hymnal") {
      await db.execute("DELETE FROM hymns");
    } else if (meta[0].type === "manual") {
      await db.execute("DELETE FROM manual_articles");
    }
    await db.execute("DELETE FROM downloads_meta WHERE id = ?", [id]);
  },
};
```

- [ ] **Criar DownloadStore**

`apps/tauri/src/stores/downloadStore.ts`:
```typescript
import { create } from "zustand";
import { offlineService, DownloadProgress, DownloadMeta } from "@/services/offline";

interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  downloads: DownloadMeta[];
  startDownload: (type: "bible" | "hymnal" | "manual", id?: string) => Promise<void>;
  refreshDownloads: () => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
  isDownloaded: (type: string, id?: string) => Promise<boolean>;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  isDownloading: false,
  progress: null,
  downloads: [],

  startDownload: async (type, id) => {
    set({ isDownloading: true, progress: null });
    try {
      const onProgress = (progress: DownloadProgress) => set({ progress });
      if (type === "bible" && id) await offlineService.downloadBibleVersion(id, onProgress);
      else if (type === "hymnal") await offlineService.downloadHymnal(onProgress);
      await get().refreshDownloads();
    } finally {
      set({ isDownloading: false, progress: null });
    }
  },

  refreshDownloads: async () => {
    const downloads = await offlineService.getDownloadedContent();
    set({ downloads });
  },

  deleteDownload: async (id) => {
    await offlineService.deleteDownload(id);
    await get().refreshDownloads();
  },

  isDownloaded: (type, id) => offlineService.isContentDownloaded(type, id),
}));
```

---

## Task 6: Tela da Bíblia

**Files:**
- Create: `apps/tauri/src/routes/public/BibleScreen.tsx`
- Create: `apps/tauri/src/routes/public/BibleChapterScreen.tsx`

- [ ] **Criar BibleScreen (lista de livros)**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { bibleService } from "@/services/bible";
import { useState } from "react";

const DEFAULT_VERSION = "ARC";

export function BibleScreen() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(DEFAULT_VERSION);

  const { data: versions } = useQuery({
    queryKey: ["bible-versions"],
    queryFn: bibleService.getVersions,
  });

  const { data: books, isLoading } = useQuery({
    queryKey: ["bible-books", version],
    queryFn: () => bibleService.getBooks(version),
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;

  const ot = books?.filter((b) => b.testament === "OT") ?? [];
  const nt = books?.filter((b) => b.testament === "NT") ?? [];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {versions?.map((v) => (
            <option key={v.id} value={v.id}>{v.abbreviation} — {v.name}</option>
          ))}
        </select>
      </div>

      <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Antigo Testamento</h2>
      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {ot.map((book) => (
          <button
            key={book.abbrev}
            onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
            className="rounded-md border p-2 text-center text-sm hover:bg-muted"
          >
            {book.name}
          </button>
        ))}
      </div>

      <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Novo Testamento</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {nt.map((book) => (
          <button
            key={book.abbrev}
            onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
            className="rounded-md border p-2 text-center text-sm hover:bg-muted"
          >
            {book.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Criar BibleChapterScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { bibleService } from "@/services/bible";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function BibleChapterScreen() {
  const { version = "ARC", book = "gn", chapter = "1" } = useParams();
  const navigate = useNavigate();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bible-chapter", version, book, chapter],
    queryFn: () => bibleService.getChapter(book, parseInt(chapter), version),
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;

  const chapterNum = parseInt(chapter);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/biblia/${version}/${book}/${chapterNum - 1}`)}>
          <ChevronLeft />
        </Button>
        <h1 className="font-semibold">{data?.book_name} {chapter}</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate(`/biblia/${version}/${book}/${chapterNum + 1}`)}>
          <ChevronRight />
        </Button>
      </div>

      <div className="space-y-3">
        {data?.verses.map((verse) => (
          <p
            key={verse.number}
            className="cursor-pointer leading-relaxed"
            onClick={() => setSelectedVerse(verse.number === selectedVerse ? null : verse.number)}
          >
            <sup className="mr-1 text-xs font-bold text-primary">{verse.number}</sup>
            {verse.text}
            {selectedVerse === verse.number && (
              <button
                onClick={(e) => { e.stopPropagation(); speak(verse.text); }}
                className="ml-2 text-primary"
              >
                <Volume2 size={14} className="inline" />
              </button>
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Atualizar rotas em routes/index.tsx**

Substituir os placeholders `/biblia` e `/biblia/:version/:book/:chapter`:
```typescript
import { BibleScreen } from "@/routes/public/BibleScreen";
import { BibleChapterScreen } from "@/routes/public/BibleChapterScreen";

// Na config do router:
{ path: "biblia", element: <BibleScreen /> },
{ path: "biblia/:version/:book/:chapter", element: <BibleChapterScreen /> },
```

---

## Task 7: Tela do Hinário

**Files:**
- Create: `apps/tauri/src/routes/public/HymnalScreen.tsx`
- Create: `apps/tauri/src/routes/public/HymnScreen.tsx`

- [ ] **Criar HymnalScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { hymnalService } from "@/services/hymnal";
import { useState } from "react";
import { Search } from "lucide-react";

export function HymnalScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: hymns, isLoading } = useQuery({
    queryKey: ["hymns"],
    queryFn: hymnalService.getHymns,
  });

  const filtered = hymns?.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      String(h.number).includes(search)
  );

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar hino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-1">
          {filtered?.map((h) => (
            <button
              key={h.number}
              onClick={() => navigate(`/hinario/${h.number}`)}
              className="flex w-full items-center gap-3 rounded-md p-3 hover:bg-muted text-left"
            >
              <span className="w-8 text-right text-sm font-bold text-primary">{h.number}</span>
              <div>
                <p className="text-sm font-medium">{h.title}</p>
                {h.author && <p className="text-xs text-muted-foreground">{h.author}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar HymnScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { hymnalService } from "@/services/hymnal";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HymnScreen() {
  const { number } = useParams<{ number: string }>();

  const { data: hymn, isLoading } = useQuery({
    queryKey: ["hymn", number],
    queryFn: () => hymnalService.getHymn(parseInt(number!)),
    enabled: !!number,
  });

  const speak = () => {
    if (!hymn) return;
    const text = hymn.lyrics.map((s) => s.lines.join(" ")).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;
  if (!hymn) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{hymn.number}. {hymn.title}</h1>
          {hymn.author && <p className="text-sm text-muted-foreground">{hymn.author}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={speak}>
          <Volume2 size={20} />
        </Button>
      </div>

      <div className="space-y-4">
        {hymn.lyrics.map((section, i) => (
          <div key={i} className={section.type === "chorus" ? "border-l-4 border-primary pl-3 italic" : ""}>
            {section.number && (
              <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                {section.type === "chorus" ? "Refrão" : `Estrofe ${section.number}`}
              </p>
            )}
            {section.lines.map((line, j) => (
              <p key={j} className="text-sm leading-relaxed">{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Atualizar rotas**

```typescript
import { HymnalScreen } from "@/routes/public/HymnalScreen";
import { HymnScreen } from "@/routes/public/HymnScreen";

{ path: "hinario", element: <HymnalScreen /> },
{ path: "hinario/:number", element: <HymnScreen /> },
```

---

## Task 8: Tela de Gerenciamento de Downloads

**Files:**
- Create: `apps/tauri/src/routes/downloads/DownloadsScreen.tsx`

- [ ] **Criar DownloadsScreen**

```typescript
import { useEffect } from "react";
import { useDownloadStore } from "@/stores/downloadStore";
import { Download, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const AVAILABLE_DOWNLOADS = [
  { type: "bible" as const, id: "ARC", label: "Bíblia ARC — Almeida Revista e Corrigida" },
  { type: "bible" as const, id: "NVI", label: "Bíblia NVI — Nova Versão Internacional" },
  { type: "hymnal" as const, id: undefined, label: "Hinário Novo Cântico" },
  { type: "manual" as const, id: undefined, label: "Manual da IPB" },
];

export function DownloadsScreen() {
  const { isDownloading, progress, downloads, startDownload, refreshDownloads, deleteDownload } =
    useDownloadStore();

  useEffect(() => {
    refreshDownloads();
  }, []);

  const isDownloaded = (type: string, id?: string) => {
    const key = id ? `${type}-${id}` : type;
    return downloads.some((d) => d.id === key);
  };

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold">Conteúdo Offline</h1>

      {isDownloading && progress && (
        <div className="mb-6 rounded-lg border p-4">
          <p className="mb-2 text-sm font-medium">{progress.name}</p>
          <Progress value={(progress.current / progress.total) * 100} />
          <p className="mt-1 text-xs text-muted-foreground">
            {progress.current} / {progress.total}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {AVAILABLE_DOWNLOADS.map(({ type, id, label }) => {
          const downloaded = isDownloaded(type, id);
          const downloadId = id ? `${type}-${id}` : type;

          return (
            <div key={downloadId} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                {downloaded && (
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} /> Disponível offline
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {downloaded ? (
                  <Button variant="ghost" size="icon" onClick={() => deleteDownload(downloadId)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    onClick={() => startDownload(type, id)}
                  >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span className="ml-1">Baixar</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Instalar componente Progress do shadcn**

```bash
npx shadcn@latest add progress
```

- [ ] **Commit desta fase**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement offline Bible, Hymnal and download management"
```

---

## Checklist de Conclusão da Fase 3

- [ ] Banco SQLite inicializa sem erro em todos os targets
- [ ] Bíblia carrega lista de livros via API e navega para capítulos
- [ ] TTS funciona ao clicar em versículo (Web Speech API)
- [ ] Hinário exibe lista com busca por título/número
- [ ] Download de versão bíblica funciona com barra de progresso
- [ ] Conteúdo baixado fica acessível offline (sem internet)
- [ ] Downloads podem ser apagados individualmente

**Próximo passo:** [Fase 4 — Autenticação](fase_4.md)
