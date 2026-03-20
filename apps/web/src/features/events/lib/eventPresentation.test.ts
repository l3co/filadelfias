/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EVENT_CATEGORY_LABELS,
  formatEventCardDate,
  formatEventCardTime,
  isPastEvent,
  sortEventsByStartDate,
} from './eventPresentation';

describe('eventPresentation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
  });

  it('exposes known event category labels', () => {
    expect(EVENT_CATEGORY_LABELS.culto.label).toBe('Culto');
    expect(EVENT_CATEGORY_LABELS.oracao.color).toContain('pink');
  });

  it('formats event date and time for cards', () => {
    expect(formatEventCardDate('2026-03-22T19:30:00Z')).toContain('22');
    expect(formatEventCardTime('2026-03-22T19:30:00Z')).toMatch(/\d{2}:\d{2}/);
  });

  it('sorts events by start date ascending', () => {
    const events = [
      { id: '2', start_date: '2026-03-22T19:30:00Z' },
      { id: '1', start_date: '2026-03-20T19:30:00Z' },
      { id: '3', start_date: '2026-03-25T19:30:00Z' },
    ] as Parameters<typeof sortEventsByStartDate>[0];

    expect(sortEventsByStartDate(events).map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it('detects past events relative to current time', () => {
    expect(isPastEvent('2026-03-18T19:30:00Z')).toBe(true);
    expect(isPastEvent('2026-03-20T19:30:00Z')).toBe(false);
  });
});
