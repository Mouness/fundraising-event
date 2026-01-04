import { render, screen } from '@testing-library/react';
import { DonationPage } from '@/features/donation/pages/DonationPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies

vi.mock('@/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            theme: { assets: { logo: 'logo.png' } },
            content: { title: 'Test Event', goalAmount: 1000 },
            donation: {
                payment: { provider: 'stripe', config: {} },
                sharing: { enabled: true, networks: [] },
                form: {
                    phone: { enabled: true, required: false },
                    message: { enabled: true, required: false },
                    anonymous: { enabled: true }
                }
            }
        }
    }),
}));
vi.mock('@/features/donation/components/CheckoutForm', () => ({
    CheckoutForm: () => <div data-testid="checkout-form">Checkout Form</div>,
}));

describe('DonationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        });
    });

    it('should render event title and logo', () => {
        render(
            <MemoryRouter>
                <DonationPage />
            </MemoryRouter>
        );
        expect(screen.getByText('Test Event')).toBeDefined();
        expect(screen.getByAltText('Logo')).toBeDefined();
        expect(screen.getByTestId('checkout-form')).toBeDefined();
    });
});
