import { useState } from "react";
import { Minus, Plus, Volume2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHymn } from "@/hooks/useHymnal";

const FONT_MIN = 16;
const FONT_MAX = 40;
const FONT_KEY = "hymnal-font-size";

export function HymnScreen() {
  const { number } = useParams<{ number: string }>();
  const hymnNumber = number ? Number.parseInt(number, 10) : undefined;
  const { data: hymn, isLoading } = useHymn(hymnNumber);
  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return stored ? Number.parseInt(stored, 10) : 20;
  });

  const handleFontSize = (delta: number) => {
    setFontSize((current) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, current + delta));
      localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  const speak = () => {
    if (!hymn) {
      return;
    }

    const text = hymn.lyrics.map((section) => section.lines.join(" ")).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  if (!hymn) {
    return <div className="p-4 text-muted-foreground">Hino nao encontrado.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">
            {hymn.number}. {hymn.title}
          </h1>
          {hymn.author ? <p className="text-sm text-muted-foreground">{hymn.author}</p> : null}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={fontSize <= FONT_MIN} onClick={() => handleFontSize(-2)}>
            <Minus size={14} />
          </Button>
          <span className="w-8 text-center text-xs text-muted-foreground">{fontSize}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={fontSize >= FONT_MAX} onClick={() => handleFontSize(2)}>
            <Plus size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={speak}>
            <Volume2 size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {hymn.lyrics.map((section, index) => (
          <div key={`${section.type}-${index}`} className={section.type === "chorus" ? "border-l-4 border-primary pl-3 italic" : ""}>
            {section.number ? (
              <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">
                {section.type === "chorus" ? "Refrao" : `Estrofe ${section.number}`}
              </p>
            ) : null}

            {section.lines.map((line, lineIndex) => (
              <p key={`${section.type}-${index}-${lineIndex}`} style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
