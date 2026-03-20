import { useCallback, useState } from 'react';
import { useAuthTenant } from '../../../contexts/AuthContext';
import { useDeleteEvent, useEvents } from './useEvents';

export function useEventsPageState() {
  const tenant = useAuthTenant();
  const { data: events, isLoading } = useEvents(tenant?.id);
  const deleteEvent = useDeleteEvent(tenant?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = useCallback(
    (eventId: string) => {
      deleteEvent.mutate(eventId);
    },
    [deleteEvent],
  );

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  return {
    events,
    handleCloseDialog,
    handleDelete,
    handleOpenDialog,
    isDialogOpen,
    isLoading,
    tenant,
  };
}
