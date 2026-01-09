import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSettingsPage } from '@/features/admin/pages/GlobalSettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchGlobalConfig } from '@fundraising/white-labeling';
import { api } from '@core/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@fundraising/white-labeling', () => ({
    fetchGlobalConfig: vi.fn(),
    loadTheme: vi.fn(),
    defaultConfig: {
        communication: { legalName: 'Default Org', supportEmail: 'support@example.com' },
        content: { totalLabel: 'Total' },
        donation: { payment: { currency: 'USD', provider: 'stripe' } },
        locales: { default: 'en', supported: ['en'] }
    }
}));

vi.mock('@core/lib/api', () => ({
    api: {
        patch: vi.fn(),
    },
    VITE_API_URL: 'http://localhost:3000',
}));

vi.mock('@core/lib/i18n', () => ({
    syncLocales: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/features/admin/components/global-settings/IdentityForm', () => ({
    IdentityForm: () => <div data-testid="identity-form">Identity Form</div>,
}));
vi.mock('@/features/admin/components/global-settings/AssetsForm', () => ({
    AssetsForm: () => <div data-testid="assets-form">Assets Form</div>,
}));
vi.mock('@/features/admin/components/global-settings/CommunicationForm', () => ({
    CommunicationForm: () => <div data-testid="communication-form">Communication Form</div>,
}));
vi.mock('@/features/admin/components/global-settings/BrandDesignForm', () => ({
    BrandDesignForm: () => <div data-testid="theme-form">Theme Form</div>,
}));
vi.mock('@/features/admin/components/global-settings/LocalizationForm', () => ({
    LocalizationForm: () => <div data-testid="localization-form">Localization Form</div>,
}));
vi.mock('@/features/admin/components/global-settings/PaymentForm', () => ({
    PaymentForm: () => <div data-testid="payment-form">Payment Form</div>,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0, staleTime: 0 },
        },
    }));
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('GlobalSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (fetchGlobalConfig as any).mockReturnValue(new Promise(() => { })); // Never resolves
        const { container } = render(<GlobalSettingsPage />, { wrapper: Wrapper });
        expect(container.querySelector('.animate-spin')).toBeDefined();
    });

    it('renders data and allows navigation', async () => {
        (fetchGlobalConfig as any).mockResolvedValue({
            communication: { legalName: 'My Custom Org' },
            theme: { assets: { logo: 'custom-logo.png' } },
        });

        const { container } = render(<GlobalSettingsPage />, { wrapper: Wrapper });

        await waitFor(() => expect(container.querySelector('.animate-spin')).toBeNull(), { timeout: 3000 });

        expect(await screen.findByText('admin_branding.title')).toBeDefined();
        expect(await screen.findByTestId('identity-form')).toBeDefined();

        // Check preview updates
        expect(screen.getByText('My Custom Org')).toBeDefined();

        // Navigate to communication
        const commBtn = screen.getByText('admin_branding.nav.communication');
        fireEvent.click(commBtn);
        expect(screen.getByTestId('communication-form')).toBeDefined();

        // Navigate to theme
        const themeBtn = screen.getByText('admin_branding.nav.theme');
        fireEvent.click(themeBtn);
        expect(screen.getByTestId('theme-form')).toBeDefined();
    });

    it('handles form submission', async () => {
        (fetchGlobalConfig as any).mockResolvedValue({
            communication: { legalName: 'My Org' },
        });
        (api.patch as any).mockResolvedValue({ data: { success: true } });

        const { container } = render(<GlobalSettingsPage />, { wrapper: Wrapper });

        await waitFor(() => expect(container.querySelector('.animate-spin')).toBeNull());

        const saveBtn = screen.getByText('admin_branding.save');
        fireEvent.click(saveBtn);

        await waitFor(() => expect(api.patch).toHaveBeenCalled());
        expect(toast.success).toHaveBeenCalledWith('admin_branding.success_save');
    });

    it('handles error on submission', async () => {
        (fetchGlobalConfig as any).mockResolvedValue({});
        (api.patch as any).mockRejectedValue(new Error('Failed'));

        const { container } = render(<GlobalSettingsPage />, { wrapper: Wrapper });

        await waitFor(() => expect(container.querySelector('.animate-spin')).toBeNull());

        const saveBtn = screen.getByText('admin_branding.save');
        fireEvent.click(saveBtn);

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('admin_branding.error_save'));
    });
});
