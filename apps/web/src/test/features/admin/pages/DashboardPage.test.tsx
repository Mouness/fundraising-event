import { render, screen } from '@testing-library/react';
import { DashboardPage } from '@features/admin/pages/DashboardPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@core/lib/api');

// Mock hooks
vi.mock('@features/events/hooks/useEvents', () => ({
    useEvents: () => ({
        events: [
            { id: '1', name: 'Gala', status: 'ACTIVE', raised: 1000, goalAmount: 5000, donorCount: 10, slug: 'gala' }
        ],
        isLoading: false
    })
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (val: number) => `$${val}`
    })
}));

// Mock UI components (Keep standard mocks or use library)
// Since we are unit testing, shallow rendering or mocking complex UI is fine, 
// but sticking to real UI components if possible is better if they are simple.
// However, Card, etc are shadcn components, usually fine to render.
// But valid existing mocks were:
vi.mock('lucide-react', () => ({
    Loader2: () => <span>Loading...</span>,
    Download: () => <span>Download</span>,
    TrendingUp: () => <span>Icon</span>,
    Users: () => <span>Icon</span>,
    Calendar: () => <span>Icon</span>,
    ArrowRight: () => <span>Icon</span>,
}));



describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render dashboard components', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );
        expect(screen.getByText('dashboard.title')).toBeDefined();
        // Stats
        expect(screen.getByText('dashboard.stats.revenue')).toBeDefined();
        expect(screen.getAllByText('$1000').length).toBeGreaterThan(0);
        // Campaigns
        expect(screen.getByText('Gala')).toBeDefined();
    });


});
