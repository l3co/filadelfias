import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';
import { EventsPage } from './EventsPage';

vi.mock('../../features/events/hooks/useEventsPageState', () => ({
  useEventsPageState: vi.fn(),
}));

import { useEventsPageState } from '../../features/events/hooks/useEventsPageState';

const mockUseEventsPageState = vi.mocked(useEventsPageState);

function createEventsState(overrides: Partial<ReturnType<typeof useEventsPageState>> = {}) {
  return {
    events: [{ id: '1', title: 'Culto', start_date: '2026-03-20T19:00:00Z', all_day: false }],
    handleCloseDialog: vi.fn(),
    handleDelete: vi.fn(),
    handleOpenDialog: vi.fn(),
    isDialogOpen: false,
    isLoading: false,
    tenant: { id: 'tenant-1', name: 'Igreja Teste', slug: 'igreja-teste' },
    ...overrides,
  } as ReturnType<typeof useEventsPageState>;
}

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders events page with action button and event card', () => {
    mockUseEventsPageState.mockReturnValue(createEventsState());

    renderWithProviders(<EventsPage />);

    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Novo Evento')).toBeInTheDocument();
    expect(screen.getByText('Culto')).toBeInTheDocument();
  });

  it('opens create event flow from header action', () => {
    const handleOpenDialog = vi.fn();

    mockUseEventsPageState.mockReturnValue(
      createEventsState({
        handleOpenDialog,
      }),
    );

    renderWithProviders(<EventsPage />);

    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }));

    expect(handleOpenDialog).toHaveBeenCalledTimes(1);
  });

  it('renders empty tenant state when no tenant is linked', () => {
    mockUseEventsPageState.mockReturnValue(
      createEventsState({
        tenant: null,
        events: undefined,
      }),
    );

    renderWithProviders(<EventsPage />);

    expect(screen.getByText('Selecione uma organização')).toBeInTheDocument();
  });
});
