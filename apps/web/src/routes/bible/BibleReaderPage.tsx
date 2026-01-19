import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../services/bible';
import { ChevronLeft, ChevronRight, ArrowLeft, Minus, Plus, Volume2, Square } from 'lucide-react';
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

    const { data: content, isLoading, isError } = useQuery({
        queryKey: ['bible', book, chapterNum, version],
        queryFn: () => bibleService.getChapter(book!, chapterNum, version),
        enabled: !!book
    });

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
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/bible" className="text-gray-500 hover:text-green-700 flex items-center gap-2 text-sm font-medium transition-colors">
                        <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar aos Livros</span>
                    </Link>
                </div>

                <div className="text-center flex-1">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                        {content.book_name} {content.chapter}
                    </h1>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 flex-wrap">
                    <BibleVersionSelector currentVersion={version} onVersionChange={setVersion} />
                    <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
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
                    <span className="text-xs font-mono w-6 text-center text-gray-400">{fontSize}px</span>
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
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <Button
                        variant={isSpeaking ? "destructive" : "ghost"}
                        size="sm"
                        onClick={toggleAudio}
                        className={`h-8 px-2 gap-2 ${!isSpeaking && 'hover:bg-white hover:text-green-700'}`}
                        title={isSpeaking ? "Parar leitura" : "Ouvir capítulo"}
                    >
                        {isSpeaking ? <Square size={16} className="fill-current" /> : <Volume2 size={16} />}
                        <span className="text-xs font-medium hidden sm:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                    </Button>
                </div>
            </div>

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
