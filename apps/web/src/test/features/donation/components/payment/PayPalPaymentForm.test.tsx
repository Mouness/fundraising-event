import { render, screen, waitFor } from '@test/utils';
import { PayPalPaymentForm } from '@features/donation/components/payment/PayPalPaymentForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';


// Mock PayPal SDK
vi.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }: any) => <div>{children}</div>,
    PayPalButtons: ({ createOrder, onApprove }: any) => (
        <div>
            <button onClick={() => createOrder({}, { order: { create: vi.fn() } })}>Mock Create Order</button>
            <button onClick={() => onApprove({}, { order: { capture: vi.fn().mockResolvedValue({ id: 'tr_123' }) } })}>Mock Approve</button>
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

    it('should render PayPal buttons when clientId is present', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);
        expect(await screen.findByText('Mock Create Order')).toBeDefined();
    });

    it('should show error if clientId is missing', async () => {
        const props = { ...defaultProps, config: {} };
        render(<PayPalPaymentForm {...props} />);
        expect(await screen.findByText('payment.error_missing_config')).toBeDefined();
    });

    it('should call onSuccess when approved', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);

        const approveBtn = await screen.findByText('Mock Approve');
        approveBtn.click();

        await waitFor(() => {
            expect(defaultProps.onSuccess).toHaveBeenCalled();
        });
    });
});
