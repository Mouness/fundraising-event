import { render, screen, waitFor } from '@testing-library/react';
import { AppConfigProvider, useAppConfig } from '@/providers/AppConfigProvider';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WhiteLabelStore } from '@fundraising/white-labeling';

// Component to display config for verification
const ConfigDisplay = () => {
    const { config } = useAppConfig();
    return (
        <div>
            <h1 data-testid="event-title">{config.content.title}</h1>
            <div data-testid="event-slug">{config.id}</div>
        </div>
    );
};

// Wrapper that mimics the router structure
const TestWrapper = () => {
    const { slug } = useParams<{ slug: string }>();
    return (
        <AppConfigProvider slug={slug}>
            <ConfigDisplay />
        </AppConfigProvider>
    );
};

describe('Multi-Event Integration', () => {
    const mockEvents = [
        {
            id: 'evt_winter',
            slug: 'winter-gala',
            name: 'Winter Gala 2025',
            goalAmount: 50000,
            themeConfig: { variables: {} }
        },
        {
            id: 'evt_summer',
            slug: 'summer-run',
            name: 'Summer Charity Run',
            goalAmount: 10000,
            themeConfig: { variables: {} }
        }
    ];

    beforeEach(() => {
        // Reset store
        WhiteLabelStore.reset();

        // Mock fetch
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockEvents)
            })
        ));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('loads the correct event config for "winter-gala" slug', async () => {
        render(
            <MemoryRouter initialEntries={['/winter-gala']}>
                <Routes>
                    <Route path="/:slug" element={<TestWrapper />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('event-title')).toHaveTextContent('Winter Gala 2025');
        });
    });

    it('loads the correct event config for "summer-run" slug', async () => {
        render(
            <MemoryRouter initialEntries={['/summer-run']}>
                <Routes>
                    <Route path="/:slug" element={<TestWrapper />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('event-title')).toHaveTextContent('Summer Charity Run');
        });
    });

    it('loads the platform portal config for root path "/"', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<TestWrapper />} />
                    <Route path="/:slug" element={<TestWrapper />} />
                </Routes>
            </MemoryRouter>
        );

        // Should load the Generic Platform config
        await waitFor(() => {
            expect(screen.getByTestId('event-title')).toHaveTextContent('Fundraising Platform');
            expect(screen.getByTestId('event-slug')).toHaveTextContent('platform');
        });
    });
});
