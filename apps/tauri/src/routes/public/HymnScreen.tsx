import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, EyeOff, Minus, Monitor, MonitorOff, Plus, Settings2, Square, Volume2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { emitTo } from "@tauri-apps/api/event";
import { useHymn } from "@/hooks/useHymnal";
import { usePlatform } from "@/hooks/usePlatform";
import type { HymnLyricLine } from "@/services/hymnal";
import { usePresentationStore } from "@/stores/presentationStore";
import { openPresentationWindow, closePresentationWindow } from "@/lib/presentationWindow";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = "hymnal-font-size";

const BG_PRESETS = ["#0f172a", "#1e1b4b", "#14532d", "#1c1917", "#ffffff"];
const TEXT_PRESETS = ["#f8fafc", "#fef9c3", "#bbf7d0", "#fce7f3", "#1e293b"];

function sectionLabel(section: HymnLyricLine) {
  if (section.type === "chorus") return "Refrão";
  if (section.type === "bridge") return "Ponte";
  return `Estrofe ${section.number ?? ""}`.trim();
}

export function HymnScreen() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const hymnNumber = number ? parseInt(number, 10) : undefined;
  const { data: hymn, isLoading } = useHymn(hymnNumber);
  const platform = usePlatform();

  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? parseInt(stored, 10) : 18;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const { isPresenting, isBlank, settings, setPresenting, setCurrentVerse, setBlank, updateSettings } =
    usePresentationStore();

  const handleFontSize = (delta: number) => {
    setFontSize((cur) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, cur + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  const toggleAudio = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!hymn) return;
    const text = hymn.lyrics.map((s) => s.lines.join(" ")).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleTogglePresentation = async () => {
    if (isPresenting) {
      await closePresentationWindow();
      setPresenting(false);
      setActiveIdx(null);
    } else {
      await openPresentationWindow();
      setPresenting(true);
    }
  };

  const handlePresentSection = async (section: HymnLyricLine, idx: number) => {
    if (!hymn) return;
    const text = section.lines.join("\n");
    const reference = `Hino ${hymn.number} — ${sectionLabel(section)}`;
    const presented = { text, reference, verseNumber: idx };
    setCurrentVerse(presented);
    setBlank(false);
    setActiveIdx(idx);
    await emitTo("presentation", "bible:present", { verse: presented, settings, isBlank: false });
  };

  const handleBlank = async () => {
    const next = !isBlank;
    setBlank(next);
    const currentVerse = usePresentationStore.getState().currentVerse;
    await emitTo("presentation", "bible:present", { verse: currentVerse, settings, isBlank: next });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  if (!hymn) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-600">Hino não encontrado</h2>
        <button onClick={() => navigate("/hinario")} className="mt-4 text-sm text-green-700 hover:underline">
          Voltar ao hinário
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
            to="/hinario"
            className="shrink-0 text-gray-400 transition-colors hover:text-green-700"
            title="Voltar ao hinário"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900 sm:text-xl">
              {hymn.number}. {hymn.title}
            </h1>
            {hymn.author && <p className="text-xs text-gray-500">{hymn.author}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
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
            {platform === "desktop" && (
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
            )}
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
              {activeIdx !== null
                ? `Projetando: Hino ${hymn.number} — ${sectionLabel(hymn.lyrics[activeIdx])}`
                : "Aguardando — clique em uma estrofe ou refrão"}
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

      {/* Lyrics */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          {hymn.lyrics.map((section, idx) => {
            const isChorus = section.type === "chorus";
            const isActive = isPresenting && activeIdx === idx;
            return (
              <div
                key={`${section.type}-${idx}`}
                onClick={isPresenting ? () => handlePresentSection(section, idx) : undefined}
                className={`rounded-lg p-3 transition-all ${
                  isPresenting
                    ? isActive
                      ? "cursor-pointer bg-green-100/80 ring-1 ring-green-400"
                      : "cursor-pointer hover:bg-green-50"
                    : ""
                } ${isChorus ? "border-l-4 border-green-500 pl-4" : ""}`}
              >
                <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${isChorus ? "text-green-600" : "text-gray-400"}`}>
                  {sectionLabel(section)}
                  {isPresenting && isActive && <Monitor size={11} className="ml-1.5 inline-block" />}
                </p>
                {section.lines.map((line, lineIdx) => (
                  <p
                    key={lineIdx}
                    style={{ fontSize: `${fontSize}px` }}
                    className={`leading-relaxed text-gray-800 ${isChorus ? "font-medium italic" : ""}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating navigation */}
      <div className="sticky bottom-4 z-10 flex justify-between">
        {hymnNumber && hymnNumber > 1 ? (
          <button
            onClick={() => navigate(`/hinario/${hymnNumber - 1}`)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg transition-all hover:-translate-x-0.5 hover:border-green-200 hover:bg-green-50"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Hino {hymnNumber - 1}</span>
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={() => navigate(`/hinario/${(hymnNumber ?? 1) + 1}`)}
          className="flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-700/20 transition-all hover:translate-x-0.5 hover:bg-green-800"
        >
          <span className="hidden sm:inline">Hino {(hymnNumber ?? 1) + 1}</span>
          <span className="sm:hidden text-sm">Próximo</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Settings sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Configurações da Apresentação</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Cor de fundo</p>
              <div className="flex flex-wrap gap-2">
                {BG_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ bgColor: color })}
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      settings.bgColor === color ? "scale-110 border-green-500" : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => updateSettings({ bgColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Cor do texto</p>
              <div className="flex flex-wrap gap-2">
                {TEXT_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ textColor: color })}
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      settings.textColor === color ? "scale-110 border-green-500" : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
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

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Posição do logo</p>
              <div className="flex flex-col gap-1.5">
                {(["top-right", "bottom-right", "none"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSettings({ logoPosition: pos })}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
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

            {settings.logoPosition !== "none" && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">URL do logo</p>
                <input
                  type="text"
                  placeholder="https://exemplo.com/logo.png"
                  value={settings.logoUrl}
                  onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            <div
              className="flex h-24 items-center justify-center overflow-hidden rounded-lg"
              style={{ backgroundColor: settings.bgColor }}
            >
              <p
                className="px-4 text-center font-serif"
                style={{ color: settings.textColor, fontSize: `${Math.round(settings.fontSize * 0.25)}px` }}
              >
                Cantai ao Senhor…
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
