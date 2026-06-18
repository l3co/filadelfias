# Manual Presbiteriano Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Manual Presbiteriano UX for web and Tauri with search-first home, article index with excerpts, and a reader with breadcrumb, favorites, and footnote-style notes.

**Architecture:** Backend adds `excerpt` and `context` fields to article responses. A shared `useManualStorage` hook manages favorites and recents in localStorage. Four frontend components are rewritten (web + Tauri × index + reader), sharing near-identical logic.

**Tech Stack:** Python/FastAPI (backend), React 19 + TypeScript + TanStack Query, Tailwind CSS, localStorage for persistence.

---

## Files

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/backend/src/services/manual_service.py` | Add `excerpt` to structure; add `context` to article |
| Modify | `apps/web/src/services/manual.ts` | Add `excerpt`, `ArticleContext` types |
| Modify | `apps/tauri/src/services/manual.ts` | Same type additions |
| Create | `apps/web/src/hooks/useManualStorage.ts` | Favorites + recents localStorage logic |
| Create | `apps/tauri/src/hooks/useManualStorage.ts` | Same (duplicate — different app) |
| Rewrite | `apps/web/src/routes/manual/ManualPage.tsx` | Home (search + recents + favorites) + accordion index |
| Modify | `apps/web/src/routes/manual/ManualReaderPage.tsx` | Breadcrumb + favorite button + footnotes |
| Rewrite | `apps/tauri/src/routes/public/ManualScreen.tsx` | Same as web ManualPage |
| Rewrite | `apps/tauri/src/routes/public/ManualArticleScreen.tsx` | Same as web ManualReaderPage |

---

## Task 1: Backend — Add `excerpt` and `context`

**Files:**
- Modify: `apps/backend/src/services/manual_service.py`

- [ ] **Step 1.1: Update `get_manual_structure` to expose excerpt**

In `get_manual_structure()`, replace the block that strips article text with one that keeps a short excerpt:

```python
def get_manual_structure() -> dict[str, Any]:
    """Get the processed manual structure (without article texts)."""
    data = _load_manual_data()
    processed = _process_structure(data)

    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section.get("articles", []):
                    article["excerpt"] = (article.pop("text", "") or "")[:100]
                    article.pop("structure", None)
                    article.pop("notes", None)
            for article in chapter.get("articles", []):
                article["excerpt"] = (article.pop("text", "") or "")[:100]
                article.pop("structure", None)
                article.pop("notes", None)

    return processed
```

- [ ] **Step 1.2: Update `get_article` to include breadcrumb context**

Replace the existing `get_article()` function entirely:

```python
def get_article(article_id: str) -> dict[str, Any] | None:
    """Get a specific article by ID, including breadcrumb context."""
    data = _load_manual_data()
    processed = _process_structure(data)

    all_articles: list[tuple[dict[str, Any], dict[str, Any]]] = []

    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section["articles"]:
                    all_articles.append((article, {
                        "part_title": part["title"],
                        "chapter_title": chapter["title"],
                        "section_title": section["title"],
                    }))
            for article in chapter.get("articles", []):
                all_articles.append((article, {
                    "part_title": part["title"],
                    "chapter_title": chapter["title"],
                    "section_title": None,
                }))

    for idx, (article, context) in enumerate(all_articles):
        if article["id"] == article_id:
            prev_article = all_articles[idx - 1][0] if idx > 0 else None
            next_article = all_articles[idx + 1][0] if idx < len(all_articles) - 1 else None
            return {
                **article,
                "context": context,
                "navigation": {
                    "previous": {"id": prev_article["id"], "number": prev_article["number"]} if prev_article else None,
                    "next": {"id": next_article["id"], "number": next_article["number"]} if next_article else None,
                },
            }

    return None
```

- [ ] **Step 1.3: Verify backend locally**

```bash
curl -s "http://localhost:8000/manual/structure" | python3 -c "
import json, sys
data = json.load(sys.stdin)
art = data['parts'][0]['chapters'][0]['articles'][0]
print('excerpt:', art.get('excerpt', 'MISSING'))
print('has text:', 'text' in art)
"
```

Expected output:
```
excerpt: A Igreja Presbiteriana do Brasil é uma federação de igrejas locais...
has text: False
```

```bash
curl -s "http://localhost:8000/manual/article/p0%2Fch0%2Fart0" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('context:', data.get('context', 'MISSING'))
"
```

Expected: `context: {'part_title': '...', 'chapter_title': '...', 'section_title': None}`

- [ ] **Step 1.4: Commit**

```bash
git add apps/backend/src/services/manual_service.py
git commit -m "feat(backend): adicionar excerpt e context ao Manual API"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `apps/web/src/services/manual.ts`
- Modify: `apps/tauri/src/services/manual.ts`

