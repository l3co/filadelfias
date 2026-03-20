import { formatDateBR, formatTimeBR } from '../../../lib/formatters';
import type { Event } from '../../../services/events';

export const EVENT_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  culto: { label: 'Culto', color: 'bg-purple-100 text-purple-700' },
  reuniao: { label: 'Reunião', color: 'bg-blue-100 text-blue-700' },
  evento_social: { label: 'Social', color: 'bg-green-100 text-green-700' },
  conferencia: { label: 'Conferência', color: 'bg-orange-100 text-orange-700' },
  estudo: { label: 'Estudo', color: 'bg-indigo-100 text-indigo-700' },
  oracao: { label: 'Oração', color: 'bg-pink-100 text-pink-700' },
  outro: { label: 'Outro', color: 'bg-gray-100 text-gray-700' },
};

export function formatEventCardDate(dateStr: string) {
  return formatDateBR(dateStr, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatEventCardTime(dateStr: string) {
  return formatTimeBR(dateStr);
}

export function sortEventsByStartDate(events: Event[]) {
  return [...events].sort(
    (firstEvent, secondEvent) =>
      new Date(firstEvent.start_date).getTime() - new Date(secondEvent.start_date).getTime(),
  );
}

export function isPastEvent(dateStr: string) {
  return new Date(dateStr) < new Date();
}
