import { EventsPageView } from '../../features/events/components/EventsPageView';
import { useEventsPageState } from '../../features/events/hooks/useEventsPageState';

export function EventsPage() {
    const eventsPageState = useEventsPageState();

    return <EventsPageView {...eventsPageState} />;
}