- [ ] **Step 2.1: Update web types**

In `apps/web/src/services/manual.ts`, add `excerpt` to `ManualArticleSummary` and add `ArticleContext` + update `ManualArticle`:

```typescript
export interface ManualArticleSummary {
    id: string;
    number: string;
    excerpt?: string;  // NEW: first 100 chars of article text
}

// NEW interface — add after ManualArticleSummary
export interface ArticleContext {
    part_title: string;
    chapter_title: string;
    section_title: string | null;
}

// Update ManualArticle — add context field
export interface ManualArticle {
    id: string;
    number: string;
    text: string;
    structure: ArticleStructure[];
    notes: ArticleNote[];
    navigation: ArticleNavigation;
    context: ArticleContext;  // NEW
}
```

- [ ] **Step 2.2: Update Tauri types**

In `apps/tauri/src/services/manual.ts`, apply the same changes:

```typescript
export interface ManualArticleSummary {
  id: string;
  number: string;
  excerpt?: string;  // NEW
}

// NEW — add after ManualArticleSummary
export interface ArticleContext {
  part_title: string;
  chapter_title: string;
  section_title: string | null;
}

// Update ManualArticle — add context field
export interface ManualArticle {
  id: string;
  number: string;
  text: string;
  structure: ArticleStructure[];
  notes: ArticleNote[];
  navigation: ArticleNavigation;
  context: ArticleContext;  // NEW
}
```

- [ ] **Step 2.3: Commit**

```bash
git add apps/web/src/services/manual.ts apps/tauri/src/services/manual.ts
git commit -m "feat(types): adicionar excerpt e ArticleContext ao Manual"
```

---

## Task 3: `useManualStorage` Hook

**Files:**
- Create: `apps/web/src/hooks/useManualStorage.ts`
- Create: `apps/tauri/src/hooks/useManualStorage.ts`

- [ ] **Step 3.1: Create web hook**

Create `apps/web/src/hooks/useManualStorage.ts`:

```typescript
import { useCallback, useState } from 'react';

const FAVORITES_KEY = 'manual-favorites';
const RECENT_KEY = 'manual-recent';
const MAX_RECENT = 5;

export interface RecentArticle {
    id: string;
    number: string;
    excerpt: string;
}

function readStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

export function useManualStorage() {
    const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));
    const [recent, setRecent] = useState<RecentArticle[]>(() => readStorage(RECENT_KEY, []));

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const addRecent = useCallback((article: RecentArticle) => {
        setRecent(prev => {
            const filtered = prev.filter(x => x.id !== article.id);
            const next = [article, ...filtered].slice(0, MAX_RECENT);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

    return { favorites, recent, toggleFavorite, addRecent, isFavorite };
}
```

- [ ] **Step 3.2: Create Tauri hook (identical)**

Create `apps/tauri/src/hooks/useManualStorage.ts` with the exact same content as the web hook above (different app, same logic).

- [ ] **Step 3.3: Commit**

```bash
git add apps/web/src/hooks/useManualStorage.ts apps/tauri/src/hooks/useManualStorage.ts
git commit -m "feat: hook useManualStorage para favoritos e recentes do Manual"
```

---

## Task 4: Web `ManualPage.tsx` — Home + Index

**Files:**
- Rewrite: `apps/web/src/routes/manual/ManualPage.tsx`

- [ ] **Step 4.1: Rewrite ManualPage**

Replace the entire file content:

```tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { manualService } from '@/services/manual';
import { BookOpen, ChevronDown, ChevronRight, Search, Star, X } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useManualStorage } from '@/hooks/useManualStorage';

export function ManualPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showBrowse, setShowBrowse] = useState(false);
    const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    const { recent, isFavorite } = useManualStorage();

    const { data: structure, isLoading } = useQuery({
        queryKey: ['manual-structure'],
        queryFn: manualService.getStructure,
        staleTime: Infinity,
    });

    const { data: searchResults, isFetching: isSearching } = useQuery({
        queryKey: ['manual-search', searchQuery],
        queryFn: () => manualService.search(searchQuery),
        enabled: searchQuery.length >= 2,
        staleTime: 30000,
    });

    const isSearchActive = searchQuery.length >= 2;

    const favoriteArticles = useMemo(() => {
        if (!structure) return [];
        const result: Array<{ id: string; number: string; excerpt: string }> = [];
        for (const part of structure.parts) {
            for (const chapter of part.chapters) {
                for (const article of chapter.articles) {
                    if (isFavorite(article.id)) result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? '' });
                }
                for (const section of chapter.sections) {
                    for (const article of section.articles) {
                        if (isFavorite(article.id)) result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? '' });
                    }
                }
            }
        }
        return result;
    }, [structure, isFavorite]);

    const togglePart = (id: string) => setExpandedParts(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleChapter = (id: string) => setExpandedChapters(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-5 rounded-xl border border-gray-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 shadow-md shadow-green-700/20">
                        <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-serif text-xl font-bold text-gray-900">Manual Presbiteriano</h1>
                        <p className="text-xs text-gray-500">Edição {structure?.metadata.editionYear} · {structure?.total_articles} artigos</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar artigo, tema ou palavra-chave…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700" />
                        </div>
                    )}
                </div>
            </div>

            {/* Search results */}
            {isSearchActive && searchResults && (
                <div className="mb-5 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-500">{searchResults.count} resultado(s) para "{searchQuery}"</p>
                    </div>
                    {searchResults.results.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Nenhum resultado encontrado.</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {searchResults.results.map(result => (
                                <Link
                                    key={result.id}
                                    to={ROUTES.PUBLIC.MANUAL_ARTICLE(result.id)}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors"
                                >
                                    <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-700">
                                        {result.number}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-700 line-clamp-2">{result.excerpt}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{result.chapter}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Home view: recents + favorites + browse button */}
            {!isSearchActive && !showBrowse && (
                <>
                    {(recent.length > 0 || favoriteArticles.length > 0) && (
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            {/* Recentes */}
                            {recent.length > 0 && (
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Recentes</p>
                                    <div className="space-y-2">
                                        {recent.map(art => (
                                            <Link key={art.id} to={ROUTES.PUBLIC.MANUAL_ARTICLE(art.id)} className="flex items-start gap-2 group">
                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-green-50 text-xs font-bold text-green-700 group-hover:bg-green-100">
                                                    {art.number}
                                                </span>
                                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-green-700 transition-colors">{art.excerpt}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Favoritos */}
                            {favoriteArticles.length > 0 && (
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">⭐ Favoritos</p>
                                    <div className="space-y-2">
                                        {favoriteArticles.map(art => (
                                            <Link key={art.id} to={ROUTES.PUBLIC.MANUAL_ARTICLE(art.id)} className="flex items-start gap-2 group">
                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-amber-50 text-xs font-bold text-amber-700 group-hover:bg-amber-100">
                                                    {art.number}
                                                </span>
                                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-green-700 transition-colors">{art.excerpt}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setShowBrowse(true)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                        <BookOpen size={16} />
                        Navegar pelo índice completo
                    </button>
                </>
            )}

            {/* Browse view: accordion index */}
            {!isSearchActive && showBrowse && structure && (
                <>
                    <button
                        onClick={() => setShowBrowse(false)}
                        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 transition-colors"
                    >
                        <ChevronRight size={14} className="rotate-180" /> Voltar
                    </button>

                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        {structure.parts.map(part => (
                            <div key={part.id} className="border-b border-gray-50 last:border-b-0">
                                <button
                                    onClick={() => togglePart(part.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                                >
                                    {expandedParts.has(part.id)
                                        ? <ChevronDown size={16} className="text-green-600 shrink-0" />
                                        : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                                    <span className="font-semibold text-gray-900 text-sm flex-1">{part.title}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{part.chapters.length} caps</span>
                                </button>

                                {expandedParts.has(part.id) && (
                                    <div className="border-t border-gray-50">
                                        {part.chapters.map(chapter => (
                                            <div key={chapter.id} className="border-b border-gray-50 last:border-b-0">
                                                <button
                                                    onClick={() => toggleChapter(chapter.id)}
                                                    className="w-full flex items-center gap-3 pl-8 pr-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    {expandedChapters.has(chapter.id)
                                                        ? <ChevronDown size={14} className="text-green-600 shrink-0" />
                                                        : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                                                    <span className="text-xs font-bold text-green-700 shrink-0">Cap. {chapter.number}</span>
                                                    <span className="text-sm text-gray-700 truncate">{chapter.title}</span>
                                                </button>

                                                {expandedChapters.has(chapter.id) && (
                                                    <div className="border-t border-gray-50 bg-gray-50/50">
                                                        {/* Direct articles */}
                                                        {chapter.articles.map(article => (
                                                            <Link
                                                                key={article.id}
                                                                to={ROUTES.PUBLIC.MANUAL_ARTICLE(article.id)}
                                                                className="flex items-start gap-3 pl-14 pr-4 py-2 hover:bg-green-50 transition-colors group"
                                                            >
                                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-white border border-gray-200 text-xs font-bold text-green-700 group-hover:border-green-300">
                                                                    {article.number}
                                                                </span>
                                                                <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-green-800 flex-1">{article.excerpt}</p>
                                                                {isFavorite(article.id) && <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />}
                                                            </Link>
                                                        ))}
                                                        {/* Sections */}
                                                        {chapter.sections.map(section => (
                                                            <div key={section.id}>
                                                                <p className="pl-14 pr-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide border-t border-gray-100">
                                                                    {section.number} — {section.title}
                                                                </p>
                                                                {section.articles.map(article => (
                                                                    <Link
                                                                        key={article.id}
                                                                        to={ROUTES.PUBLIC.MANUAL_ARTICLE(article.id)}
                                                                        className="flex items-start gap-3 pl-14 pr-4 py-2 hover:bg-green-50 transition-colors group"
                                                                    >
                                                                        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-white border border-gray-200 text-xs font-bold text-green-700 group-hover:border-green-300">
                                                                            {article.number}
                                                                        </span>
                                                                        <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-green-800 flex-1">{article.excerpt}</p>
                                                                        {isFavorite(article.id) && <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -i "manual" | head -20
```

