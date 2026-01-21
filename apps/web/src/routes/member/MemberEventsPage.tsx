import { Calendar } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function MemberEventsPage() {
  // TODO: Fetch events from API
  const events: unknown[] = [];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Eventos" 
        description="Próximos eventos e atividades da igreja"
      />

      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento agendado"
          description="Não há eventos programados no momento. Fique atento às novidades!"
        />
      ) : (
        <div className="space-y-4">
          {/* Event cards will go here */}
        </div>
      )}
    </div>
  );
}
