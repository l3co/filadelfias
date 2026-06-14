import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Star } from "lucide-react";
import { useManualArticle } from "@/hooks/useManual";
import { useManualStorage } from "@/hooks/useManualStorage";

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = "manual-font-size";

export function ManualArticleScreen() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, addRecent } = useManualStorage();

  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? parseInt(stored, 10) : 18;
  });

  const { data: article, isLoading } = useManualArticle(articleId);

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
    setFontSize(cur => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, cur + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-600">Artigo não encontrado</h2>
        <button onClick={() => navigate("/manual")} className="mt-4 text-sm text-green-700 hover:underline">
          Voltar ao índice
        </button>
      </div>
    );
  }

  const favorited = isFavorite(article.id);

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in px-4 py-6 duration-300 sm:px-6">
      {/* Header card */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <Link to="/manual" className="shrink-0 text-gray-400 transition-colors hover:text-green-700" title="Voltar ao índice">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900">Artigo {article.number}</h1>
            {article.context && (
              <nav className="mt-0.5 flex flex-wrap items-center gap-1" aria-label="Localização no manual">
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
            )}
          </div>
        </div>

        {/* Controls */}
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
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 text-gray-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <Star size={13} className={favorited ? "fill-amber-500 text-amber-500" : ""} />
            {favorited ? "Favoritado" : "Favoritar"}
          </button>
        </div>
      </div>

      {/* Article content */}
      <div className="mb-6 min-h-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <div
          className="max-w-none text-gray-800 leading-relaxed transition-all duration-200"
          style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
        >
          {article.structure && article.structure.length > 0 ? (
            <div className="space-y-4">
              {article.structure.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`
                    ${item.type === "caput" ? "text-justify" : ""}
                    ${item.type === "section" ? "border-l-2 border-green-200 pl-4 sm:pl-6" : ""}
                    ${item.type === "paragraph" ? "pl-4" : ""}
                  `}
                >
                  {item.marker && (
                    <span className="mb-1 mr-2 inline-block font-bold text-green-700">{item.marker}</span>
                  )}
                  <span className="text-justify">{item.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-justify">{article.text}</p>
          )}
        </div>

        {/* Footnotes */}
        {article.notes && article.notes.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Referências</p>
            <div className="space-y-2">
              {article.notes.map(note => (
                <div key={note.id} className="flex gap-2">
                  <span className="min-w-[2rem] shrink-0 text-xs font-bold text-green-700">{note.number}</span>
                  {note.text && <span className="text-xs text-gray-600">{note.text}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating navigation */}
      <div className="sticky bottom-4 z-10 flex justify-between">
        {article.navigation?.previous ? (
          <button
            onClick={() => navigate(`/manual/${encodeURIComponent(article.navigation!.previous!.id)}`)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-green-700 shadow-lg transition-all hover:-translate-x-0.5 hover:border-green-200 hover:bg-green-50"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Art. {article.navigation.previous.number}</span>
          </button>
        ) : <div />}

        {article.navigation?.next ? (
          <button
            onClick={() => navigate(`/manual/${encodeURIComponent(article.navigation!.next!.id)}`)}
            className="flex items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-700/20 transition-all hover:translate-x-0.5 hover:bg-green-800"
          >
            <span className="hidden sm:inline">Art. {article.navigation.next.number}</span>
            <span className="text-sm sm:hidden">Próximo</span>
            <ChevronRight size={18} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
