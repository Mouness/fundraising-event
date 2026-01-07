import { render, screen } from '@testing-library/react';
import { EventDashboardPage } from '@/features/events/pages/EventDashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as useEventsHook from '@/features/events/hooks/useEvents';

vi.mock('@/features/events/hooks/useEvents', () => ({
    useEvents: vi.fn(),
}));

vi.mock('@/features/events/components/RecentDonationsList', () => ({
    RecentDonationsList: () => <div data-testid="recent-donations-list">Recent Donations</div>
}));

const queryClient = new QueryClient();

describe('EventDashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = (slug: string) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/admin/events/${slug}`]}>
                    <Routes>
                        <Route path="/admin/events/:slug" element={<EventDashboardPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    it('should render event details and stats', () => {
        vi.mocked(useEventsHook.useEvents).mockReturnValue({
            events: [{ id: '1', name: 'My Special Event', slug: 'my-event', raised: 50000, goalAmount: 100000, donorCount: 50, status: 'ACTIVE' }],
            isLoading: false,
        } as any);

        renderPage('my-event');

        expect(screen.getByText('My Special Event')).toBeInTheDocument();
        // check raised amount (mock currency formatter is used)
        expect(screen.getByText(/50000/)).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByTestId('recent-donations-list')).toBeInTheDocument();
    });

    it('should return null if event not found', () => {
        vi.mocked(useEventsHook.useEvents).mockReturnValue({
            events: [],
            isLoading: false,
        } as any);

        const { container } = renderPage('non-existent');
        expect(container.firstChild).toBeNull();
    });
});
