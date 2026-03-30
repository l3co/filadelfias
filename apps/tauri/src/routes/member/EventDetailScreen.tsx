import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEvent } from "@/hooks/useEvents";

export function EventDetailScreen() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando evento...</div>;
  }

  if (!event) {
    return <div className="p-4 text-sm text-muted-foreground">Evento nao encontrado.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border bg-card p-5">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{format(new Date(event.starts_at), "dd 'de' MMMM 'as' HH:mm", { locale: ptBR })}</span>
          </div>
          {event.location ? (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>{event.location}</span>
            </div>
          ) : null}
        </div>
      </div>

      {event.description ? (
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm leading-6">{event.description}</p>
        </div>
      ) : null}
    </div>
  );
}
