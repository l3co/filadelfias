import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useManualArticle } from "@/hooks/useManual";

export function ManualArticleScreen() {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const { data: article, isLoading } = useManualArticle(articleId);

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  if (!article) {
    return <div className="p-4 text-muted-foreground">Artigo nao encontrado.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/manual")}>
          <ChevronLeft />
        </Button>

        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">Artigo {article.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manual da IPB</p>
        </div>

        <div className="w-9" />
      </div>

      <article className="space-y-6">
        <div className="rounded-xl border bg-card p-5">
          <p className="whitespace-pre-wrap text-base leading-7">{article.text}</p>
        </div>

        {article.structure.length > 0 ? (
          <section className="rounded-xl border p-5">
            <h2 className="mb-4 text-lg font-semibold">Estrutura</h2>
            <div className="space-y-4">
              {article.structure.map((item) => (
                <div key={item.id} className="border-l-2 border-primary/30 pl-4">
                  {item.marker ? (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{item.marker}</p>
                  ) : null}
                  <p className="text-sm leading-6">{item.text}</p>
                  {item.notes?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {item.notes.map((note) => (
                        <li key={note.id}>
                          {note.number}
                          {note.text ? ` - ${note.text}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {article.notes.length > 0 ? (
          <section className="rounded-xl border p-5">
            <h2 className="mb-4 text-lg font-semibold">Notas</h2>
            <div className="space-y-3">
              {article.notes.map((note) => (
                <div key={note.id} className="rounded-md bg-muted/40 p-3">
                  <p className="text-sm font-medium">{note.number}</p>
                  {note.text ? <p className="mt-1 text-sm text-muted-foreground">{note.text}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <div className="mt-8 flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          disabled={!article.navigation.previous}
          onClick={() => article.navigation.previous && navigate(`/manual/${article.navigation.previous.id}`)}
        >
          <ChevronLeft />
          <span className="ml-1">
            {article.navigation.previous ? `Art. ${article.navigation.previous.number}` : "Anterior"}
          </span>
        </Button>

        <Button
          variant="outline"
          disabled={!article.navigation.next}
          onClick={() => article.navigation.next && navigate(`/manual/${article.navigation.next.id}`)}
        >
          <span className="mr-1">{article.navigation.next ? `Art. ${article.navigation.next.number}` : "Proximo"}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
