import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDevotionals } from "@/hooks/useDevotionals";

export function DevotionalsScreen() {
  const { data: devotionals, isLoading } = useDevotionals();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Devocionais</h1>
        <p className="text-sm text-muted-foreground">Leituras para fortalecer sua caminhada diaria.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando devocionais...</p>
      ) : (
        <div className="space-y-3">
          {devotionals?.map((devotional) => (
            <article key={devotional.id} className="rounded-2xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {format(new Date(devotional.date), "dd 'de' MMMM", { locale: ptBR })}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{devotional.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{devotional.scripture}</p>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-foreground/85">{devotional.content}</p>
              {devotional.author ? (
                <p className="mt-3 text-xs text-muted-foreground">Por {devotional.author}</p>
              ) : null}
            </article>
          ))}

          {!devotionals?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum devocional disponivel.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
