import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes';

describe('ROUTES', () => {
  it('builds public routes with params', () => {
    expect(ROUTES.PUBLIC.BIBLE_READER('gn', 1)).toBe('/bible/gn/1');
    expect(ROUTES.PUBLIC.HYMNAL_READER(5)).toBe('/hymnal/5');
    expect(ROUTES.PUBLIC.MANUAL_ARTICLE('cap-1')).toBe('/manual/cap-1');
  });

  it('builds admin detail routes', () => {
    expect(ROUTES.ADMIN.EDUCATION_CLASS('turma-1')).toBe('/admin/education/turma-1');
  });

  it('exposes stable root routes', () => {
    expect(ROUTES.AUTH.LOGIN).toBe('/login');
    expect(ROUTES.ADMIN.ROOT).toBe('/admin');
    expect(ROUTES.MEMBER.ROOT).toBe('/member');
  });
});
