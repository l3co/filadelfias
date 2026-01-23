import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEvents } from '../../features/events/hooks/useEvents';

export function MemberEventsPage() {
  const tenant = useCurrentTenant();
  const { data: events, isLoading } = useEvents(tenant?.id);

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

  const futureEvents = events?.filter(e => new Date(e.start_date) > new Date()) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeaderWithIcon
        icon={Calendar}
        title="Eventos"
        description="Próximos eventos e atividades da igreja"
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : futureEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento agendado"
          description="Não há eventos programados no momento. Fique atento às novidades!"
        />
      ) : (
        <div className="space-y-4">
          {futureEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="outline" className="gap-2">
                      <Users size={16} />
                      Confirmar Presença
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
