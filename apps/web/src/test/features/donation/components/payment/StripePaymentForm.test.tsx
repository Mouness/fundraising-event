import { render, screen } from '@testing-library/react';
import { StripePaymentForm } from '@/features/donation/components/payment/StripePaymentForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }: any) => <div>{children}</div>,
    PaymentElement: () => <div data-testid="payment-element">Stripe Element</div>,
    useStripe: () => ({
        confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded' } }),
    }),
    useElements: () => ({}),
}));

vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(),
}));

// Mock API Call
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('StripePaymentForm', () => {
    const defaultProps = {
        sessionData: { id: 'sess_123' },
        config: { publishableKey: 'pk_test_123' },
        onSuccess: vi.fn(),
        onError: vi.fn(),
        amount: 50,
        currency: 'USD',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ clientSecret: 'pi_123_secret_456' }),
        });
    });

    it('should render error if publishable key is missing and env is empty', () => {
        vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', '');
        const props = { ...defaultProps, config: {}, sessionData: { clientSecret: 'pi_test' } };
        render(<StripePaymentForm {...props} />);
        expect(screen.getByText('payment.error_missing_config')).toBeDefined();
        vi.unstubAllEnvs();
    });

    it('should initialize Stripe elements with client secret', async () => {
        const props = { ...defaultProps, sessionData: { clientSecret: 'pi_test_secret' } };
        render(<StripePaymentForm {...props} />);

        expect(screen.getByTestId('payment-element')).toBeDefined();
    });
});
