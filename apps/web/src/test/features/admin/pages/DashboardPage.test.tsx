import { render, screen } from '@testing-library/react';
import { DashboardPage } from '@/features/admin/pages/DashboardPage';
import { useEvents } from '@features/events/hooks/useEvents';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@features/events/hooks/useEvents');
vi.mock('@/features/admin/components/DonationChart', () => ({
    DonationChart: () => <div data-testid="donation-chart">Chart</div>,
}));
vi.mock('@/features/admin/components/RecentActivity', () => ({
    RecentActivity: () => <div data-testid="recent-activity">Activity</div>,
}));
vi.mock('@features/events/components/EventCard', () => ({
    EventCard: ({ event }: any) => <div data-testid="event-card">{event.title}</div>,
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        (useEvents as any).mockReturnValue({ events: [], isLoading: true });
        const { container } = render(<DashboardPage />, { wrapper: MemoryRouter });
        expect(container.querySelector('.animate-spin')).toBeDefined();
    });

    it('renders dashboard with stats and activity', () => {
        const mockEvents = [
            { id: '1', title: 'Event 1', raised: 1000, donorCount: 10, status: 'ACTIVE' },
            { id: '2', title: 'Event 2', raised: 500, donorCount: 5, status: 'DRAFT' },
        ];
        (useEvents as any).mockReturnValue({ events: mockEvents, isLoading: false });

        render(<DashboardPage />, { wrapper: MemoryRouter });

        expect(screen.getByText('dashboard.title')).toBeDefined();
        expect(screen.getByText('useCurrencyFormatter:1500:EUR')).toBeDefined(); // 1000 + 500
        expect(screen.getByText('1')).toBeDefined(); // activeEventsCount
        expect(screen.getByText('15')).toBeDefined(); // totalDonors

        expect(screen.getByTestId('donation-chart')).toBeDefined();
        expect(screen.getByTestId('recent-activity')).toBeDefined();
        expect(screen.getByTestId('event-card')).toBeDefined();
    });

    it('renders empty campaigns message when no active events', () => {
        (useEvents as any).mockReturnValue({ events: [], isLoading: false });
        render(<DashboardPage />, { wrapper: MemoryRouter });
        expect(screen.getByText('dashboard.campaigns.empty')).toBeDefined();
    });
});
