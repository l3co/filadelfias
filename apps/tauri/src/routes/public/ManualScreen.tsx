import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
