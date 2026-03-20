/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { formatCurrencyBRL, formatDateBR, formatTimeBR } from './formatters';

describe('formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
  });

  it('formats BRL currency consistently', () => {
    expect(formatCurrencyBRL(1234.56)).toBe('R$ 1.234,56');
  });

  it('formats pt-BR dates with default and custom options', () => {
    expect(formatDateBR('2026-03-19T12:00:00Z')).toBe('19/03/2026');
    expect(formatDateBR('2026-03-20')).toBe('20/03/2026');
    expect(
      formatDateBR('2026-03-19T12:00:00Z', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    ).toContain('2026');
  });

  it('formats pt-BR time with default hour and minute', () => {
    expect(formatTimeBR('2026-03-19T18:45:00Z')).toMatch(/\d{2}:\d{2}/);
  });
});
