import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DonationsPage } from '@/features/events/pages/DonationsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/core/lib/api';
import * as EventContext from '@/features/events/context/EventContext';
import * as useDonationsTableHook from '@/features/events/hooks/useDonationsTable';

vi.mock('@/core/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
    getApiErrorMessage: vi.fn(() => 'Error'),
}));

vi.mock('@/features/events/context/EventContext', () => ({
    useEvent: vi.fn(),
}));

vi.mock('@/features/events/hooks/useDonationsTable', () => ({
    useDonationsTable: vi.fn(),
}));

// Mock dialogs to avoid complexity
vi.mock('@/features/events/components/EditDonationDialog', () => ({
    EditDonationDialog: ({ open }: any) => open ? <div data-testid="edit-dialog">Edit Dialog Open</div> : null
}));

vi.mock('@/features/events/components/CancelDonationDialog', () => ({
    CancelDonationDialog: ({ open }: any) => open ? <div data-testid="cancel-dialog">Cancel Dialog Open</div> : null
}));

const queryClient = new QueryClient();

const mockEvent = {
    id: 'evt_1',
    slug: 'test-event',
    name: 'Test Event',
    goalAmount: 10000,
};

describe('DonationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(EventContext.useEvent).mockReturnValue({
            event: mockEvent as any,
            isLoading: false,
            error: null
        });

        vi.mocked(useDonationsTableHook.useDonationsTable).mockReturnValue({
            donations: [
                {
                    id: 'd1',
                    amount: 1000,
                    currency: 'EUR',
                    donorName: 'John',
                    donorEmail: 'john@example.com',
                    paymentMethod: 'stripe',
                    isAnonymous: false,
                    status: 'COMPLETED',
                    createdAt: new Date().toISOString()
                }
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
            refetch: vi.fn()
        } as any);
    });

    const renderPage = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DonationsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    it('should render the page with donations', () => {
        renderPage();
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('useCurrencyFormatter:10:EUR')).toBeInTheDocument();
    });

    it('should call export when export button is clicked', async () => {
        renderPage();
        const exportButton = screen.getByText('admin_events.export');

        vi.mocked(api.get).mockResolvedValue({ data: new Blob() });
        window.URL.createObjectURL = vi.fn(() => 'mock-url');

        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/donations/export'), expect.any(Object));
        });
    });

    it('should call export pdf when export pdf button is clicked', async () => {
        renderPage();
        const exportButton = screen.getByText('admin_events.export_pdf');

        vi.mocked(api.get).mockResolvedValue({ data: new Blob() });
        window.URL.createObjectURL = vi.fn(() => 'mock-url');

        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/export/receipts/zip'), expect.any(Object));
        });
    });

    it('should show loading state', () => {
        vi.mocked(useDonationsTableHook.useDonationsTable).mockReturnValue({
            donations: [],
            total: 0,
            pageCount: 0,
            isLoading: true,
            page: 1,
            setPage: vi.fn(),
            search: '',
            setSearch: vi.fn(),
            status: 'all',
            setStatus: vi.fn(),
            refetch: vi.fn()
        } as any);

        renderPage();
        expect(screen.getByText('common.loading')).toBeInTheDocument();
    });

    it('should handle pagination', () => {
        const setPage = vi.fn();
        vi.mocked(useDonationsTableHook.useDonationsTable).mockReturnValue({
            donations: [],
            total: 20,
            pageCount: 2,
            isLoading: false,
            page: 1,
            setPage: setPage,
            search: '',
            setSearch: vi.fn(),
            status: 'all',
            setStatus: vi.fn(),
            refetch: vi.fn()
        } as any);

        renderPage();
        const nextButton = screen.getByRole('link', { name: /next/i });
        fireEvent.click(nextButton);
        expect(setPage).toHaveBeenCalledWith(2);
    });

    it('should handle previous interaction', () => {
        const setPage = vi.fn();
        vi.mocked(useDonationsTableHook.useDonationsTable).mockReturnValue({
            donations: [],
            total: 20,
            pageCount: 2,
            isLoading: false,
            page: 2, // On page 2 so Previous is enabled
            setPage: setPage,
            search: '',
            setSearch: vi.fn(),
            status: 'all',
            setStatus: vi.fn(),
            refetch: vi.fn()
        } as any);

        renderPage();
        const prevButton = screen.getByRole('link', { name: /previous/i });
        fireEvent.click(prevButton);
        expect(setPage).toHaveBeenCalledWith(1);
    });

    it('should open edit dialog when edit action is clicked', async () => {
        const user = userEvent.setup();
        renderPage();

        // Open dropdown
        const menuButton = screen.getByRole('button', { name: /open menu/i });
        await user.click(menuButton);

        // Click Edit
        const editButton = await screen.findByText('common.edit');
        await user.click(editButton);

        expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    });

    it('should open cancel dialog when cancel action is clicked', async () => {
        const user = userEvent.setup();
        renderPage();

        // Open dropdown
        const menuButton = screen.getByRole('button', { name: /open menu/i });
        await user.click(menuButton);

        // Click Cancel
        const cancelButton = await screen.findByText('common.cancel');
        await user.click(cancelButton);

        expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument();
    });

    it('should download receipt when receipt action is clicked', async () => {
        const user = userEvent.setup();
        renderPage();

        // Open dropdown
        const menuButton = screen.getByRole('button', { name: /open menu/i });
        await user.click(menuButton);

        // Click Receipt
        const receiptButton = await screen.findByText('admin_events.download_receipt');

        // Mock API for single receipt
        vi.mocked(api.get).mockResolvedValue({ data: new Blob() });
        window.URL.createObjectURL = vi.fn(() => 'mock-receipt-url');

        await user.click(receiptButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/receipt'), expect.any(Object));
        });
    });
});