Expected: no errors related to manual files.

- [ ] **Step 4.3: Commit**

```bash
git add apps/web/src/routes/manual/ManualPage.tsx
git commit -m "feat(web): redesign ManualPage com home search-first e índice com excerpts"
```

---

## Task 5: Web `ManualReaderPage.tsx` — Breadcrumb + Favorites + Footnotes

**Files:**
- Modify: `apps/web/src/routes/manual/ManualReaderPage.tsx`

- [ ] **Step 5.1: Rewrite ManualReaderPage**

Replace the entire file content:

```tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { manualService } from '@/services/manual';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useManualStorage } from '@/hooks/useManualStorage';

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = 'manual-font-size';

export function ManualReaderPage() {
    const { '*': articleId } = useParams();
    const { isFavorite, toggleFavorite, addRecent } = useManualStorage();

    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem(FONT_KEY);
        return saved ? parseInt(saved) : 18;
    });

    const { data: article, isLoading, isError } = useQuery({
        queryKey: ['manual-article', articleId],
        queryFn: () => manualService.getArticle(articleId!),
        enabled: !!articleId,
    });

    useEffect(() => {
        if (article) {
            addRecent({
                id: article.id,
                number: article.number,
                excerpt: article.text.slice(0, 80),
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [article?.id]);

    const handleFontSize = (delta: number) => {
        const next = Math.max(FONT_MIN, Math.min(FONT_MAX, fontSize + delta));
        setFontSize(next);
        localStorage.setItem(FONT_KEY, String(next));
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center">
                <h2 className="text-lg font-bold text-red-600">Artigo não encontrado</h2>
                <Link to={ROUTES.PUBLIC.MANUAL} className="mt-4 text-sm text-green-700 hover:underline block">
                    Voltar ao índice
                </Link>
            </div>
        );
    }

    const favorited = isFavorite(article.id);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-300">
            {/* Header card */}
            <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <Link
                        to={ROUTES.PUBLIC.MANUAL}
                        className="shrink-0 text-gray-400 transition-colors hover:text-green-700"
                        title="Voltar ao índice"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="font-serif text-lg font-bold text-gray-900">Artigo {article.number}</h1>
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1 flex-wrap mt-0.5" aria-label="Localização no manual">
                            <span className="text-xs text-gray-400">{article.context.part_title}</span>
                            <span className="text-xs text-gray-300">›</span>
                            <span className="text-xs text-gray-400">{article.context.chapter_title}</span>
                            {article.context.section_title && (
                                <>
                                    <span className="text-xs text-gray-300">›</span>
                                    <span className="text-xs text-gray-400">{article.context.section_title}</span>
                                </>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleFontSize(-2)}
                            disabled={fontSize <= FONT_MIN}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs text-gray-400">{fontSize}px</span>
                        <button
                            onClick={() => handleFontSize(2)}
                            disabled={fontSize >= FONT_MAX}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <button
                        onClick={() => toggleFavorite(article.id)}
                        className={`ml-auto flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                            favorited
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-gray-200 text-gray-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                    >
                        <Star size={13} className={favorited ? 'fill-amber-500 text-amber-500' : ''} />
                        {favorited ? 'Favoritado' : 'Favoritar'}
                    </button>
                </div>
            </div>

            {/* Article content */}
            <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10 min-h-[400px]">
                <div
                    className="max-w-none text-gray-800 leading-relaxed transition-all duration-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {article.structure && article.structure.length > 0 ? (
                        <div className="space-y-4">
                            {article.structure.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    className={`
                                        ${item.type === 'caput' ? 'text-justify' : ''}
                                        ${item.type === 'section' ? 'pl-4 sm:pl-6 border-l-2 border-green-200' : ''}
                                        ${item.type === 'paragraph' ? 'pl-4' : ''}
                                    `}
                                >
                                    {item.marker && (
                                        <span className="inline-block font-bold text-green-700 mr-2 mb-1">{item.marker}</span>
                                    )}
                                    <span className="text-justify">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-justify">{article.text}</p>
                    )}
                </div>

                {/* Footnotes */}
                {article.notes && article.notes.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Referências</p>
                        <div className="space-y-2">
                            {article.notes.map(note => (
                                <div key={note.id} className="flex gap-2">
                                    <span className="shrink-0 text-xs font-bold text-green-700 min-w-[2rem]">{note.number}</span>
                                    {note.text && <span className="text-xs text-gray-600">{note.text}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating navigation */}
            <div className="sticky bottom-4 z-10 flex justify-between">
                {article.navigation.previous ? (
                    <Link
                        to={ROUTES.PUBLIC.MANUAL_ARTICLE(article.navigation.previous.id)}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg transition-all hover:-translate-x-0.5 hover:border-green-200 hover:bg-green-50"
                    >
                        <ChevronLeft size={18} />
                        <span className="hidden sm:inline">Art. {article.navigation.previous.number}</span>
                    </Link>
                ) : <div />}

                {article.navigation.next ? (
                    <Link
                        to={ROUTES.PUBLIC.MANUAL_ARTICLE(article.navigation.next.id)}
                        className="flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-700/20 transition-all hover:translate-x-0.5 hover:bg-green-800"
                    >
                        <span className="hidden sm:inline">Art. {article.navigation.next.number}</span>
                        <span className="sm:hidden text-sm">Próximo</span>
                        <ChevronRight size={18} />
                    </Link>
                ) : <div />}
            </div>
        </div>
    );
}
```

- [ ] **Step 5.2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -i "manual" | head -20
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add apps/web/src/routes/manual/ManualReaderPage.tsx
git commit -m "feat(web): leitor do Manual com breadcrumb, favoritos e notas como rodapé"
```

---

## Task 6: Tauri `ManualScreen.tsx` — Home + Index

**Files:**
- Rewrite: `apps/tauri/src/routes/public/ManualScreen.tsx`

- [ ] **Step 6.1: Rewrite ManualScreen**

Replace the entire file content:

```tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, Search, Star, X } from "lucide-react";
import { useManualStructure, useManualSearch } from "@/hooks/useManual";
import { useManualStorage } from "@/hooks/useManualStorage";

export function ManualScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBrowse, setShowBrowse] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const { recent, isFavorite } = useManualStorage();
  const { data: structure, isLoading } = useManualStructure();
  const { data: searchResults, isFetching: isSearching } = useManualSearch(searchQuery);

  const isSearchActive = searchQuery.length >= 2;

  const favoriteArticles = useMemo(() => {
    if (!structure) return [];
    const result: Array<{ id: string; number: string; excerpt: string }> = [];
    for (const part of structure.parts) {
      for (const chapter of part.chapters) {
        for (const article of chapter.articles) {
          if (isFavorite(article.id)) result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? "" });
        }
        for (const section of chapter.sections) {
          for (const article of section.articles) {
            if (isFavorite(article.id)) result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? "" });
          }
        }
      }
    }
    return result;
  }, [structure, isFavorite]);

  const togglePart = (id: string) => setExpandedParts(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleChapter = (id: string) => setExpandedChapters(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in px-4 py-6 duration-300 sm:px-6">
      {/* Header */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 shadow-md shadow-green-700/20">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-gray-900">Manual Presbiteriano</h1>
            <p className="text-xs text-gray-500">Edição {structure?.metadata.editionYear} · {structure?.total_articles} artigos</p>
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar artigo, tema ou palavra-chave…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
          {searchQuery && !isSearching && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-700" />
            </div>
          )}
        </div>
      </div>

      {/* Search results */}
      {isSearchActive && searchResults && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500">{searchResults.count} resultado(s) para "{searchQuery}"</p>
          </div>
          {searchResults.results.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Nenhum resultado encontrado.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {searchResults.results.map(result => (
                <button
                  key={result.id}
                  onClick={() => navigate(`/manual/${encodeURIComponent(result.id)}`)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-green-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-700">
                    {result.number}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm text-gray-700">{result.excerpt}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{result.chapter}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Home */}
      {!isSearchActive && !showBrowse && (
        <>
          {(recent.length > 0 || favoriteArticles.length > 0) && (
            <div className="mb-5 grid grid-cols-2 gap-4">
              {recent.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Recentes</p>
                  <div className="space-y-2">
                    {recent.map(art => (
                      <button
                        key={art.id}
                        onClick={() => navigate(`/manual/${encodeURIComponent(art.id)}`)}
                        className="flex w-full items-start gap-2 text-left group"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-green-50 text-xs font-bold text-green-700 group-hover:bg-green-100">
                          {art.number}
                        </span>
                        <p className="line-clamp-2 text-xs text-gray-600 group-hover:text-green-700 transition-colors">{art.excerpt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {favoriteArticles.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">⭐ Favoritos</p>
                  <div className="space-y-2">
                    {favoriteArticles.map(art => (
                      <button
                        key={art.id}
                        onClick={() => navigate(`/manual/${encodeURIComponent(art.id)}`)}
                        className="flex w-full items-start gap-2 text-left group"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-50 text-xs font-bold text-amber-700 group-hover:bg-amber-100">
                          {art.number}
                        </span>
                        <p className="line-clamp-2 text-xs text-gray-600 group-hover:text-green-700 transition-colors">{art.excerpt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setShowBrowse(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-sm transition hover:border-green-200 hover:bg-green-50"
          >
            <BookOpen size={16} />
            Navegar pelo índice completo
          </button>
        </>
      )}

      {/* Browse index */}
      {!isSearchActive && showBrowse && structure && (
        <>
          <button
            onClick={() => setShowBrowse(false)}
            className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" /> Voltar
          </button>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {structure.parts.map(part => (
              <div key={part.id} className="border-b border-gray-50 last:border-b-0">
                <button
                  onClick={() => togglePart(part.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                >
                  {expandedParts.has(part.id)
                    ? <ChevronDown size={16} className="shrink-0 text-green-600" />
                    : <ChevronRight size={16} className="shrink-0 text-gray-400" />}
                  <span className="flex-1 text-sm font-semibold text-gray-900">{part.title}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">{part.chapters.length} caps</span>
                </button>

                {expandedParts.has(part.id) && (
                  <div className="border-t border-gray-50">
                    {part.chapters.map(chapter => (
                      <div key={chapter.id} className="border-b border-gray-50 last:border-b-0">
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="flex w-full items-center gap-3 py-2.5 pl-8 pr-4 text-left transition-colors hover:bg-gray-50"
                        >
                          {expandedChapters.has(chapter.id)
                            ? <ChevronDown size={14} className="shrink-0 text-green-600" />
                            : <ChevronRight size={14} className="shrink-0 text-gray-400" />}
                          <span className="shrink-0 text-xs font-bold text-green-700">Cap. {chapter.number}</span>
                          <span className="truncate text-sm text-gray-700">{chapter.title}</span>
                        </button>

                        {expandedChapters.has(chapter.id) && (
                          <div className="border-t border-gray-50 bg-gray-50/50">
                            {chapter.articles.map(article => (
                              <button
                                key={article.id}
                                onClick={() => navigate(`/manual/${encodeURIComponent(article.id)}`)}
                                className="flex w-full items-start gap-3 py-2 pl-14 pr-4 text-left transition-colors hover:bg-green-50 group"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-xs font-bold text-green-700 group-hover:border-green-300">
                                  {article.number}
                                </span>
                                <p className="line-clamp-1 flex-1 text-xs text-gray-600 group-hover:text-green-800">{article.excerpt}</p>
                                {isFavorite(article.id) && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                              </button>
                            ))}
                            {chapter.sections.map(section => (
                              <div key={section.id}>
                                <p className="border-t border-gray-100 py-1.5 pl-14 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  {section.number} — {section.title}
                                </p>
                                {section.articles.map(article => (
                                  <button
                                    key={article.id}
                                    onClick={() => navigate(`/manual/${encodeURIComponent(article.id)}`)}
                                    className="flex w-full items-start gap-3 py-2 pl-14 pr-4 text-left transition-colors hover:bg-green-50 group"
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-xs font-bold text-green-700 group-hover:border-green-300">
                                      {article.number}
                                    </span>
                                    <p className="line-clamp-1 flex-1 text-xs text-gray-600 group-hover:text-green-800">{article.excerpt}</p>
                                    {isFavorite(article.id) && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6.2: Add `useManualSearch` to Tauri hook**

Check if `apps/tauri/src/hooks/useManual.ts` already exports `useManualSearch`. If not, add:

```typescript
export function useManualSearch(query: string) {
  return useQuery({
    queryKey: ["manual-search", query],
    queryFn: () => manualService.search(query),
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}
```

- [ ] **Step 6.3: Verify TypeScript**

```bash
cd apps/tauri && npx tsc --noEmit 2>&1 | grep -i "manual" | head -20
```

Expected: no errors.

- [ ] **Step 6.4: Commit**

```bash
git add apps/tauri/src/routes/public/ManualScreen.tsx apps/tauri/src/hooks/useManual.ts
git commit -m "feat(tauri): redesign ManualScreen com home search-first e índice com excerpts"
```

---

## Task 7: Tauri `ManualArticleScreen.tsx` — Reader redesign

**Files:**
- Rewrite: `apps/tauri/src/routes/public/ManualArticleScreen.tsx`

- [ ] **Step 7.1: Rewrite ManualArticleScreen**

Replace the entire file content:

```tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Star } from "lucide-react";
import { useManualArticle } from "@/hooks/useManual";
import { useManualStorage } from "@/hooks/useManualStorage";

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = "manual-font-size";

export function ManualArticleScreen() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, addRecent } = useManualStorage();

  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? parseInt(stored, 10) : 18;
  });

  const { data: article, isLoading } = useManualArticle(articleId);

  useEffect(() => {
    if (article) {
      addRecent({
        id: article.id,
        number: article.number,
        excerpt: article.text.slice(0, 80),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  const handleFontSize = (delta: number) => {
    setFontSize(cur => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, cur + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-600">Artigo não encontrado</h2>
        <button onClick={() => navigate("/manual")} className="mt-4 text-sm text-green-700 hover:underline">
          Voltar ao índice
        </button>
      </div>
    );
  }

  const favorited = isFavorite(article.id);

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in px-4 py-6 duration-300 sm:px-6">
      {/* Header card */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <Link to="/manual" className="shrink-0 text-gray-400 transition-colors hover:text-green-700" title="Voltar ao índice">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900">Artigo {article.number}</h1>
            {article.context && (
              <nav className="mt-0.5 flex flex-wrap items-center gap-1" aria-label="Localização no manual">
                <span className="text-xs text-gray-400">{article.context.part_title}</span>
                <span className="text-xs text-gray-300">›</span>
                <span className="text-xs text-gray-400">{article.context.chapter_title}</span>
                {article.context.section_title && (
                  <>
                    <span className="text-xs text-gray-300">›</span>
                    <span className="text-xs text-gray-400">{article.context.section_title}</span>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFontSize(-2)}
              disabled={fontSize <= FONT_MIN}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-xs text-gray-400">{fontSize}px</span>
            <button
              onClick={() => handleFontSize(2)}
              disabled={fontSize >= FONT_MAX}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={() => toggleFavorite(article.id)}
            className={`ml-auto flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
              favorited
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 text-gray-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <Star size={13} className={favorited ? "fill-amber-500 text-amber-500" : ""} />
            {favorited ? "Favoritado" : "Favoritar"}
          </button>
        </div>
      </div>

      {/* Article content */}
      <div className="mb-6 min-h-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <div
          className="max-w-none text-gray-800 leading-relaxed transition-all duration-200"
          style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
        >
          {article.structure && article.structure.length > 0 ? (
            <div className="space-y-4">
              {article.structure.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`
                    ${item.type === "caput" ? "text-justify" : ""}
                    ${item.type === "section" ? "border-l-2 border-green-200 pl-4 sm:pl-6" : ""}
                    ${item.type === "paragraph" ? "pl-4" : ""}
                  `}
                >
                  {item.marker && (
                    <span className="mb-1 mr-2 inline-block font-bold text-green-700">{item.marker}</span>
                  )}
                  <span className="text-justify">{item.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-justify">{article.text}</p>
          )}
        </div>

        {/* Footnotes */}
        {article.notes && article.notes.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Referências</p>
            <div className="space-y-2">
              {article.notes.map(note => (
                <div key={note.id} className="flex gap-2">
                  <span className="min-w-[2rem] shrink-0 text-xs font-bold text-green-700">{note.number}</span>
                  {note.text && <span className="text-xs text-gray-600">{note.text}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating navigation */}
      <div className="sticky bottom-4 z-10 flex justify-between">
        {article.navigation.previous ? (
          <button
            onClick={() => navigate(`/manual/${encodeURIComponent(article.navigation.previous!.id)}`)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg transition-all hover:-translate-x-0.5 hover:border-green-200 hover:bg-green-50"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Art. {article.navigation.previous.number}</span>
          </button>
        ) : <div />}

        {article.navigation.next ? (
          <button
            onClick={() => navigate(`/manual/${encodeURIComponent(article.navigation.next!.id)}`)}
            className="flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-700/20 transition-all hover:translate-x-0.5 hover:bg-green-800"
          >
            <span className="hidden sm:inline">Art. {article.navigation.next.number}</span>
            <span className="text-sm sm:hidden">Próximo</span>
            <ChevronRight size={18} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Verify TypeScript**

```bash
cd apps/tauri && npx tsc --noEmit 2>&1 | grep -i "manual" | head -20
```

Expected: no errors.

- [ ] **Step 7.3: Commit and push**

```bash
git add apps/tauri/src/routes/public/ManualArticleScreen.tsx
git commit -m "feat(tauri): leitor do Manual com breadcrumb, favoritos e notas como rodapé"
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ Backend: `excerpt` (Task 1) and `context` (Task 1)
- ✅ Home: search + recents + favorites (Tasks 4, 6)
- ✅ Índice: accordion com excerpts dos artigos (Tasks 4, 6)
- ✅ Leitor: breadcrumb, favoritar, notas no rodapé, controle de fonte (Tasks 5, 7)
- ✅ Persistência localStorage: `useManualStorage` (Task 3)
- ✅ Ambas plataformas: web (Tasks 4-5) e Tauri (Tasks 6-7)

**Gaps identificados:**
- Task 6 referencia `useManualSearch` que pode não existir no Tauri — coberto no Step 6.2
- `useManualArticle` no Tauri precisa retornar `ArticleContext` — coberto pelo type update no Task 2

**Tipo consistência:**
- `RecentArticle` definido no Task 3, usado nos Tasks 4-7 ✅
- `ArticleContext` definido no Task 2, usado nos Tasks 5 e 7 ✅
- `excerpt?: string` em `ManualArticleSummary` usado em Tasks 4 e 6 ✅
