import { render, screen, waitFor } from '@testing-library/react';
import { DonationsPage } from '@/features/events/pages/DonationsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockEvent = { id: 'evt_1', name: 'Test Event', slug: 'test-event', currency: 'USD' };

// Mock hooks
vi.mock('@/features/events/context/EventContext', () => ({
    useEvent: () => ({
        event: mockEvent,
        isLoading: false,
    }),
}));

vi.mock('@/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (amount: number) => `$${amount}`,
    }),
}));

vi.mock('@/features/events/hooks/useDonationsTable', () => ({
    useDonationsTable: (eventId: string) => ({
        donations: [
            { id: 'don_1', donorName: 'John Doe', amount: 5000, currency: 'USD', status: 'COMPLETED', createdAt: new Date().toISOString() },
        ],
        total: 1,
        pageCount: 1,
        isLoading: false,
        page: 1,
        setPage: vi.fn(),
        search: '',
        setSearch: vi.fn(),
        status: 'all',
        setStatus: vi.fn(),
    }),
}));

// Mock child components to avoid context issues
vi.mock('@/features/events/components/EditDonationDialog', () => ({
    EditDonationDialog: () => <div data-testid="edit-donation-dialog">Edit Dialog</div>
}));

vi.mock('@/features/events/components/CancelDonationDialog', () => ({
    CancelDonationDialog: () => <div data-testid="cancel-donation-dialog">Cancel Dialog</div>
}));

describe('DonationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the donations table', () => {
        render(
            <MemoryRouter>
                <DonationsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('admin_events.donations')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('$50')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
});
