import { render, screen, waitFor } from '@testing-library/react';
import { PayPalPaymentForm } from '@/features/donation/components/payment/PayPalPaymentForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock PayPal SDK
vi.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }: any) => <div>{children}</div>,
    PayPalButtons: ({ createOrder, onApprove }: any) => (
        <div>
            <button onClick={() => createOrder({}, { order: { create: vi.fn() } })}>Mock Create Order</button>
            <button onClick={() => onApprove({}, {})}>Mock Approve</button>
        </div>
    ),
}));

describe('PayPalPaymentForm', () => {
    const defaultProps = {
        sessionData: { id: 'sess_123' },
        config: { clientId: 'test-client-id' },
        onSuccess: vi.fn(),
        onError: vi.fn(),
        amount: 50,
        currency: 'USD',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render PayPal buttons when clientId is present', () => {
        render(<PayPalPaymentForm {...defaultProps} />);
        expect(screen.getByText('Mock Create Order')).toBeDefined();
    });

    it('should show error if clientId is missing', () => {
        const props = { ...defaultProps, config: {} };
        render(<PayPalPaymentForm {...props} />);
        expect(screen.getByText('payment.error_missing_config')).toBeDefined();
    });

    it('should call onSuccess when approved', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);

        const approveBtn = screen.getByText('Mock Approve');
        approveBtn.click();

        await waitFor(() => {
            expect(defaultProps.onSuccess).toHaveBeenCalled();
        });
    });
});
