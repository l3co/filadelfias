import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { BibleReaderPage } from './BibleReaderPage';
import { renderWithProviders } from '../../test/utils';

vi.mock('../../hooks/useBibleVersion', () => ({
  useBibleVersion: vi.fn(),
}));

vi.mock('../../hooks/useBible', () => ({
  useBibleBooks: vi.fn(),
  useBibleChapter: vi.fn(),
  useBibleHighlights: vi.fn(),
  useBibleNotes: vi.fn(),
  useCreateBibleHighlight: vi.fn(),
  useCreateBibleNote: vi.fn(),
  useDeleteBibleHighlight: vi.fn(),
  useDeleteBibleNote: vi.fn(),
  useUpdateBibleNote: vi.fn(),
}));

vi.mock('../../features/bible/components/BibleVersionSelector', () => ({
  BibleVersionSelector: vi.fn(() => <div>Version Selector</div>),
}));

vi.mock('../../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/AuthContext')>();

  return {
    ...actual,
    useAuthTenant: vi.fn(),
    useAuthUser: vi.fn(),
  };
});

import { useBibleVersion } from '../../hooks/useBibleVersion';
import {
  useBibleBooks,
  useBibleChapter,
  useBibleHighlights,
  useBibleNotes,
  useCreateBibleHighlight,
  useCreateBibleNote,
  useDeleteBibleHighlight,
  useDeleteBibleNote,
  useUpdateBibleNote,
} from '../../hooks/useBible';
import { useAuthTenant, useAuthUser } from '../../contexts/AuthContext';

const mutationStub = () => ({
  mutateAsync: vi.fn(),
  isPending: false,
});

const mockUseBibleVersion = vi.mocked(useBibleVersion);
const mockUseBibleBooks = vi.mocked(useBibleBooks);
const mockUseBibleChapter = vi.mocked(useBibleChapter);
const mockUseBibleHighlights = vi.mocked(useBibleHighlights);
const mockUseBibleNotes = vi.mocked(useBibleNotes);
const mockUseCreateBibleHighlight = vi.mocked(useCreateBibleHighlight);
const mockUseCreateBibleNote = vi.mocked(useCreateBibleNote);
const mockUseDeleteBibleHighlight = vi.mocked(useDeleteBibleHighlight);
const mockUseDeleteBibleNote = vi.mocked(useDeleteBibleNote);
const mockUseUpdateBibleNote = vi.mocked(useUpdateBibleNote);
const mockUseAuthTenant = vi.mocked(useAuthTenant);
const mockUseAuthUser = vi.mocked(useAuthUser);

describe('BibleReaderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: vi.fn(),
        speak: vi.fn(),
      },
    });

    localStorage.clear();
    localStorage.setItem('bible-font-size', '18');

    mockUseBibleVersion.mockReturnValue({
      version: 'nvi',
      setVersion: vi.fn(),
    });
    mockUseBibleBooks.mockReturnValue({
      data: [{ abbrev: 'gn', name: 'Gênesis', chapters_count: 50, testament: 'old' }],
    } as ReturnType<typeof useBibleBooks>);
    mockUseBibleChapter.mockReturnValue({
      data: {
        book_abbrev: 'gn',
        book_name: 'Gênesis',
        chapter: 1,
        verses: ['No princípio criou Deus os céus e a terra.', 'A terra era sem forma.'],
        previous_chapter: null,
        next_chapter: { book: 'gn', chapter: 2 },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useBibleChapter>);
    mockUseBibleNotes.mockReturnValue({
      data: [{ id: 'note-1', verse: 1, content: 'Minha nota', chapter: 1, book_abbrev: 'gn', version_code: 'nvi', is_public: false, created_at: '', updated_at: '' }],
    } as ReturnType<typeof useBibleNotes>);
    mockUseBibleHighlights.mockReturnValue({
      data: [{ id: 'highlight-1', verse: 1, color: 'yellow', chapter: 1, book_abbrev: 'gn', version_code: 'nvi', created_at: '' }],
    } as ReturnType<typeof useBibleHighlights>);
    mockUseCreateBibleHighlight.mockReturnValue(mutationStub() as ReturnType<typeof useCreateBibleHighlight>);
    mockUseCreateBibleNote.mockReturnValue(mutationStub() as ReturnType<typeof useCreateBibleNote>);
    mockUseDeleteBibleHighlight.mockReturnValue(mutationStub() as ReturnType<typeof useDeleteBibleHighlight>);
    mockUseDeleteBibleNote.mockReturnValue(mutationStub() as ReturnType<typeof useDeleteBibleNote>);
    mockUseUpdateBibleNote.mockReturnValue(mutationStub() as ReturnType<typeof useUpdateBibleNote>);
    mockUseAuthTenant.mockReturnValue({ id: 'tenant-1', name: 'Igreja Teste', slug: 'igreja-teste' });
    mockUseAuthUser.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' } as never);
  });

  it('renders chapter content, study mode summary and next navigation', () => {
    renderWithProviders(
      <Routes>
        <Route path="/bible/:book/:chapter" element={<BibleReaderPage />} />
      </Routes>,
      { initialRoute: '/bible/gn/1' }
    );

    expect(screen.getByText('Gênesis')).toBeInTheDocument();
    expect(screen.getByText('Capítulo 1')).toBeInTheDocument();
    expect(screen.getByText(/Modo de estudo ativo/i)).toBeInTheDocument();
    expect(screen.getByText('1 notas · 1 destaques')).toBeInTheDocument();
    expect(screen.getByText(/No princípio criou Deus os céus e a terra\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GN 2/i })).toHaveAttribute('href', '/bible/gn/2');
  });

  it('persists font-size changes in localStorage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/bible/:book/:chapter" element={<BibleReaderPage />} />
      </Routes>,
      { initialRoute: '/bible/gn/1' }
    );

    fireEvent.click(screen.getByTitle('Aumentar fonte'));

    expect(localStorage.getItem('bible-font-size')).toBe('20');
  });

  it('shows not-found state when chapter loading fails', () => {
    mockUseBibleChapter.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useBibleChapter>);

    renderWithProviders(
      <Routes>
        <Route path="/bible/:book/:chapter" element={<BibleReaderPage />} />
      </Routes>,
      { initialRoute: '/bible/gn/999' }
    );

    expect(screen.getByText('Capítulo não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para índice/i })).toHaveAttribute('href', '/bible');
  });
});
