/**
 * Setup para testes unitários com Vitest.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mock do matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// Mock do localStorage (com storage real para testes)
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
    getItem: (key: string) => localStorageStore[key] || null,
    setItem: (key: string, value: string) => { localStorageStore[key] = value; },
    removeItem: (key: string) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]); },
    length: 0,
    key: () => null,
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do scrollTo
window.scrollTo = () => {};
