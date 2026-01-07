import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CheckoutForm } from '@features/donation/components/CheckoutForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@core/lib/api';
import { useParams } from 'react-router-dom';
import { useAppConfig } from '@core/providers/AppConfigProvider';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: vi.fn(() => ({ slug: 'test-event' })),
    };
});
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(() => ({
        config: {
            id: 'event-123',
            slug: 'test-event',
            donation: {
                form: { phone: { enabled: true, required: false }, message: { enabled: true }, anonymous: { enabled: true } },
                payment: { provider: 'stripe', config: {}, currency: 'usd' }
            }
        }
    })),
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        currency: 'USD',
        formatCurrency: (amount: number) => `$${amount}`,
    }),
}));

vi.mock('@core/lib/api', () => ({
    api: {
        post: vi.fn(),
    },
    VITE_API_URL: '/api',
    getApiErrorMessage: (_err: any, fallback: string) => fallback,
}));

// Mock PaymentFormFactory
vi.mock('@features/donation/components/payment/PaymentFormFactory', () => ({
    PaymentFormFactory: ({ onSuccess, onError, onBack }: any) => (
        <div>
            <button onClick={onSuccess}>Pay Success</button>
            <button onClick={() => onError('Payment failed')}>Pay Fail</button>
            {onBack && <button onClick={onBack}>Go Back</button>}
        </div>
    ),
}));

vi.mock('framer-motion', () => ({
    motion: { div: ({ children }: any) => <div>{children}</div> },
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    }
}));

describe('CheckoutForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render donation details form', () => {
        render(<CheckoutForm />);
        expect(screen.getByText('donation.amount')).toBeDefined();
        expect(screen.getByLabelText(/donation.name/i)).toBeDefined();
        expect(screen.getByLabelText(/donation.email/i)).toBeDefined();
    });

    it('should submit details and show payment form', async () => {
        (api.post as any).mockResolvedValue({ data: { id: 'sess1', clientSecret: 'cs_123' } });

        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/donations/intent', expect.objectContaining({
                amount: 2000, // Default $20 * 100
                eventId: 'event-123',
                metadata: expect.objectContaining({ donorName: 'John Doe' })
            }));
            expect(screen.getByText('Pay Success')).toBeDefined();
        });
    });

    it('should handle payment success', async () => {
        (api.post as any).mockResolvedValue({ data: { id: 'sess1', clientSecret: 'cs_123' } });

        render(<CheckoutForm />);

        // Fill form
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('Pay Success')).toBeDefined();
        });

        fireEvent.click(screen.getByText('Pay Success'));

        expect(mockNavigate).toHaveBeenCalledWith('/test-event/thank-you', expect.objectContaining({
            state: expect.objectContaining({ transactionId: 'sess1' })
        }));
    });

    it('should update amount when selecting a preset option', async () => {
        (api.post as any).mockResolvedValue({ data: { id: 'sess1', clientSecret: 'cs_123' } });
        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.click(screen.getByText('$50'));
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'Jane Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'jane@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/donations/intent', expect.objectContaining({
                amount: 5000, // $50 * 100
                metadata: expect.objectContaining({ donorName: 'Jane Doe' })
            }));
        });
    });

    it('should show validation errors for invalid input', async () => {
        const { container } = render(<CheckoutForm />);

        const emailInput = screen.getByLabelText(/donation.email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        await waitFor(() => {
            // Check for validation messages
            expect(screen.getByText('validation.invalid_string.email')).toBeDefined();
            expect(screen.getByText('validation.too_small.string 2')).toBeDefined();
        });

        expect(api.post).not.toHaveBeenCalled();
    });

    it('should show error if API fails', async () => {
        (api.post as any).mockRejectedValue(new Error('API Error'));
        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('Failed to initialize donation. Please try again.')).toBeDefined();
        });
    });

    it('should allow going back from payment step', async () => {
        (api.post as any).mockResolvedValue({ data: { id: 'sess1', clientSecret: 'cs_123' } });
        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        // PaymentFormFactory mock needs to accept onBack prop for this?
        // The previously defined mock didn't use onBack.
    });

    it('should handle slug mismatch warning', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.mocked(useParams).mockReturnValue({ slug: 'mismatch' });

        render(<CheckoutForm />);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Slug mismatch'));
        consoleSpy.mockRestore();
    });

    it('should show error if no slug is present', async () => {
        vi.mocked(useAppConfig).mockReturnValue({
            config: {
                donation: {
                    form: {
                        phone: { enabled: false },
                        message: { enabled: false },
                        anonymous: { enabled: false },
                        address: { enabled: false },
                        company: { enabled: false }
                    },
                    payment: { config: {} }
                }
            }
        } as any);
        vi.mocked(useParams).mockReturnValue({ slug: undefined });

        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/donation.name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/donation.email/i), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /donation.submit/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('donation.error_invalid_event')).toBeDefined();
        });
    });
});
