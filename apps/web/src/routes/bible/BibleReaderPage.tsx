import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../services/bible';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export function BibleReaderPage() {
    const { book, chapter } = useParams();
    const chapterNum = parseInt(chapter || '1');

    const { data: content, isLoading, isError } = useQuery({
        queryKey: ['bible', book, chapterNum],
        queryFn: () => bibleService.getChapter(book!, chapterNum),
        enabled: !!book
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-gray-500">Carregando escritura...</div>
            </div>
        );
    }

    if (isError || !content) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Capítulo não encontrado</h2>
                <Link to="/bible" className="text-green-700 hover:underline">Voltar para índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <Link to="/bible" className="text-gray-500 hover:text-green-700 flex items-center gap-2 text-sm font-medium transition-colors">
                    <ArrowLeft size={18} /> Voltar aos Livros
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                        {content.book_name} {content.chapter}
                    </h1>
                </div>
                <div className="w-24 hidden sm:block"></div> {/* Spacer for centering */}
            </div>

            {/* Verses Content */}
            <div className="prose prose-lg prose-green mx-auto text-gray-800 leading-relaxed font-serif">
                {content.verses.map((verse, idx) => (
                    <span key={idx} className="relative group hover:bg-yellow-50/50 rounded px-1 transition-colors">
                        <sup className="text-gray-400 text-xs font-semibold mr-1 select-none">{idx + 1}</sup>
                        <span className="text-lg">{verse} </span>
                    </span>
                ))}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur py-4 border-t-2 border-green-50">
                {content.previous_chapter ? (
                    <Link
                        to={`/bible/${content.previous_chapter.book}/${content.previous_chapter.chapter}`}
                        className="flex items-center gap-2 text-green-700 font-medium hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline">Anterior ({content.previous_chapter.book.toUpperCase()} {content.previous_chapter.chapter})</span>
                        <span className="sm:hidden">Ant</span>
                    </Link>
                ) : <div></div>}

                {content.next_chapter ? (
                    <Link
                        to={`/bible/${content.next_chapter.book}/${content.next_chapter.chapter}`}
                        className="flex items-center gap-2 text-green-700 font-medium hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        <span className="hidden sm:inline">Próximo ({content.next_chapter.book.toUpperCase()} {content.next_chapter.chapter})</span>
                        <span className="sm:hidden">Próx</span>
                        <ChevronRight size={20} />
                    </Link>
                ) : <div></div>}
            </div>
        </div>
    )
}
