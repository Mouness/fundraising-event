import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader } from '@/core/components/AppHeader';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate, useParams } from 'react-router-dom';
import { STORAGE_KEYS } from '@core/lib/constants';

vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    };
});

describe('AppHeader', () => {
    const mockNavigate = vi.fn();
    const mockConfig = {
        theme: { assets: { logo: 'logo.png' } },
        content: { title: 'Test App' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppConfig as any).mockReturnValue({ config: mockConfig });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useParams as any).mockReturnValue({});
        localStorage.clear();
    });

    it('renders logo and title from config', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );

        expect(screen.getByAltText('Logo')).toBeDefined();
        expect(screen.getByText('Test App')).toBeDefined();
    });

    it('renders default title if config title is missing', () => {
        (useAppConfig as any).mockReturnValue({ config: { ...mockConfig, content: {} } });
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        // 'app_header.title' is the key returned by the i18n mock
        expect(screen.getByText('app_header.title')).toBeDefined();
    });

    it('renders online status when requested', () => {
        render(
            <MemoryRouter>
                <AppHeader showOnlineStatus={true} isOnline={true} />
            </MemoryRouter>
        );
        expect(screen.getByText('app_header.online')).toBeDefined();

        render(
            <MemoryRouter>
                <AppHeader showOnlineStatus={true} isOnline={false} />
            </MemoryRouter>
        );
        expect(screen.getByText('app_header.offline')).toBeDefined();
    });

    it('displays user name when logged in', () => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, 'token');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ name: 'John Doe' }));

        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByLabelText('common.logout')).toBeDefined();
    });

    it('handles logout and navigates to login', () => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, 'token');
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );

        const logoutBtn = screen.getByLabelText('common.logout');
        fireEvent.click(logoutBtn);

        expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles staff logout and navigates to event root', () => {
        (useParams as any).mockReturnValue({ slug: 'myevent' });
        localStorage.setItem(STORAGE_KEYS.STAFF_TOKEN, 'staff-token');
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );

        const logoutBtn = screen.getByLabelText('common.logout');
        fireEvent.click(logoutBtn);

        expect(localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN)).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/myevent');
    });

    it('renders additional title when provided', () => {
        render(
            <MemoryRouter>
                <AppHeader title="Settings" />
            </MemoryRouter>
        );
        expect(screen.getByText(/Settings/)).toBeDefined();
    });

    it('renders rightContent if provided', () => {
        render(
            <MemoryRouter>
                <AppHeader rightContent={<div data-testid="custom-right">Custom</div>} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('custom-right')).toBeDefined();
    });
});
