import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest assertions with jest-dom
expect.extend(matchers);

// Clean up after each test (unmount components)
afterEach(() => {
    cleanup();
});

// Mock ResizeObserver (missing in jsdom)
vi.stubGlobal('ResizeObserver', class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
});

// Mock matchMedia (for responsive components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (options?.amount) return `${key} ${options.amount}`;
            return key;
        },
        i18n: {
            changeLanguage: () => Promise.resolve(),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
    Trans: ({ children }: any) => children,
    Translation: ({ children }: any) => children(({ t: (k: string) => k, i18n: {} } as any)),
}));
