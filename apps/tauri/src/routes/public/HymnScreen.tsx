import { Volume2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHymn } from "@/hooks/useHymnal";

export function HymnScreen() {
  const { number } = useParams<{ number: string }>();
  const hymnNumber = number ? Number.parseInt(number, 10) : undefined;
  const { data: hymn, isLoading } = useHymn(hymnNumber);

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

        <Button variant="ghost" size="icon" onClick={speak}>
          <Volume2 size={20} />
        </Button>
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
              <p key={`${section.type}-${index}-${lineIndex}`} className="text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
