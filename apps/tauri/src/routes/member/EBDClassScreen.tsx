import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEbdLessons } from "@/hooks/useEbd";

export function EBDClassScreen() {
  const { classId } = useParams<{ classId: string }>();
  const { data: lessons, isLoading } = useEbdLessons(classId);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando licoes...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Licoes da turma</h1>
        <p className="text-sm text-muted-foreground">Conteudo e cronograma de estudos da EBD.</p>
      </div>

      <div className="space-y-3">
        {lessons?.map((lesson) => (
          <article key={lesson.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start gap-3">
              <BookOpen size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(lesson.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                {lesson.bible_reference ? (
                  <p className="mt-2 text-sm text-muted-foreground">{lesson.bible_reference}</p>
                ) : null}
                {lesson.content ? <p className="mt-2 text-sm leading-6 text-foreground/85">{lesson.content}</p> : null}
              </div>
            </div>
          </article>
        ))}

        {!lessons?.length ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhuma licao encontrada para esta turma.
          </div>
        ) : null}
      </div>
    </div>
  );
}
