import { Calendar, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/EmptyState';
import { PageHeaderWithIcon } from '../../../components/PageHeader';
import { useEventsPageState } from '../hooks/useEventsPageState';
import { CreateEventDialog } from './CreateEventDialog';
import { EventList } from './EventList';

type EventsPageViewProps = ReturnType<typeof useEventsPageState>;

export function EventsPageView({
  events,
  handleCloseDialog,
  handleDelete,
  handleOpenDialog,
  isDialogOpen,
  isLoading,
  tenant,
}: EventsPageViewProps) {
  if (!tenant) {
    return (
      <EmptyState
        icon={Calendar}
        title="Selecione uma organização"
        description="Você precisa estar vinculado a uma igreja."
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeaderWithIcon
        icon={Calendar}
        iconColor="red"
        title="Eventos"
        description={`Agende e gerencie os eventos da ${tenant.name}`}
        actions={
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus size={16} /> Novo Evento
          </Button>
        }
      />

      <EventList events={events} isLoading={isLoading} onDelete={handleDelete} />

      <CreateEventDialog isOpen={isDialogOpen} onClose={handleCloseDialog} tenantId={tenant.id} />
    </div>
  );
}
