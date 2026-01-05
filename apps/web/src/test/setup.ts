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

// Mock localStorage (robust version for jsdom)
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() { return Object.keys(store).length; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

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

// Mock i18next
vi.mock('i18next', () => ({
    default: {
        t: (key: string, options?: any) => {
            // if (options?.defaultValue) return options.defaultValue; 
            if (options?.count !== undefined) return `${key} ${options.count}`;
            return key;
        },
        language: 'en',
        changeLanguage: () => Promise.resolve(),
        use: () => ({
            init: () => Promise.resolve(),
            use: function () { return this; }
        }),
        init: () => Promise.resolve(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => {
    const useTranslation = () => ({
        t: (key: string, options?: any) => {
            if (options?.amount) return `${key} ${options.amount}`;
            return key;
        },
        i18n: {
            changeLanguage: () => Promise.resolve(),
            addResourceBundle: vi.fn(),
            language: 'en',
        },
    });

    return {
        useTranslation,
        initReactI18next: {
            type: '3rdParty',
            init: vi.fn(),
        },
        Trans: ({ children }: any) => children,
        Translation: ({ children }: any) => children({ t: (k: string) => k, i18n: {} } as any),
        default: {
            useTranslation,
            initReactI18next: {
                type: '3rdParty',
                init: vi.fn(),
            }
        }
    };
});

// Import zod-i18n to register the error map
import '@core/lib/zod-i18n';

// Mock @fundraising/white-labeling
vi.mock('@fundraising/white-labeling', () => {
    const defaultConfig = {
        id: 'test-event',
        slug: 'test-event',
        content: { title: 'Test Event' },
        payment: { currency: 'EUR', provider: 'stripe' },
        theme: { assets: {}, variables: {} }
    };

    let pState = { config: { ...defaultConfig } };

    return {
        initWhiteLabeling: vi.fn(async (apiUrl: string, slug?: string) => {
            // Mimic the real library fetching logic
            const url = slug
                ? `${apiUrl}/events/${slug}/settings`
                : `${apiUrl}/settings/global`;

            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    // Merge fetched data into config
                    pState.config = {
                        ...pState.config,
                        ...data,
                        content: { ...pState.config.content, ...data.content },
                        // If api returns id, use it
                        id: data.id || pState.config.id
                    };
                }
            } catch (error) {
                // ignore fetch errors in mock usually, or log
            }
        }),
        loadConfigs: vi.fn(() => pState.config),
        loadAssets: vi.fn(() => ({})),
        loadTheme: vi.fn(() => ({})),
        loadLocales: vi.fn(() => ({ en: {}, fr: {} })),
        resetWhiteLabelStore: vi.fn(() => {
            pState.config = { ...defaultConfig };
        }),
        syncLocales: vi.fn(),
        useWhiteLabeling: vi.fn(() => ({
            initWhiteLabeling: vi.fn(() => Promise.resolve()),
            loadConfigs: () => pState.config,
            loadAssets: () => ({}),
            loadTheme: () => ({}),
            syncLocales: vi.fn(),
            store: {
                getState: () => ({ config: pState.config }),
                subscribe: vi.fn(),
            }
        }))
    };
});

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}));

// Mock useCurrencyFormatter
vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (amount: number, options?: any) => {
            const currency = options?.currency || 'EUR';
            return `useCurrencyFormatter:${amount}:${currency}`;
        },
        currency: 'EUR'
    }),
}));
