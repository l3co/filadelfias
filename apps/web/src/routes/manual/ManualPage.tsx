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
                    if (isFavorite(article.id)) {
                        result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? '' });
                    }
                }
                for (const section of chapter.sections) {
                    for (const article of section.articles) {
                        if (isFavorite(article.id)) {
                            result.push({ id: article.id, number: article.number, excerpt: article.excerpt ?? '' });
                        }
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
                        <p className="text-xs text-gray-500">
                            Edição {structure?.metadata.editionYear} · {structure?.total_articles} artigos
                        </p>
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
                    {searchQuery && !isSearching && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
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
                        <p className="text-xs font-semibold text-gray-500">
                            {searchResults.count} resultado(s) para &ldquo;{searchQuery}&rdquo;
                        </p>
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

            {/* Home view */}
            {!isSearchActive && !showBrowse && (
                <>
                    {(recent.length > 0 || favoriteArticles.length > 0) && (
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            {recent.length > 0 && (
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Recentes</p>
                                    <div className="space-y-2">
                                        {recent.map(art => (
                                            <Link
                                                key={art.id}
                                                to={ROUTES.PUBLIC.MANUAL_ARTICLE(art.id)}
                                                className="flex items-start gap-2 group"
                                            >
                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-green-50 text-xs font-bold text-green-700 group-hover:bg-green-100">
                                                    {art.number}
                                                </span>
                                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                    {art.excerpt}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {favoriteArticles.length > 0 && (
                                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">⭐ Favoritos</p>
                                    <div className="space-y-2">
                                        {favoriteArticles.map(art => (
                                            <Link
                                                key={art.id}
                                                to={ROUTES.PUBLIC.MANUAL_ARTICLE(art.id)}
                                                className="flex items-start gap-2 group"
                                            >
                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-amber-50 text-xs font-bold text-amber-700 group-hover:bg-amber-100">
                                                    {art.number}
                                                </span>
                                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                    {art.excerpt}
                                                </p>
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

            {/* Browse view */}
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
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {part.chapters.length} caps
                                    </span>
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
                                                    <span className="text-xs font-bold text-green-700 shrink-0">
                                                        Cap. {chapter.number}
                                                    </span>
                                                    <span className="text-sm text-gray-700 truncate">{chapter.title}</span>
                                                </button>

                                                {expandedChapters.has(chapter.id) && (
                                                    <div className="border-t border-gray-50 bg-gray-50/50">
                                                        {chapter.articles.map(article => (
                                                            <Link
                                                                key={article.id}
                                                                to={ROUTES.PUBLIC.MANUAL_ARTICLE(article.id)}
                                                                className="flex items-start gap-3 pl-14 pr-4 py-2 hover:bg-green-50 transition-colors group"
                                                            >
                                                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-white border border-gray-200 text-xs font-bold text-green-700 group-hover:border-green-300">
                                                                    {article.number}
                                                                </span>
                                                                <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-green-800 flex-1">
                                                                    {article.excerpt}
                                                                </p>
                                                                {isFavorite(article.id) && (
                                                                    <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />
                                                                )}
                                                            </Link>
                                                        ))}
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
                                                                        <p className="text-xs text-gray-600 line-clamp-1 group-hover:text-green-800 flex-1">
                                                                            {article.excerpt}
                                                                        </p>
                                                                        {isFavorite(article.id) && (
                                                                            <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />
                                                                        )}
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
