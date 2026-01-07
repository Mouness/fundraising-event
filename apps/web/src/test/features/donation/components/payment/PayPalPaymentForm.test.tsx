import { render, screen, waitFor } from '@test/utils';
import { PayPalPaymentForm } from '@features/donation/components/payment/PayPalPaymentForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';


// Mock AppConfigProvider
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            donation: {
                sharing: { enabled: true, networks: [] }
            }
        },
        isLoading: false
    }),
    AppConfigProvider: ({ children }: any) => <>{children}</>
}));

// Mock PayPal SDK
vi.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }: any) => <div>{children}</div>,
    PayPalButtons: ({ createOrder, onApprove, onError }: any) => (
        <div>
            <button onClick={() => createOrder({}, { order: { create: vi.fn().mockResolvedValue('tr_999') } })}>Mock Create Order</button>
            <button onClick={() => onApprove({}, { order: { capture: vi.fn().mockResolvedValue({ id: 'tr_123' }) } })}>Mock Approve</button>
            <button onClick={() => onApprove({}, { order: { capture: vi.fn().mockRejectedValue(new Error('Capture failed')) } })}>Mock Approve Error</button>
            <button onClick={() => onError(new Error('PayPal Widget Error'))}>Mock Widget Error</button>
        </div>
    ),
}));

describe('PayPalPaymentForm', () => {
    const defaultProps = {
        sessionData: { id: 'sess_123' },
        config: { clientId: 'test-client-id' },
        onSuccess: vi.fn(),
        onError: vi.fn(),
        onBack: vi.fn(),
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

    it('should call onError when capture fails', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);

        const approveBtn = await screen.findByText('Mock Approve Error');
        approveBtn.click();

        await waitFor(() => {
            expect(defaultProps.onError).toHaveBeenCalledWith('payment.error_processing');
        });
    });

    it('should call onError when widget errors', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);

        const errorBtn = await screen.findByText('Mock Widget Error');
        errorBtn.click();

        await waitFor(() => {
            expect(defaultProps.onError).toHaveBeenCalledWith('payment.error_generic');
        });
    });

    it('should call onBack when clicked', async () => {
        render(<PayPalPaymentForm {...defaultProps} />);

        const backBtn = screen.getByText('common.back');
        backBtn.click();

        expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('should handle createOrder without initialOrderId', async () => {
        const props = { ...defaultProps, sessionData: {} };
        render(<PayPalPaymentForm {...props} />);

        const createBtn = screen.getByText('Mock Create Order');
        createBtn.click();
        // This just executes the createOrder logic, which we've mocked to return a promise
    });
});
