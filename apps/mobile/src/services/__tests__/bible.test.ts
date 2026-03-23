import { bibleService } from '../bible';
import { api } from '@/services/api';

jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('bibleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests chapter content with the selected version', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { book_abbrev: 'gn', chapter: 1, verses: ['No princípio'] },
    });

    const chapter = await bibleService.getChapter('gn', 1, 'nvi');

    expect(mockApi.get).toHaveBeenCalledWith('/bible/gn/1', { params: { version: 'nvi' } });
    expect(chapter.book_abbrev).toBe('gn');
  });

  it('maps bible search params to the API contract', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { results: [], total: 0, query: 'amor', version: 'nvi' },
    });

    await bibleService.searchVerses({
      query: 'amor',
      version: 'nvi',
      testament: 'NT',
      limit: 50,
      offset: 10,
    });

    expect(mockApi.get).toHaveBeenCalledWith('/bible/search', {
      params: {
        q: 'amor',
        version: 'nvi',
        testament: 'NT',
        limit: 50,
        offset: 10,
      },
    });
  });

  it('includes tenant and reading filters when fetching notes', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    await bibleService.getNotes('tenant-1', { version: 'nvi', book: 'jo', chapter: 3 });

    expect(mockApi.get).toHaveBeenCalledWith('/bible/notes', {
      params: {
        tenant_id: 'tenant-1',
        version: 'nvi',
        book: 'jo',
        chapter: 3,
      },
    });
  });

  it('creates highlights with the expected payload', async () => {
    const payload = {
      tenant_id: 'tenant-1',
      version_code: 'nvi',
      book_abbrev: 'sl',
      chapter: 23,
      verse: 1,
      color: 'yellow',
      category: 'promise',
    };
    mockApi.post.mockResolvedValueOnce({ data: { id: 'highlight-1', ...payload } });

    const highlight = await bibleService.createHighlight(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/bible/highlights', payload);
    expect(highlight.id).toBe('highlight-1');
  });

  it('marks reading-plan progress with the selected day', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { id: 'progress-1', plan_id: 'plan-1', current_day: 2, completed_readings: [1] },
    });

    const progress = await bibleService.markReadingPlanDay('plan-1', 1);

    expect(mockApi.post).toHaveBeenCalledWith('/bible/reading-plans/plan-1/progress', { day: 1 });
    expect(progress.current_day).toBe(2);
  });
});
