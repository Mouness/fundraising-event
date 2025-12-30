import { render, screen } from '@testing-library/react';
import { DonationPage } from '@/features/donation/pages/DonationPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/features/event/hooks/useEventConfig', () => ({
    useEventConfig: () => ({
        config: {
            theme: { assets: { logo: 'logo.png' } },
            content: { title: 'Test Event' },
            donation: { form: { phone: {}, message: {}, anonymous: {} } }
        }
    }),
}));
vi.mock('@/features/donation/components/CheckoutForm', () => ({
    CheckoutForm: () => <div data-testid="checkout-form">Checkout Form</div>,
}));

describe('DonationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render event title and logo', () => {
        render(<DonationPage />);
        expect(screen.getByText('Test Event')).toBeDefined();
        expect(screen.getByAltText('Event Logo')).toBeDefined();
        expect(screen.getByTestId('checkout-form')).toBeDefined();
    });
});
