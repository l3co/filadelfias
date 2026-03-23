import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Minus,
    Plus,
    Volume2,
    Square,
    BookOpen,
    Highlighter,
    NotebookPen,
    Bookmark
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useBibleVersion } from '../../hooks/useBibleVersion';
import { BibleVersionSelector } from '../../features/bible/components/BibleVersionSelector';
import { ROUTES } from '../../lib/routes';
import {
    useBibleBooks,
    useBibleChapter,
    useBibleHighlights,
    useBibleNotes,
    useCreateBibleHighlight,
    useCreateBibleNote,
    useDeleteBibleHighlight,
    useDeleteBibleNote,
    useUpdateBibleNote,
} from '../../hooks/useBible';
import { useAuthTenant, useAuthUser } from '../../contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';

export function BibleReaderPage() {
    const { book, chapter } = useParams();
    const chapterNum = parseInt(chapter || '1');
    const { version, setVersion } = useBibleVersion();
    const tenant = useAuthTenant();
    const user = useAuthUser();

    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('bible-font-size');
        return saved ? parseInt(saved) : 18;
    });
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showChapters, setShowChapters] = useState(false);
    const [isStudyOpen, setIsStudyOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'orange'>('yellow');

    const { data: content, isLoading, isError } = useBibleChapter(book, chapterNum, version);
    const { data: books } = useBibleBooks(version);
    const { data: notes = [] } = useBibleNotes(tenant?.id, { version, book, chapter: chapterNum });
    const { data: highlights = [] } = useBibleHighlights(tenant?.id, { version, book, chapter: chapterNum });
    const createNote = useCreateBibleNote(tenant?.id);
    const updateNote = useUpdateBibleNote(tenant?.id);
    const deleteNote = useDeleteBibleNote(tenant?.id);
    const createHighlight = useCreateBibleHighlight(tenant?.id);
    const deleteHighlight = useDeleteBibleHighlight(tenant?.id);

    const currentBook = books?.find(b => b.abbrev === book);
    const totalChapters = currentBook?.chapters_count || 0;
    const selectedNote = useMemo(() => notes.find((note) => note.verse === selectedVerse), [notes, selectedVerse]);
    const selectedHighlight = useMemo(
        () => highlights.find((highlight) => highlight.verse === selectedVerse),
        [highlights, selectedVerse]
    );

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [book, chapterNum]);

    useEffect(() => {
        setNoteDraft(selectedNote?.content ?? '');
    }, [selectedNote]);

    const handleFontSize = (delta: number) => {
        const newSize = Math.max(14, Math.min(32, fontSize + delta));
        setFontSize(newSize);
        localStorage.setItem('bible-font-size', String(newSize));
    };

    const toggleAudio = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!content) return;
        const text = `${content.book_name}, capítulo ${content.chapter}. ${content.verses.join(' ')}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const openStudyDialog = (verseNumber: number) => {
        setSelectedVerse(verseNumber);
        setIsStudyOpen(true);
    };

    const handleSaveNote = async () => {
        if (!tenant?.id || !book || !selectedVerse || !noteDraft.trim()) return;

        if (selectedNote) {
            await updateNote.mutateAsync({ id: selectedNote.id, content: noteDraft.trim() });
            return;
        }

        await createNote.mutateAsync({
            version_code: version,
            book_abbrev: book,
            chapter: chapterNum,
            verse: selectedVerse,
            content: noteDraft.trim(),
            is_public: false,
        });
    };

    const handleDeleteSelectedNote = async () => {
        if (!selectedNote) return;
        await deleteNote.mutateAsync(selectedNote.id);
        setNoteDraft('');
    };

    const handleToggleHighlight = async () => {
        if (!tenant?.id || !book || !selectedVerse) return;

        if (selectedHighlight) {
            await deleteHighlight.mutateAsync(selectedHighlight.id);
            return;
        }

        await createHighlight.mutateAsync({
            version_code: version,
            book_abbrev: book,
            chapter: chapterNum,
            verse: selectedVerse,
            color: selectedColor,
            category: 'study',
        });
    };

    const highlightClassByColor: Record<string, string> = {
        yellow: 'bg-amber-100/90 ring-1 ring-amber-200',
        green: 'bg-emerald-100/90 ring-1 ring-emerald-200',
        blue: 'bg-sky-100/90 ring-1 ring-sky-200',
        pink: 'bg-pink-100/90 ring-1 ring-pink-200',
        orange: 'bg-orange-100/90 ring-1 ring-orange-200',
    };

    const highlightMap = new Map(highlights.map((highlight) => [highlight.verse, highlight]));

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
                <Link to={ROUTES.PUBLIC.BIBLE} className="text-green-700 hover:underline">Voltar para índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <Link
                        to={ROUTES.PUBLIC.BIBLE}
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

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
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

                    <div className="flex flex-wrap items-center gap-2">
                        {tenant?.id && user && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsStudyOpen(true)}
                                className="h-8 px-3 gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            >
                                <NotebookPen size={14} />
                                Estudo
                            </Button>
                        )}
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
            </div>

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
                                    to={ROUTES.PUBLIC.BIBLE_READER(book ?? '', num)}
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

            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                {tenant?.id && user && (
                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3">
                        <div>
                            <div className="text-sm font-semibold text-green-800">Modo de estudo ativo</div>
                            <div className="text-xs text-green-700">
                                Clique em um versículo para destacar ou adicionar anotações privadas.
                            </div>
                        </div>
                        <Badge variant="secondary">
                            {notes.length} notas · {highlights.length} destaques
                        </Badge>
                    </div>
                )}

                {tenant?.id && notes.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {notes.map((note) => (
                            <button
                                key={note.id}
                                type="button"
                                onClick={() => openStudyDialog(note.verse)}
                                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                            >
                                Nota v.{note.verse}
                            </button>
                        ))}
                    </div>
                )}

                <div
                    className="prose prose-lg prose-green max-w-none text-gray-800 leading-loose font-serif transition-all duration-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {content.verses.map((verse, idx) => {
                        const verseNumber = idx + 1;
                        const highlight = highlightMap.get(verseNumber);

                        return (
                            <button
                                key={verseNumber}
                                type="button"
                                onClick={() => tenant?.id && openStudyDialog(verseNumber)}
                                className={`relative inline rounded px-1 text-left transition-colors ${
                                    tenant?.id ? 'cursor-pointer hover:bg-green-100/80' : ''
                                } ${
                                    highlight?.color ? highlightClassByColor[highlight.color] : ''
                                }`}
                            >
                                <sup
                                    className="text-green-600 font-bold mr-1 select-none cursor-default"
                                    style={{ fontSize: `${Math.max(10, fontSize * 0.6)}px`, top: '-0.5em' }}
                                >
                                    {verseNumber}
                                </sup>
                                <span className="text-inherit">{verse} </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between mt-8 sticky bottom-4 z-10">
                {content.previous_chapter ? (
                    <Link
                        to={ROUTES.PUBLIC.BIBLE_READER(content.previous_chapter.book, content.previous_chapter.chapter)}
                        className="flex items-center gap-2 bg-white text-green-700 font-medium hover:bg-green-50 hover:border-green-200 border border-gray-200 px-4 py-3 rounded-full shadow-lg transition-all hover:-translate-x-1"
                    >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline text-sm">
                            {content.previous_chapter.book.toUpperCase()} {content.previous_chapter.chapter}
                        </span>
                    </Link>
                ) : <div />}

                {content.next_chapter ? (
                    <Link
                        to={ROUTES.PUBLIC.BIBLE_READER(content.next_chapter.book, content.next_chapter.chapter)}
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

            <Dialog open={isStudyOpen} onOpenChange={setIsStudyOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bookmark size={18} className="text-green-700" />
                            Estudo do versículo
                        </DialogTitle>
                        <DialogDescription>
                            {book?.toUpperCase()} {chapterNum}:{selectedVerse ?? 1}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedVerse ? (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                                <span className="mr-2 font-semibold text-green-700">{selectedVerse}</span>
                                {content.verses[selectedVerse - 1]}
                            </div>

                            {tenant?.id ? (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            <Highlighter size={16} className="text-green-700" />
                                            Destaque
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(['yellow', 'green', 'blue', 'pink', 'orange'] as const).map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`h-9 w-9 rounded-full border-2 transition ${
                                                        selectedColor === color ? 'border-gray-900 scale-105' : 'border-white'
                                                    } ${highlightClassByColor[color]}`}
                                                    aria-label={`Selecionar cor ${color}`}
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            variant={selectedHighlight ? 'destructive' : 'outline'}
                                            onClick={handleToggleHighlight}
                                            isLoading={createHighlight.isPending || deleteHighlight.isPending}
                                        >
                                            {selectedHighlight ? 'Remover destaque' : 'Destacar versículo'}
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            <NotebookPen size={16} className="text-green-700" />
                                            Anotação privada
                                        </div>
                                        <Textarea
                                            value={noteDraft}
                                            onChange={(event) => setNoteDraft(event.target.value)}
                                            placeholder="Escreva sua observação, aplicação ou oração."
                                            className="min-h-36"
                                        />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                onClick={handleSaveNote}
                                                isLoading={createNote.isPending || updateNote.isPending}
                                                disabled={!noteDraft.trim()}
                                            >
                                                {selectedNote ? 'Atualizar anotação' : 'Salvar anotação'}
                                            </Button>
                                            {selectedNote && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleDeleteSelectedNote}
                                                    isLoading={deleteNote.isPending}
                                                >
                                                    Excluir anotação
                                                </Button>
                                            )}
                                            {selectedHighlight && (
                                                <Badge variant="secondary">
                                                    Destaque ativo: {selectedHighlight.color}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                    Entre em uma conta vinculada a uma igreja para salvar anotações e destaques.
                                </div>
                            )}
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStudyOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
