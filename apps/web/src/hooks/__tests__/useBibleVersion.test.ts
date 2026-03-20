/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBibleVersion } from '../useBibleVersion';

describe('useBibleVersion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses nvi as the default version when storage is empty', () => {
    const { result } = renderHook(() => useBibleVersion());

    expect(result.current.version).toBe('nvi');
  });

  it('hydrates the version from localStorage', () => {
    localStorage.setItem('bible_version', 'ara');

    const { result } = renderHook(() => useBibleVersion());

    expect(result.current.version).toBe('ara');
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useBibleVersion());

    act(() => {
      result.current.setVersion('acf');
    });

    expect(result.current.version).toBe('acf');
    expect(localStorage.getItem('bible_version')).toBe('acf');
  });
});
