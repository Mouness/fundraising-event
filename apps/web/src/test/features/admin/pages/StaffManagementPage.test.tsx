import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StaffManagementPage } from '@/features/admin/pages/StaffManagementPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestWrapper } from '@/test/utils';

const { mockApi } = vi.hoisted(() => {
    return {
        mockApi: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        }
    }
});

vi.mock('@/lib/api', () => ({
    api: mockApi,
}));

// Mock Toasts
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('StaffManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockApi.get.mockResolvedValue({ data: [] }); // Default empty
    });

    it('renders usage instructions and title', async () => {
        render(
            <TestWrapper>
                <StaffManagementPage />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('admin_team.manage_title')).toBeInTheDocument();
            expect(screen.getByText('admin_team.add_member')).toBeInTheDocument();
        });
    });

    it('fetches and displays staff list', async () => {
        mockApi.get.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'John Doe', code: '1234', _count: { events: 2 } },
                { id: '2', name: 'Jane Smith', code: '5678', _count: { events: 0 } }
            ]
        });

        render(
            <TestWrapper>
                <StaffManagementPage />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('1234')).toBeInTheDocument();
        });
    });

    it('opens add member dialog on click', async () => {
        render(
            <TestWrapper>
                <StaffManagementPage />
            </TestWrapper>
        );

        const addButton = screen.getByText('admin_team.add_member');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('admin_team.member_name')).toBeInTheDocument();
        });
    });

    it('validates form inputs', async () => {
        render(
            <TestWrapper>
                <StaffManagementPage />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('admin_team.add_member'));

        const submitButton = screen.getByText('admin_team.add_member', { selector: 'button[type="submit"]' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Validation errors (mocked t function returns keys)
            expect(screen.getAllByText(/validation/i).length).toBeGreaterThan(0);
        });
    });
});
