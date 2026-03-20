import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hymnalService } from '../../services/hymnal';
import { ArrowLeft, Minus, Plus, Volume2, Square } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/routes';

export function HymnalReaderPage() {
    const { number } = useParams();
    const hymnNum = parseInt(number || '1');

    // Estado para controle de fonte (persistido) - Default maior 20px
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('hymnal-font-size');
        return saved ? parseInt(saved) : 20;
    });

    // Estado para TTS
    const [isSpeaking, setIsSpeaking] = useState(false);

    const { data: hymn, isLoading, isError } = useQuery({
        queryKey: ['hymn', hymnNum],
        queryFn: () => hymnalService.getHymn(hymnNum),
        enabled: !!number
    });

    // Cleanup de áudio
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [hymnNum]);

    const handleFontSize = (delta: number) => {
        const newSize = Math.max(16, Math.min(40, fontSize + delta));
        setFontSize(newSize);
        localStorage.setItem('hymnal-font-size', String(newSize));
    };

    const toggleAudio = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            if (!hymn) return;
            // Texto para leitura: Número, Título, Autor (pausa), Letra.
            const text = `Hino ${hymn.number}: ${hymn.title}. De ${hymn.author || 'Autor desconhecido'}. ${hymn.lyrics.join('. ')}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9; // Um pouco mais lento para hinos
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

    if (isError || !hymn) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow mt-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">Hino não encontrado</h2>
                <Link to={ROUTES.PUBLIC.HYMNAL} className="text-green-700 hover:underline">Voltar para índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 relative animate-in fade-in duration-500">
            {/* Header com Navegação e Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div>
                    <Link to={ROUTES.PUBLIC.HYMNAL} className="text-gray-500 hover:text-green-700 flex items-center gap-2 text-sm font-medium transition-colors">
                        <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar ao Hinário</span>
                        <span className="sm:hidden">Voltar</span>
                    </Link>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFontSize(-2)}
                        disabled={fontSize <= 16}
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
                        disabled={fontSize >= 40}
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
                        title={isSpeaking ? "Parar leitura" : "Ouvir hino"}
                    >
                        {isSpeaking ? <Square size={16} className="fill-current" /> : <Volume2 size={16} />}
                        <span className="text-xs font-medium hidden sm:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                    </Button>
                </div>
            </div>

            <div className="text-center mb-10 mt-4">
                <div className="inline-block px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full mb-3 text-sm">
                    Hino {hymn.number}
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">{hymn.title}</h1>
                <p className="text-gray-500 italic font-serif text-sm sm:text-base">{hymn.author}</p>
            </div>

            <div className="bg-white p-6 sm:p-12 rounded-2xl shadow-sm border border-gray-100 transition-all duration-200">
                <div
                    className="prose prose-lg prose-green mx-auto text-center font-serif leading-loose text-gray-800"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {hymn.lyrics.map((line, idx) => (
                        <p key={idx} className={`mb-0 ${line === '' ? 'h-8' : ''}`}>
                            {line || <br />}
                        </p>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Novo Cântico - Hinário Presbiteriano
            </div>
        </div>
    )
}
