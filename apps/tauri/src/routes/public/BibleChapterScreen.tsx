import { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Volume2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBibleChapter } from "@/hooks/useBible";

const FONT_MIN = 14;
const FONT_MAX = 32;
const FONT_KEY = "bible-font-size";

export function BibleChapterScreen() {
  const navigate = useNavigate();
  const { version = "ARC", book = "gn", chapter = "1" } = useParams();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? Number.parseInt(stored, 10) : 18;
  });
  const chapterNumber = Number.parseInt(chapter, 10);

  const handleFontSize = (delta: number) => {
    setFontSize((current) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, current + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };
  const { data, isLoading } = useBibleChapter(version, book, chapterNumber);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  if (!data) {
    return <div className="p-4 text-muted-foreground">Capitulo nao encontrado.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={chapterNumber <= 1}
          onClick={() => navigate(`/biblia/${version}/${book}/${Math.max(1, chapterNumber - 1)}`)}
        >
          <ChevronLeft />
        </Button>

        <h1 className="text-center font-semibold">
          {data.book_name} {chapter}
        </h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/biblia/${version}/${book}/${chapterNumber + 1}`)}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={fontSize <= FONT_MIN} onClick={() => handleFontSize(-2)}>
          <Minus size={14} />
        </Button>
        <span className="w-8 text-center text-xs text-muted-foreground">{fontSize}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={fontSize >= FONT_MAX} onClick={() => handleFontSize(2)}>
          <Plus size={14} />
        </Button>
      </div>

      <div className="space-y-3">
        {data.verses.map((verse) => (
          <p
            key={verse.number}
            style={{ fontSize: `${fontSize}px` }}
            className="cursor-pointer leading-relaxed"
            onClick={() => setSelectedVerse((current) => (current === verse.number ? null : verse.number))}
          >
            <sup className="mr-1 text-xs font-bold text-primary">{verse.number}</sup>
            {verse.text}
            {selectedVerse === verse.number ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  speak(verse.text);
                }}
                className="ml-2 text-primary"
              >
                <Volume2 size={14} className="inline" />
              </button>
            ) : null}
          </p>
        ))}
      </div>
    </div>
  );
}
