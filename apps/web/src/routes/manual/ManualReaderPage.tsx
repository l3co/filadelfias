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
