import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StaffLoginPage } from '@features/staff/pages/StaffLoginPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useStaffAuth } from '@features/staff/hooks/useStaffAuth';
import { useEvent } from '@features/events/context/EventContext';

// Mocks
vi.mock('@features/staff/hooks/useStaffAuth', () => ({
    useStaffAuth: vi.fn(),
}));

vi.mock('@features/events/context/EventContext', () => ({
    useEvent: vi.fn(),
}));

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
    }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('StaffLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render login form', () => {
        vi.mocked(useStaffAuth).mockReturnValue({ isStaffAuthenticated: vi.fn().mockReturnValue(false), login: vi.fn(), isLoading: false } as any);
        vi.mocked(useEvent).mockReturnValue({ event: { id: 'evt-1' } } as any);

        render(
            <MemoryRouter initialEntries={['/test-event/staff/login']}>
                <Routes>
                    <Route path="/:slug/staff/login" element={<StaffLoginPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Staff Access')).toBeDefined();
        expect(screen.getByText('PIN Code')).toBeDefined();
        expect(screen.getAllByRole('button', { name: 'Connect' })).toBeDefined();
    });

    it('should handle login success', async () => {
        const loginMock = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useStaffAuth).mockReturnValue({ isStaffAuthenticated: vi.fn().mockReturnValue(false), login: loginMock, isLoading: false } as any);
        vi.mocked(useEvent).mockReturnValue({ event: { id: 'evt-1' } } as any);

        render(
            <MemoryRouter initialEntries={['/test-event/staff/login']}>
                <Routes>
                    <Route path="/:slug/staff/login" element={<StaffLoginPage />} />
                </Routes>
            </MemoryRouter>
        );

        const input = screen.getByLabelText('PIN Code');
        fireEvent.change(input, { target: { value: '1234' } });
        fireEvent.click(screen.getByText('Connect'));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith('1234', 'evt-1');
            // Navigation happens in useEffect when auth state changes, usually triggered by login success updating context
            // But here we mock hooks. In real app, login updates state -> re-render -> useEffect -> navigate.
            // Our test might not simulate the re-render with updated auth state unless we handle it or check expected behavior.
            // The component itself doesn't navigate on submit success directly? 
            // It navigates in useEffect: if (event && isStaffAuthenticated(event.id) && slug)
            // So checking if login was called is good enough for unit test of the form submission.
        });
    });

    it('should show error on login failure', async () => {
        const loginMock = vi.fn().mockResolvedValue({ success: false, error: 'Invalid PIN' });
        vi.mocked(useStaffAuth).mockReturnValue({ isStaffAuthenticated: vi.fn().mockReturnValue(false), login: loginMock, isLoading: false } as any);
        vi.mocked(useEvent).mockReturnValue({ event: { id: 'evt-1' } } as any);

        render(
            <MemoryRouter initialEntries={['/test-event/staff/login']}>
                <Routes>
                    <Route path="/:slug/staff/login" element={<StaffLoginPage />} />
                </Routes>
            </MemoryRouter>
        );

        const input = screen.getByLabelText('PIN Code');
        fireEvent.change(input, { target: { value: '0000' } });
        fireEvent.click(screen.getByText('Connect'));

        await waitFor(() => {
            expect(screen.getByText('Invalid PIN')).toBeDefined();
        });
    });

    it('should redirect if already authenticated', () => {
        vi.mocked(useStaffAuth).mockReturnValue({ isStaffAuthenticated: vi.fn().mockReturnValue(true), login: vi.fn(), isLoading: false } as any);
        vi.mocked(useEvent).mockReturnValue({ event: { id: 'evt-1' } } as any);

        render(
            <MemoryRouter initialEntries={['/test-event/staff/login']}>
                <Routes>
                    <Route path="/:slug/staff/login" element={<StaffLoginPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/test-event/staff/collect');
    });
});
