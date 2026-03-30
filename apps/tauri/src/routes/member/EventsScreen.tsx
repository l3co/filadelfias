import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EventsScreen() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useEvents();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const calendarDays = useMemo(() => {
    const firstDay = startOfWeek(startOfMonth(visibleMonth), { locale: ptBR });
    const lastDay = endOfWeek(endOfMonth(visibleMonth), { locale: ptBR });
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  }, [visibleMonth]);

  const eventsByDay = useMemo(() => {
    const entries = new Map<string, typeof events>();

    for (const event of events ?? []) {
      const key = format(parseISO(event.starts_at), "yyyy-MM-dd");
      entries.set(key, [...(entries.get(key) ?? []), event]);
    }

    return entries;
  }, [events]);

  const selectedEvents = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selectedDate]);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Calendario comunitario</h1>
        <p className="text-sm text-muted-foreground">Agenda mensal da igreja com foco nos encontros da comunidade.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando eventos...</p>
      ) : (
        <>
          <section className="rounded-2xl border bg-card p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setVisibleMonth((current) => subMonths(current, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <div className="text-center">
                <p className="text-sm font-semibold capitalize">{format(visibleMonth, "MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p className="text-xs text-muted-foreground">Toque em um dia para ver a agenda.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setVisibleMonth((current) => addMonths(current, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(key) ?? [];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-16 rounded-xl border p-2 text-left transition-colors",
                      isSameDay(day, selectedDate) ? "border-primary bg-primary/10" : "bg-background hover:bg-muted",
                      !isSameMonth(day, visibleMonth) && "opacity-40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", isToday(day) && "text-primary")}>{format(day, "d")}</span>
                      {dayEvents.length ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {dayEvents.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <p key={event.id} className="line-clamp-1 text-[11px] text-muted-foreground">
                          {event.title}
                        </p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground">Eventos e encontros marcados para esta data.</p>
            </div>

            {selectedEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(`/member/events/${event.id}`)}
                className="flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <Calendar size={20} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(event.starts_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                  </p>
                  {event.location ? <p className="text-sm text-muted-foreground">{event.location}</p> : null}
                </div>
              </button>
            ))}

            {!selectedEvents.length ? (
              <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                Nenhum evento cadastrado para este dia.
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
