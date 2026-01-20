import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { manualService } from '@/services/manual';
import { BookOpen, ChevronRight, Search, FileText } from 'lucide-react';

export function ManualPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set(['p0']));
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    const { data: structure, isLoading } = useQuery({
        queryKey: ['manual-structure'],
        queryFn: manualService.getStructure,
        staleTime: Infinity
    });

    const { data: searchResults, isFetching: isSearching } = useQuery({
        queryKey: ['manual-search', searchQuery],
        queryFn: () => manualService.search(searchQuery),
        enabled: searchQuery.length >= 2,
        staleTime: 30000
    });

    const togglePart = (partId: string) => {
        setExpandedParts(prev => {
            const next = new Set(prev);
            if (next.has(partId)) {
                next.delete(partId);
            } else {
                next.add(partId);
            }
            return next;
        });
    };

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                    <BookOpen className="w-6 h-6 text-green-700" />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-1">
                    Manual Presbiteriano
                </h1>
                <p className="text-gray-600 text-sm">
                    Edição {structure?.metadata.editionYear} • {structure?.total_articles} artigos
                </p>
            </div>

            {/* Search */}
            <div className="relative w-full mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar no manual..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
                    <h2 className="text-sm font-medium text-gray-500 mb-3">
                        {searchResults.count} resultado(s) para "{searchQuery}"
                    </h2>
                    {searchResults.results.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum resultado encontrado</p>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.results.map((result) => (
                                <Link
                                    key={result.id}
                                    to={`/manual/${result.id}`}
                                    className="block p-3 rounded-lg hover:bg-green-50 transition-colors border border-gray-100"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-sm font-bold">
                                            {result.number}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-600 line-clamp-2">{result.excerpt}</p>
                                            <p className="text-xs text-gray-400 mt-1">{result.chapter}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Table of Contents */}
            {(!searchQuery || searchQuery.length < 2) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {structure?.parts.map((part) => (
                        <div key={part.id} className="border-b border-gray-100 last:border-b-0">
                            <button
                                onClick={() => togglePart(part.id)}
                                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight
                                    size={22}
                                    className={`text-gray-400 transition-transform ${expandedParts.has(part.id) ? 'rotate-90' : ''}`}
                                />
                                <BookOpen size={22} className="text-green-600" />
                                <span className="font-semibold text-gray-900 text-lg">{part.title}</span>
                                <span className="ml-auto text-sm text-gray-400">
                                    {part.chapters.length} capítulos
                                </span>
                            </button>

                            {expandedParts.has(part.id) && (
                                <div className="bg-gray-50 border-t border-gray-100">
                                    {part.chapters.map((chapter) => (
                                        <div key={chapter.id}>
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full flex items-center gap-3 pl-12 pr-4 py-3 text-left hover:bg-gray-100 transition-colors"
                                            >
                                                <ChevronRight
                                                    size={18}
                                                    className={`text-gray-400 transition-transform ${expandedChapters.has(chapter.id) ? 'rotate-90' : ''}`}
                                                />
                                                <span className="text-green-700 font-semibold text-base">
                                                    Cap. {chapter.number}
                                                </span>
                                                <span className="text-gray-700 text-base truncate">
                                                    {chapter.title}
                                                </span>
                                            </button>

                                            {expandedChapters.has(chapter.id) && (
                                                <div className="bg-white border-t border-gray-100">
                                                    {/* Sections */}
                                                    {chapter.sections.map((section) => (
                                                        <div key={section.id} className="pl-20 pr-4 py-2 border-b border-gray-50">
                                                            <p className="text-sm text-gray-600 font-medium mb-2">
                                                                {section.number} – {section.title}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {section.articles.map((article) => (
                                                                    <Link
                                                                        key={article.id}
                                                                        to={`/manual/${article.id}`}
                                                                        className="w-8 h-8 flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-green-100 hover:text-green-700 transition-colors"
                                                                    >
                                                                        {article.number}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Direct articles (no section) */}
                                                    {chapter.articles.length > 0 && (
                                                        <div className="pl-16 pr-4 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {chapter.articles.map((article) => (
                                                                    <Link
                                                                        key={article.id}
                                                                        to={`/manual/${article.id}`}
                                                                        className="w-10 h-10 flex items-center justify-center text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
                                                                    >
                                                                        {article.number}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {chapter.sections.length === 0 && chapter.articles.length === 0 && (
                                                        <p className="pl-20 pr-4 py-2 text-sm text-gray-400 italic">
                                                            <FileText size={14} className="inline mr-1" />
                                                            Conteúdo não disponível
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
