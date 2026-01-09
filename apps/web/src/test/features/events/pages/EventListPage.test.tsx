import { render, screen } from '@testing-library/react'
import { EventListPage } from '@/features/events/pages/EventListPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as useEventsHook from '@/features/events/hooks/useEvents'

vi.mock('@/features/events/hooks/useEvents', () => ({
    useEvents: vi.fn(),
}))

// Mock EventCard as it might have its own complex logic
vi.mock('../components/EventCard', () => ({
    EventCard: ({ event }: any) => <div data-testid="event-card">{event.name}</div>,
}))

const queryClient = new QueryClient()

describe('EventListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderPage = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <EventListPage />
                </MemoryRouter>
            </QueryClientProvider>,
        )
    }

    it('should render loading state', () => {
        vi.mocked(useEventsHook.useEvents).mockReturnValue({
            events: [],
            isLoading: true,
        } as any)

        renderPage()
        expect(screen.getByTestId('page-loader')).toBeInTheDocument()
    })

    it('should render events', () => {
        vi.mocked(useEventsHook.useEvents).mockReturnValue({
            events: [
                { id: '1', name: 'Event 1' },
                { id: '2', name: 'Event 2' },
            ],
            isLoading: false,
        } as any)

        renderPage()
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
    })
})
