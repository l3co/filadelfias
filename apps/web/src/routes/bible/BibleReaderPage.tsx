import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../services/bible';
import { ChevronLeft, ChevronRight, ArrowLeft, Minus, Plus, Volume2, Square, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useBibleVersion } from '../../hooks/useBibleVersion';
import { BibleVersionSelector } from '../../features/bible/components/BibleVersionSelector';

export function BibleReaderPage() {
    const { book, chapter } = useParams();
    const chapterNum = parseInt(chapter || '1');
    const { version, setVersion } = useBibleVersion();

    // Estado para controle de fonte (persistido)
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('bible-font-size');
        return saved ? parseInt(saved) : 18;
    });

    // Estado para TTS
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Estado para mostrar/esconder seletor de capítulos
    const [showChapters, setShowChapters] = useState(false);

    const { data: content, isLoading, isError } = useQuery({
        queryKey: ['bible', book, chapterNum, version],
        queryFn: () => bibleService.getChapter(book!, chapterNum, version),
        enabled: !!book
    });
    
    // Buscar lista de livros para saber quantos capítulos tem
    const { data: books } = useQuery({
        queryKey: ['bible-books', version],
        queryFn: () => bibleService.getBooks(version),
        staleTime: Infinity
    });
    
    const currentBook = books?.find(b => b.abbrev === book);
    const totalChapters = currentBook?.chapters_count || 0;

    // Cleanup de áudio ao mudar de capítulo ou desmontar
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [book, chapterNum]);

    const handleFontSize = (delta: number) => {
        const newSize = Math.max(14, Math.min(32, fontSize + delta));
        setFontSize(newSize);
        localStorage.setItem('bible-font-size', String(newSize));
    };

    const toggleAudio = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            if (!content) return;
            const text = `${content.book_name}, capítulo ${content.chapter}. ${content.verses.join(' ')}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 1;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (isError || !content) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow mt-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">Capítulo não encontrado</h2>
                <Link to="/bible" className="text-green-700 hover:underline">Voltar para índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-500">
            {/* Compact Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                {/* Top row: Back + Title + Version */}
                <div className="flex items-center gap-3 mb-3">
                    <Link 
                        to="/bible" 
                        className="flex items-center gap-1 text-gray-500 hover:text-green-700 transition-colors shrink-0"
                        title="Voltar aos Livros"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900 truncate">
                            {content.book_name}
                        </h1>
                        <p className="text-sm text-gray-500">Capítulo {content.chapter}</p>
                    </div>
                    
                    <BibleVersionSelector currentVersion={version} onVersionChange={setVersion} />
                </div>
                
                {/* Toolbar row */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFontSize(-2)}
                            disabled={fontSize <= 14}
                            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-green-700"
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
                            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-green-700"
                            title="Aumentar fonte"
                        >
                            <Plus size={16} />
                        </Button>
                    </div>
                    
                    <Button
                        variant={isSpeaking ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleAudio}
                        className={`h-8 px-3 gap-2 ${!isSpeaking && 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                        title={isSpeaking ? "Parar leitura" : "Ouvir capítulo"}
                    >
                        {isSpeaking ? <Square size={14} className="fill-current" /> : <Volume2 size={14} />}
                        <span className="text-xs font-medium">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                    </Button>
                </div>
            </div>
            
            {/* Chapter Navigation Grid */}
            {totalChapters > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <button
                        onClick={() => setShowChapters(!showChapters)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors w-full"
                    >
                        <BookOpen size={16} />
                        <span>Capítulos de {content.book_name}</span>
                        <span className="text-gray-400 text-xs">({totalChapters} capítulos)</span>
                        <ChevronRight 
                            size={16} 
                            className={`ml-auto transition-transform ${showChapters ? 'rotate-90' : ''}`} 
                        />
                    </button>
                    
                    {showChapters && (
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mt-4 pt-4 border-t border-gray-100">
                            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((num) => (
                                <Link
                                    key={num}
                                    to={`/bible/${book}/${num}`}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                        ${num === chapterNum 
                                            ? 'bg-green-700 text-white shadow-md' 
                                            : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-200'
                                        }
                                    `}
                                >
                                    {num}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Verses Content */}
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                <div
                    className="prose prose-lg prose-green max-w-none text-gray-800 leading-loose font-serif transition-all duration-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {content.verses.map((verse, idx) => (
                        <span key={idx} className="relative group hover:bg-green-100 rounded transition-colors inline">
                            <sup
                                className="text-green-600 font-bold mr-1 select-none cursor-default"
                                style={{ fontSize: `${Math.max(10, fontSize * 0.6)}px`, top: '-0.5em' }}
                            >
                                {idx + 1}
                            </sup>
                            <span className="text-inherit">{verse} </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between mt-8 sticky bottom-4 z-10">
                {/* Previous Button */}
                {content.previous_chapter ? (
                    <Link
                        to={`/bible/${content.previous_chapter.book}/${content.previous_chapter.chapter}`}
                        className="flex items-center gap-2 bg-white text-green-700 font-medium hover:bg-green-50 hover:border-green-200 border border-gray-200 px-4 py-3 rounded-full shadow-lg transition-all hover:-translate-x-1"
                    >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline text-sm">
                            {content.previous_chapter.book.toUpperCase()} {content.previous_chapter.chapter}
                        </span>
                    </Link>
                ) : <div />}

                {/* Next Button */}
                {content.next_chapter ? (
                    <Link
                        to={`/bible/${content.next_chapter.book}/${content.next_chapter.chapter}`}
                        className="flex items-center gap-2 bg-green-700 text-white font-medium hover:bg-green-800 px-6 py-3 rounded-full shadow-lg shadow-green-700/20 transition-all hover:translate-x-1"
                    >
                        <span className="hidden sm:inline text-sm">
                            {content.next_chapter.book.toUpperCase()} {content.next_chapter.chapter}
                        </span>
                        <span className="sm:hidden text-sm">Próximo</span>
                        <ChevronRight size={20} />
                    </Link>
                ) : <div />}
            </div>
        </div>
    );
}
