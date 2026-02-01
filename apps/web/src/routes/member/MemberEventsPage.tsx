import { Calendar, MapPin, Clock, Users, History } from 'lucide-react';
import { useState } from 'react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEvents } from '../../features/events/hooks/useEvents';

export function MemberEventsPage() {
  const tenant = useCurrentTenant();
  const { data: events, isLoading, error } = useEvents(tenant?.id);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const now = new Date();
  const futureEvents = events?.filter(e => new Date(e.start_date) > now) || [];
  const pastEvents = events?.filter(e => new Date(e.start_date) <= now) || [];
  const displayEvents = showPastEvents ? pastEvents : futureEvents;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeaderWithIcon
        icon={Calendar}
        title="Eventos"
        description="Próximos eventos e atividades da igreja"
      />

      {/* Toggle Button */}
      {!isLoading && events && events.length > 0 && (
        <div className="flex justify-end mb-4 gap-2">
          <Button
            variant={!showPastEvents ? 'default' : 'outline'}
            onClick={() => setShowPastEvents(false)}
            className="gap-2"
          >
            <Calendar size={16} />
            Próximos ({futureEvents.length})
          </Button>
          <Button
            variant={showPastEvents ? 'default' : 'outline'}
            onClick={() => setShowPastEvents(true)}
            className="gap-2"
          >
            <History size={16} />
            Passados ({pastEvents.length})
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Calendar}
          title="Erro ao carregar eventos"
          description="Ocorreu um erro ao buscar os eventos. Tente novamente mais tarde."
        />
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento cadastrado"
          description="A igreja ainda não cadastrou eventos. Entre em contato com a administração para mais informações."
        />
      ) : displayEvents.length === 0 ? (
        <EmptyState
          icon={showPastEvents ? History : Calendar}
          title={showPastEvents ? "Nenhum evento passado" : "Nenhum evento futuro"}
          description={
            showPastEvents
              ? "Não há eventos passados registrados."
              : `Não há eventos programados para os próximos dias. ${pastEvents.length > 0 ? `Clique em "Passados" para ver ${pastEvents.length} evento(s) anterior(es).` : ''}`
          }
        />
      ) : (
        <div className="space-y-4">
          {displayEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {showPastEvents && (
                        <Badge variant="outline" className="text-gray-500">
                          Evento Passado
                        </Badge>
                      )}
                      {event.category && (
                        <Badge variant="secondary" className="capitalize">
                          {event.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(event.start_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {formatTime(event.start_date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {!showPastEvents && (
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="outline" className="gap-2">
                        <Users size={16} />
                        Confirmar Presença
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
