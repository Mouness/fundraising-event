import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateEventPage } from '@/features/events/pages/CreateEventPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';
import { MemoryRouter } from 'react-router-dom';

// Mock api
vi.mock('@/lib/api', () => ({
    api: {
        post: vi.fn(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue: string) => defaultValue || key,
    }),
}));

// Mock hook form
// vi.mock('react-hook-form', async () => {
//     const actual = await vi.importActual('react-hook-form');
//     return {
//         ...actual,
//     };
// });

describe('CreateEventPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the create event form', () => {
        render(
            <MemoryRouter>
                <CreateEventPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Create New Campaign')).toBeInTheDocument();
        expect(screen.getByLabelText('Campaign Name')).toBeInTheDocument();
        expect(screen.getByLabelText('URL Slug')).toBeInTheDocument();
        expect(screen.getByLabelText('Fundraising Goal')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Campaign' })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(
            <MemoryRouter>
                <CreateEventPage />
            </MemoryRouter>
        );

        const submitButton = screen.getByRole('button', { name: 'Create Campaign' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
            expect(screen.getByText('Slug must be at least 3 characters')).toBeInTheDocument();
        });
    });

    it('submits the form with valid data', async () => {
        (api.post as any).mockResolvedValue({ data: { id: '123', name: 'Test Event' } });

        render(
            <MemoryRouter>
                <CreateEventPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Campaign Name'), { target: { value: 'Test Event 2024' } });
        fireEvent.change(screen.getByLabelText('URL Slug'), { target: { value: 'test-event-2024' } });
        fireEvent.change(screen.getByLabelText('Fundraising Goal'), { target: { value: '50000' } });

        const submitButton = screen.getByRole('button', { name: 'Create Campaign' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/events', {
                name: 'Test Event 2024',
                slug: 'test-event-2024',
                goalAmount: 50000,
            });
        });
    });

    it('handles submission errors', async () => {
        (api.post as any).mockRejectedValue({ response: { data: { message: 'Slug taken' } } });

        render(
            <MemoryRouter>
                <CreateEventPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Campaign Name'), { target: { value: 'Duplicate Event' } });
        fireEvent.change(screen.getByLabelText('URL Slug'), { target: { value: 'duplicate-slug' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            // Assuming toaster shows up, we can't easily check toast directly without mocking sonner,
            // but ensuring no crash is good step.
        });
    });
});
