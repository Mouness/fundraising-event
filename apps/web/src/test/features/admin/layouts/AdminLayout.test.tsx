import { render, screen, waitFor } from '@testing-library/react';
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';
import { vi, describe, it, expect } from 'vitest';
import { TestWrapper } from '@/test/utils';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock child components
vi.mock('@/components/ui/page-loader', () => ({
    PageLoader: () => <div data-testid="page-loader">Loading...</div>
}));

vi.mock('@/components/AppHeader', () => ({
    AppHeader: ({ title }: { title: string }) => <div data-testid="app-header">{title}</div>
}));

describe('AdminLayout', () => {
    it('renders header and sidebar links', async () => {
        render(
            <TestWrapper>
                <AdminLayout />
            </TestWrapper>
        );

        expect(screen.getByTestId('app-header')).toHaveTextContent('Admin');
        expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
        expect(screen.getByText('nav.events')).toBeInTheDocument();
        expect(screen.getByText('nav.staff')).toBeInTheDocument();
        expect(screen.getByText('nav.settings')).toBeInTheDocument();
    });

    it('marks active link based on current path', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/events']}>
                <Routes>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="events" element={<div>Events Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        const eventsLink = screen.getByText('nav.events').closest('a');
        expect(eventsLink).toHaveClass('bg-primary/10');
        expect(eventsLink).toHaveClass('text-primary');

        const dashboardLink = screen.getByText('nav.dashboard').closest('a');
        expect(dashboardLink).not.toHaveClass('bg-primary/10');
    });

    it('renders outlet content', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/test']}>
                <Routes>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="test" element={<div data-testid="child-content">Child Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
});
