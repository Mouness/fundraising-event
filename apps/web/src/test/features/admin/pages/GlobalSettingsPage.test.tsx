import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSettingsPage } from '@/features/admin/pages/GlobalSettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { fetchGlobalConfig } from '@fundraising/white-labeling';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/api', () => ({
    api: { patch: vi.fn(), get: vi.fn() },
    API_URL: 'http://localhost:3000'
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

// Mock White Labeling
vi.mock('@fundraising/white-labeling', () => ({
    defaultConfig: {
        communication: {
            legalName: 'Default Org',
            supportEmail: 'support@default.com'
        },
        locales: { default: 'en', supported: ['en'] }
    },
    fetchGlobalConfig: vi.fn(),
    loadTheme: vi.fn(),
}));

const mutateMock = vi.fn();
// Mock React Query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(() => ({ mutate: mutateMock })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

// Mock Sub-components
vi.mock('@/features/admin/components/global-settings/IdentityForm', () => ({ IdentityForm: () => <div data-testid="identity-form">Identity Form</div> }));
vi.mock('@/features/admin/components/global-settings/AssetsForm', () => ({ AssetsForm: () => <div data-testid="assets-form">Assets Form</div> }));
vi.mock('@/features/admin/components/global-settings/CommunicationForm', () => ({ CommunicationForm: () => <div data-testid="communication-form">Communication Form</div> }));
vi.mock('@/features/admin/components/global-settings/BrandDesignForm', () => ({ BrandDesignForm: () => <div data-testid="brand-form">Brand Form</div> }));
vi.mock('@/features/admin/components/global-settings/LocalizationForm', () => ({ LocalizationForm: () => <div data-testid="localization-form">Localization Form</div> }));
vi.mock('@/features/admin/components/global-settings/PaymentForm', () => ({ PaymentForm: () => <div data-testid="payment-form">Payment Form</div> }));


describe('GlobalSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useQuery as any).mockReturnValue({
            data: {
                communication: { legalName: 'Test Org' },
                theme: { assets: { logo: 'logo.png' } }
            },
            isLoading: false
        });
        (fetchGlobalConfig as any).mockResolvedValue({});
    });

    it('should render page title', () => {
        render(<GlobalSettingsPage />);
        expect(screen.getByText('admin_branding.title')).toBeDefined();
    });

    it('should render identity form by default', () => {
        render(<GlobalSettingsPage />);
        expect(screen.getByTestId('identity-form')).toBeDefined();
    });

    it('should switch to all tabs', () => {
        render(<GlobalSettingsPage />);

        // Identity is default
        expect(screen.getByTestId('identity-form')).toBeDefined();

        // Communication
        fireEvent.click(screen.getByText('admin_branding.nav.communication'));
        expect(screen.getByTestId('communication-form')).toBeDefined();

        // Theme
        fireEvent.click(screen.getByText('admin_branding.nav.theme'));
        expect(screen.getByTestId('brand-form')).toBeDefined();

        // Assets
        fireEvent.click(screen.getByText('admin_branding.nav.assets'));
        expect(screen.getByTestId('assets-form')).toBeDefined();

        // Modules
        fireEvent.click(screen.getByText('admin_branding.nav.modules'));
        expect(screen.getByTestId('payment-form')).toBeDefined();
        expect(screen.getByTestId('localization-form')).toBeDefined();
    });

    it('should handle save submission', async () => {
        render(<GlobalSettingsPage />);

        const saveBtn = screen.getByText('admin_branding.save');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalled();
        });
    });

    it('should show loading state', () => {
        (useQuery as any).mockReturnValue({ isLoading: true });
        const { container } = render(<GlobalSettingsPage />);
        expect(container.querySelector('.animate-spin')).toBeDefined();
    });
});
