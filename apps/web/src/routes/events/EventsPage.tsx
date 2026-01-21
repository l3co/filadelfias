import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEvents, useDeleteEvent } from '../../features/events/hooks/useEvents';
import { EventList } from '../../features/events/components/EventList';
import { CreateEventDialog } from '../../features/events/components/CreateEventDialog';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function EventsPage() {
    const tenant = useCurrentTenant();
    const { data: events, isLoading } = useEvents(tenant?.id);
    const deleteEvent = useDeleteEvent(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = (eventId: string) => {
        deleteEvent.mutate(eventId);
    };

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
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus size={16} /> Novo Evento
                    </Button>
                }
            />

            <EventList 
                events={events} 
                isLoading={isLoading}
                onDelete={handleDelete}
            />

            <CreateEventDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
