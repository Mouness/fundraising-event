import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CheckoutForm } from '@features/donation/components/CheckoutForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@core/lib/api';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: 'test-event' }),
}));
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            donation: {
                form: { phone: { enabled: true, required: false }, message: { enabled: true }, anonymous: { enabled: true } },
                payment: { provider: 'stripe', config: {} }
            }
        }
    }),
}));

vi.mock('@core/lib/api', () => ({
    api: {
        post: vi.fn(),
    },
}));

vi.mock('@features/donation/components/payment/PaymentFormFactory', () => ({
    PaymentFormFactory: ({ onSuccess, onError }: any) => (
        <div>
            <button onClick={onSuccess}>Pay Success</button>
            <button onClick={() => onError('Payment failed')}>Pay Fail</button>
        </div>
    ),
}));
// Mock UI components
vi.mock('@core/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}));
vi.mock('@core/components/ui/input', () => ({
    Input: ({ id, ...props }: any) => <input id={id} data-testid={id} {...props} />,
}));
vi.mock('@core/components/ui/label', () => ({
    Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));
vi.mock('@core/components/ui/card', () => {
    const MockDiv = ({ children }: any) => <div>{children}</div>;
    return {
        Card: MockDiv,
        CardHeader: MockDiv,
        CardTitle: MockDiv,
        CardContent: MockDiv,
        CardFooter: MockDiv,
    };
});
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
        expect(screen.getByTestId('name')).toBeDefined();
        expect(screen.getByTestId('email')).toBeDefined();
    });

    it('should submit details and show payment form', async () => {
        (api.post as any).mockResolvedValue({ data: { id: 'sess1', clientSecret: 'cs_123' } });

        render(<CheckoutForm />);

        await act(async () => {
            fireEvent.change(screen.getByTestId('name'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByTestId('email'), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByText(/donation.submit/));
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/donations/intent', expect.objectContaining({
                amount: 2000, // Default $20 * 100
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
            fireEvent.change(screen.getByTestId('name'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByTestId('email'), { target: { value: 'john@example.com' } });
            fireEvent.click(screen.getByText(/donation.submit/));
        });

        await waitFor(() => {
            expect(screen.getByText('Pay Success')).toBeDefined();
        });

        fireEvent.click(screen.getByText('Pay Success'));

        expect(mockNavigate).toHaveBeenCalledWith('/test-event/thank-you', expect.objectContaining({
            state: expect.objectContaining({ transactionId: 'sess1' })
        }));
    });
    it('should show validation errors for invalid input', async () => {
        const { container } = render(<CheckoutForm />);

        const emailInput = screen.getByTestId('email');
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
});
