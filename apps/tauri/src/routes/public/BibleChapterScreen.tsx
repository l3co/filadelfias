import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, EyeOff, Minus, Monitor, MonitorOff, Plus, Settings2, Square, Volume2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { emit } from "@tauri-apps/api/event";
import { useBibleBooks, useBibleChapter } from "@/hooks/useBible";
import { usePresentationStore } from "@/stores/presentationStore";
import { openPresentationWindow, closePresentationWindow } from "@/lib/presentationWindow";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = "bible-font-size";
const VERSION_KEY = "bible-version";
const DEFAULT_VERSION = "ARC";

const BG_PRESETS = ["#0f172a", "#1e1b4b", "#14532d", "#1c1917", "#ffffff"];
const TEXT_PRESETS = ["#f8fafc", "#fef9c3", "#bbf7d0", "#fce7f3", "#1e293b"];

export function BibleChapterScreen() {
  const navigate = useNavigate();
  const { version: paramVersion, book = "gn", chapter = "1" } = useParams();
  const version = paramVersion || localStorage.getItem(VERSION_KEY) || DEFAULT_VERSION;
  const chapterNum = parseInt(chapter, 10);

  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? parseInt(stored, 10) : 18;
  });
  const [showChapters, setShowChapters] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { isPresenting, currentVerse, isBlank, settings, setPresenting, setCurrentVerse, setBlank, updateSettings } =
    usePresentationStore();

  const { data, isLoading } = useBibleChapter(version, book, chapterNum);
  const { data: books } = useBibleBooks(version);

  const currentBook = useMemo(() => books?.find((b) => b.abbrev === book), [books, book]);
  const totalChapters = currentBook?.chapters_count ?? 0;

  const prevNav = useMemo(() => {
    if (!books) return null;
    if (chapterNum > 1) return { book, chapter: chapterNum - 1, label: `${book.toUpperCase()} ${chapterNum - 1}` };
    const idx = books.findIndex((b) => b.abbrev === book);
    if (idx > 0) {
      const prev = books[idx - 1];
      return { book: prev.abbrev, chapter: prev.chapters_count, label: `${prev.abbrev.toUpperCase()} ${prev.chapters_count}` };
    }
    return null;
  }, [books, book, chapterNum]);

  const nextNav = useMemo(() => {
    if (!books) return null;
    if (chapterNum < totalChapters) return { book, chapter: chapterNum + 1, label: `${book.toUpperCase()} ${chapterNum + 1}` };
    const idx = books.findIndex((b) => b.abbrev === book);
    if (idx >= 0 && idx < books.length - 1) {
      const next = books[idx + 1];
      return { book: next.abbrev, chapter: 1, label: `${next.abbrev.toUpperCase()} 1` };
    }
    return null;
  }, [books, book, chapterNum, totalChapters]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [book, chapterNum]);

  const handleFontSize = (delta: number) => {
    setFontSize((cur) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, cur + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!data) return;
    const text = `${data.book_name}, capítulo ${data.chapter}. ${data.verses.map((v) => v.text).join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleTogglePresentation = async () => {
    if (isPresenting) {
      await closePresentationWindow();
      setPresenting(false);
    } else {
      await openPresentationWindow();
      setPresenting(true);
    }
  };

  const handlePresentVerse = async (verseText: string, idx: number) => {
    if (!data) return;
    const verseNum = idx + 1;
    const reference = `${data.book_name} ${data.chapter}:${verseNum} (${version})`;
    const presented = { text: verseText, reference, verseNumber: verseNum };
    setCurrentVerse(presented);
    setBlank(false);
    await emit("bible:present", { verse: presented, settings, isBlank: false });
  };

  const handleBlank = async () => {
    const next = !isBlank;
    setBlank(next);
    await emit("bible:present", { verse: currentVerse, settings, isBlank: next });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-600">Capítulo não encontrado</h2>
        <button onClick={() => navigate("/biblia")} className="mt-4 text-sm text-green-700 hover:underline">
          Voltar ao índice
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in px-4 py-6 duration-300 sm:px-6">
      {/* Header card */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <Link
            to="/biblia"
            className="shrink-0 text-gray-400 transition-colors hover:text-green-700"
            title="Voltar aos livros"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900 sm:text-xl">{data.book_name}</h1>
            <p className="text-xs text-gray-500">Capítulo {data.chapter}</p>
          </div>
          <select
            value={version}
            onChange={(e) => {
              localStorage.setItem(VERSION_KEY, e.target.value);
              navigate(`/biblia/${e.target.value}/${book}/${chapter}`);
            }}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
          >
            <option value="ARC">ARC</option>
            <option value="NVI">NVI</option>
            <option value="ACF">ACF</option>
            <option value="AA">AA</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          {/* Font size */}
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

          <div className="flex items-center gap-2">
            {totalChapters > 0 && (
              <button
                onClick={() => setShowChapters((v) => !v)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                <BookOpen size={13} />
                Capítulos
              </button>
            )}
            <button
              onClick={toggleAudio}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                isSpeaking
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {isSpeaking ? <Square size={13} className="fill-current" /> : <Volume2 size={13} />}
              {isSpeaking ? "Parar" : "Ouvir"}
            </button>
            <button
              onClick={handleTogglePresentation}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                isPresenting
                  ? "border-green-300 bg-green-700 text-white hover:bg-green-800"
                  : "border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {isPresenting ? <MonitorOff size={13} /> : <Monitor size={13} />}
              {isPresenting ? "Encerrar" : "Apresentar"}
            </button>
            {isPresenting && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                title="Configurações da apresentação"
              >
                <Settings2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Presentation status bar */}
      {isPresenting && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-800">
              {currentVerse ? `Projetando: ${currentVerse.reference}` : "Aguardando — clique em um versículo"}
            </span>
          </div>
          <button
            onClick={handleBlank}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              isBlank
                ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "border-green-200 text-green-700 hover:bg-green-100"
            }`}
          >
            <EyeOff size={12} />
            {isBlank ? "Retomar" : "Tela em branco"}
          </button>
        </div>
      )}

      {/* Chapter grid */}
      {showChapters && totalChapters > 0 && (
        <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-gray-500">
            {data.book_name} — {totalChapters} capítulos
          </p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 md:grid-cols-12">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => {
                  navigate(`/biblia/${version}/${book}/${num}`);
                  setShowChapters(false);
                }}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  num === chapterNum
                    ? "bg-green-700 text-white shadow-md"
                    : "border border-gray-200 bg-gray-50 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verse text */}
      <div className="mb-6 min-h-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <div
          className="prose prose-lg prose-green max-w-none font-serif leading-loose text-gray-800 transition-all duration-200"
          style={{ fontSize: `${fontSize}px`, lineHeight: "1.9" }}
        >
          {data.verses.map((verse, idx) => {
            const num = idx + 1;
            const isActive = currentVerse?.verseNumber === num && isPresenting;
            return (
              <span
                key={num}
                onClick={isPresenting ? () => handlePresentVerse(verse.text, idx) : undefined}
                className={`inline rounded px-0.5 transition-colors ${
                  isPresenting
                    ? isActive
                      ? "cursor-pointer bg-green-200/80 ring-1 ring-green-400"
                      : "cursor-pointer hover:bg-green-100/80"
                    : "cursor-default hover:bg-green-100/80"
                }`}
              >
                <sup
                  className="mr-1 select-none font-bold text-green-600"
                  style={{ fontSize: `${Math.max(10, fontSize * 0.6)}px`, top: "-0.5em" }}
                >
                  {num}
                </sup>
                <span>{verse.text} </span>
                {isPresenting && isActive && (
                  <Monitor size={12} className="ml-1 inline-block text-green-600" />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Floating navigation */}
      <div className="sticky bottom-4 z-10 flex justify-between">
        {prevNav ? (
          <button
            onClick={() => navigate(`/biblia/${version}/${prevNav.book}/${prevNav.chapter}`)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg transition-all hover:-translate-x-0.5 hover:border-green-200 hover:bg-green-50"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">{prevNav.label}</span>
          </button>
        ) : (
          <div />
        )}

        {nextNav ? (
          <button
            onClick={() => navigate(`/biblia/${version}/${nextNav.book}/${nextNav.chapter}`)}
            className="flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-700/20 transition-all hover:translate-x-0.5 hover:bg-green-800"
          >
            <span className="hidden sm:inline">{nextNav.label}</span>
            <span className="sm:hidden text-sm">Próximo</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Settings sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Configurações da Apresentação</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Background color */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cor de fundo</p>
              <div className="flex flex-wrap gap-2">
                {BG_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ bgColor: color })}
                    title={color}
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      settings.bgColor === color ? "border-green-500 scale-110" : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => updateSettings({ bgColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200"
                  title="Cor personalizada"
                />
              </div>
            </div>

            {/* Text color */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cor do texto</p>
              <div className="flex flex-wrap gap-2">
                {TEXT_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ textColor: color })}
                    title={color}
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      settings.textColor === color ? "border-green-500 scale-110" : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color, border: color === "#ffffff" ? "1px solid #e5e7eb" : undefined }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200"
                  title="Cor personalizada"
                />
              </div>
            </div>

            {/* Font size */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tamanho do texto — {settings.fontSize}px
              </p>
              <input
                type="range"
                min={40}
                max={120}
                step={4}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-green-700"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>40px</span>
                <span>120px</span>
              </div>
            </div>

            {/* Logo position */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posição do logo</p>
              <div className="flex flex-col gap-1.5">
                {(["top-right", "bottom-right", "none"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSettings({ logoPosition: pos })}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition ${
                      settings.logoPosition === pos
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50"
                    }`}
                  >
                    {pos === "top-right" && "Superior direito"}
                    {pos === "bottom-right" && "Inferior direito"}
                    {pos === "none" && "Sem logo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo URL */}
            {settings.logoPosition !== "none" && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">URL do logo</p>
                <input
                  type="text"
                  placeholder="https://exemplo.com/logo.png"
                  value={settings.logoUrl}
                  onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* Preview */}
            <div
              className="flex h-24 items-center justify-center overflow-hidden rounded-lg"
              style={{ backgroundColor: settings.bgColor }}
            >
              <p
                className="px-4 text-center font-serif"
                style={{ color: settings.textColor, fontSize: `${Math.round(settings.fontSize * 0.25)}px` }}
              >
                Porque Deus amou o mundo…
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
