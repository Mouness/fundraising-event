import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { EventSettingsPage } from '@features/events/pages/EventSettingsPage'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '@core/lib/api'

// Mock API
vi.mock('@core/lib/api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
    VITE_API_URL: '/api',
    getApiErrorMessage: (_err: any, fallback: string) => fallback,
}))

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}))

// Mock Event Context
// Mock Event Context
const mockEvent = {
    id: 'evt_1',
    name: 'My Event',
    slug: 'my-event',
    goalAmount: 1000,
}
vi.mock('@features/events/context/EventContext', () => ({
    useEvent: () => ({
        event: mockEvent,
        isLoading: false,
    }),
}))

// Mock App Config
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        refreshConfig: vi.fn(),
    }),
}))

// Mock sub-components
// vi.mock('@features/events/components/event-settings/GeneralForm', () => ({
//     GeneralForm: () => {
//         const { useFormContext } = require('react-hook-form');
//         const context = useFormContext();
//         const name = context ? context.watch('name') : 'NoContext';
//         return <div data-testid="general-form">General Form: {name}</div>
//     }
// }));

vi.mock('@features/events/components/event-settings/BrandingForm', () => ({
    BrandingForm: () => <div data-testid="branding-form">Branding Form</div>,
}))

describe('EventSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(api.get).mockResolvedValue({
            data: {
                name: 'My Event',
                slug: 'my-event',
                goalAmount: 1000,
                status: 'active',
                formConfig: {
                    phone: { enabled: false, required: false },
                    address: { enabled: false, required: false },
                    company: { enabled: false, required: false },
                    message: { enabled: true, required: false },
                    anonymous: { enabled: true, required: false },
                },
            },
        })
    })

    const renderPage = () => {
        const testQueryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        return render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter>
                    <EventSettingsPage />
                </MemoryRouter>
            </QueryClientProvider>,
        )
    }

    it('renders the settings page title', async () => {
        renderPage()
        expect(screen.getByText('event_settings.title')).toBeInTheDocument()
    })

    it('navigates between sections', async () => {
        renderPage()

        // Check default section
        // Check default section
        expect(screen.getByText('event_settings.general.event_name')).toBeInTheDocument()

        // Switch to Branding
        const brandingButton = screen.getByText('event_settings.nav.branding')
        fireEvent.click(brandingButton)

        await waitFor(() => {
            expect(screen.queryByTestId('branding-form')).toBeInTheDocument()
        })
    })

    it('submits the form when save button is clicked', async () => {
        renderPage()

        // Wait for form to be populated
        await waitFor(() => {
            expect(screen.getByDisplayValue('My Event')).toBeInTheDocument()
        })

        const saveButton = screen.getByText('common.save_changes')

        vi.mocked(api.patch).mockResolvedValue({ data: {} })

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalled()
        })
    })
})
