import { render, screen, waitFor } from '@testing-library/react';
import { EventSettingsPage } from '@features/events/pages/EventSettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock API
vi.mock('@core/lib/api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Event Context
vi.mock('@features/events/context/EventContext', () => ({
    useEvent: () => ({
        event: { id: 'evt_1', name: 'My Event', slug: 'my-event', goalAmount: 1000 },
        isLoading: false,
    }),
}));

// Mock App Config
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        refreshConfig: vi.fn(),
    }),
}));

// Mock sub-components
vi.mock('@features/events/components/event-settings/GeneralForm', () => ({
    GeneralForm: () => <div data-testid="general-form">General Form</div>
}));

vi.mock('@features/events/components/event-settings/BrandingForm', () => ({
    BrandingForm: () => <div data-testid="branding-form">Branding Form</div>
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

describe('EventSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the settings page title', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <EventSettingsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('event_settings.title')).toBeInTheDocument();
    });

    it('navigates between sections', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <EventSettingsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Check default section
        expect(screen.getByTestId('general-form')).toBeInTheDocument();

        // Switch to Branding
        const brandingButton = screen.getByText('event_settings.nav.branding');
        brandingButton.click();

        await waitFor(() => {
            expect(screen.queryByTestId('branding-form')).toBeInTheDocument();
        });
    });
});
