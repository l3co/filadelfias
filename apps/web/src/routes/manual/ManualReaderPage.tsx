import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { manualService } from '@/services/manual';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ManualReaderPage() {
    const { '*': articleId } = useParams();
    
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('manual-font-size');
        return saved ? parseInt(saved) : 18;
    });

    const { data: article, isLoading, isError } = useQuery({
        queryKey: ['manual-article', articleId],
        queryFn: () => manualService.getArticle(articleId!),
        enabled: !!articleId
    });

    const handleFontSize = (delta: number) => {
        const newSize = Math.max(14, Math.min(32, fontSize + delta));
        setFontSize(newSize);
        localStorage.setItem('manual-font-size', String(newSize));
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow mt-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">Artigo não encontrado</h2>
                <Link to="/manual" className="text-green-700 hover:underline">Voltar para o índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <Link 
                        to="/manual" 
                        className="flex items-center gap-1 text-gray-500 hover:text-green-700 transition-colors shrink-0"
                        title="Voltar ao índice"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-green-600 shrink-0" />
                            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                                Artigo {article.number}
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500">Manual Presbiteriano 2019</p>
                    </div>
                    
                    {/* Font size controls */}
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFontSize(-2)}
                            disabled={fontSize <= 14}
                            className="h-8 w-8 p-0 hover:bg-white hover:text-green-700"
                            title="Diminuir fonte"
                        >
                            <Minus size={16} />
                        </Button>
                        <span className="text-xs font-mono w-10 text-center text-gray-400">{fontSize}px</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFontSize(2)}
                            disabled={fontSize >= 32}
                            className="h-8 w-8 p-0 hover:bg-white hover:text-green-700"
                            title="Aumentar fonte"
                        >
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                <div
                    className="max-w-none text-gray-800 leading-relaxed transition-all duration-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {/* Structured content - renderiza parágrafos separadamente */}
                    {article.structure && article.structure.length > 0 ? (
                        <div className="space-y-4">
                            {article.structure.map((item, idx) => (
                                <div 
                                    key={item.id || idx} 
                                    id={item.id}
                                    className={`
                                        ${item.type === 'caput' ? 'text-justify' : ''}
                                        ${item.type === 'section' ? 'pl-4 sm:pl-6 border-l-2 border-green-200' : ''}
                                        ${item.type === 'paragraph' ? 'pl-4' : ''}
                                    `}
                                >
                                    {item.marker && (
                                        <span className="inline-block font-bold text-green-700 mr-2 mb-1">
                                            {item.marker}
                                        </span>
                                    )}
                                    <span className="text-justify">{item.text}</span>
                                    
                                    {/* Indicador de notas no parágrafo */}
                                    {item.notes && item.notes.length > 0 && (
                                        <span className="ml-1 text-xs text-gray-400">
                                            [{item.notes.length} nota{item.notes.length > 1 ? 's' : ''}]
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-justify">{article.text}</p>
                    )}
                </div>

                {/* Notes - exibe referências de notas */}
                {article.notes && article.notes.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Referências ({article.notes.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {article.notes.map((note) => (
                                <span 
                                    key={note.id} 
                                    className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                                    title={`Nota ${note.number}`}
                                >
                                    {note.number}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between mt-8 sticky bottom-4 z-10">
                {article.navigation.previous ? (
                    <Link
                        to={`/manual/${article.navigation.previous.id}`}
                        className="flex items-center gap-2 bg-white text-green-700 font-medium hover:bg-green-50 hover:border-green-200 border border-gray-200 px-4 py-3 rounded-full shadow-lg transition-all hover:-translate-x-1"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm">Art. {article.navigation.previous.number}</span>
                    </Link>
                ) : <div />}

                {article.navigation.next ? (
                    <Link
                        to={`/manual/${article.navigation.next.id}`}
                        className="flex items-center gap-2 bg-green-700 text-white font-medium hover:bg-green-800 px-6 py-3 rounded-full shadow-lg shadow-green-700/20 transition-all hover:translate-x-1"
                    >
                        <span className="text-sm">Art. {article.navigation.next.number}</span>
                        <ChevronRight size={20} />
                    </Link>
                ) : <div />}
            </div>
        </div>
    );
}
