import { memo, useCallback, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { CardSkeleton } from "../../../components/LoadingState";
import { EmptyState } from "../../../components/EmptyState";
import type { Event } from '../../../services/events';
import { EventCard } from './EventCard';
import { sortEventsByStartDate } from '../lib/eventPresentation';

interface EventListProps {
    events?: Event[];
    isLoading?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (eventId: string) => void;
}

export const EventList = memo(function EventList({ events, isLoading, onEdit, onDelete }: EventListProps) {
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const sortedEvents = useMemo(() => sortEventsByStartDate(events ?? []), [events]);

    const handleDeleteConfirm = useCallback(() => {
        if (eventToDelete && onDelete) {
            onDelete(eventToDelete.id);
        }
        setEventToDelete(null);
    }, [eventToDelete, onDelete]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <EmptyState
                icon={Calendar}
                title="Nenhum evento"
                description="Cadastre o primeiro evento da sua igreja."
            />
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onEdit={onEdit}
                        onDelete={setEventToDelete}
                    />
                ))}
            </div>

            <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{eventToDelete?.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
});
