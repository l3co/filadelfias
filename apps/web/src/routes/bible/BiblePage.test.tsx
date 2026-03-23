import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BiblePage } from './BiblePage';
import { renderWithProviders } from '../../test/utils';

vi.mock('../../hooks/useBibleVersion', () => ({
  useBibleVersion: vi.fn(),
}));

vi.mock('../../hooks/useBible', () => ({
  useBibleBooks: vi.fn(),
  useBibleSearch: vi.fn(),
}));

vi.mock('../../features/bible/components/BibleVersionSelector', () => ({
  BibleVersionSelector: vi.fn(() => <div>Version Selector</div>),
}));

import { useBibleVersion } from '../../hooks/useBibleVersion';
import { useBibleBooks, useBibleSearch } from '../../hooks/useBible';

const mockUseBibleVersion = vi.mocked(useBibleVersion);
const mockUseBibleBooks = vi.mocked(useBibleBooks);
const mockUseBibleSearch = vi.mocked(useBibleSearch);

describe('BiblePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseBibleVersion.mockReturnValue({
      version: 'nvi',
      setVersion: vi.fn(),
    });

    mockUseBibleBooks.mockReturnValue({
      data: [
        { abbrev: 'gn', name: 'Gênesis', chapters_count: 50, testament: 'old' },
        { abbrev: 'jo', name: 'João', chapters_count: 21, testament: 'new' },
      ],
      isLoading: false,
    } as ReturnType<typeof useBibleBooks>);

    mockUseBibleSearch.mockReturnValue({
      data: {
        total: 1,
        results: [
          {
            book: 'João',
            book_abbrev: 'jo',
            chapter: 3,
            verse: 16,
            text: 'Porque Deus amou o mundo...',
            reference: 'João 3:16',
          },
        ],
      },
      isFetching: false,
    } as ReturnType<typeof useBibleSearch>);
  });

  it('renders testament sections, books and search results', () => {
    renderWithProviders(<BiblePage />, { initialRoute: '/bible?q=amor&testament=NT' });

    expect(screen.getByText('Bíblia Sagrada')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Antigo Testamento' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo Testamento' })).toBeInTheDocument();
    expect(screen.getByText('Gênesis')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('João 3:16')).toBeInTheDocument();
    expect(screen.getByDisplayValue('amor')).toBeInTheDocument();
  });

  it('clears search input and testament filter', async () => {
    renderWithProviders(<BiblePage />, { initialRoute: '/bible?q=amor&testament=NT' });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar por palavra, tema ou expressão')).toHaveValue('');
    });

    expect(screen.getByDisplayValue('Toda a Bíblia')).toBeInTheDocument();
  });
});
