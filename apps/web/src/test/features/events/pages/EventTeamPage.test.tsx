import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventTeamPage } from '@/features/events/pages/EventTeamPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/core/lib/api';
import * as EventContext from '@/features/events/context/EventContext';

vi.mock('@/core/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/features/events/context/EventContext', () => ({
    useEvent: vi.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const mockEvent = {
    id: 'evt_1',
    slug: 'test-event',
    name: 'Test Event',
};

describe('EventTeamPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(EventContext.useEvent).mockReturnValue({
            event: mockEvent as any,
            isLoading: false,
            error: null
        });

        vi.mocked(api.post).mockResolvedValue({ data: {} });
        vi.mocked(api.delete).mockResolvedValue({ data: {} });

        vi.mocked(api.get).mockImplementation((url) => {
            if (url.includes('/staff')) {
                if (url.includes('/events/evt_1/staff')) {
                    return Promise.resolve({ data: [{ id: 's1', name: 'Assigned Staff' }] });
                }
                return Promise.resolve({ data: [{ id: 's1', name: 'Assigned Staff' }, { id: 's2', name: 'Global Staff' }] });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    const renderPage = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <EventTeamPage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    it('should render staff lists', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Assigned Staff')).toBeInTheDocument();
            expect(screen.getByText('Global Staff')).toBeInTheDocument();
        });
    });

    it('should call assign mutation when pool member is clicked', async () => {
        renderPage();

        const plusButton = await screen.findByText('Global Staff');
        fireEvent.click(plusButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/events/evt_1/staff/s2');
        });
    });

    it('should call unassign mutation when trash button is clicked', async () => {
        renderPage();

        const staffMember = await screen.findByText('Assigned Staff');
        // The trash button is an icon button next to the name
        const row = staffMember.parentElement!;
        const trashButton = row.querySelector('button')!;

        fireEvent.click(trashButton);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/events/evt_1/staff/s1');
        });
    });
});
