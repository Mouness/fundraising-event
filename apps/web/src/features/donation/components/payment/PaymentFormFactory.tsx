import type { PaymentProviderProps } from '../../types/payment.types';
import { StripePaymentForm } from './StripePaymentForm';

// In a larger app, we could use React.lazy for these imports
// const StripePaymentForm = React.lazy(() => import('./StripePaymentForm').then(m => ({ default: m.StripePaymentForm })));

interface PaymentFormFactoryProps extends PaymentProviderProps {
    providerId: string;
}

export const PaymentFormFactory = (props: PaymentFormFactoryProps) => {
    const { providerId, ...paymentProps } = props;

    switch (providerId) {
        case 'stripe':
            return <StripePaymentForm {...paymentProps} />;

        // Future providers can be added here
        // case 'paypal':
        //     return <PayPalPaymentForm {...paymentProps} />;

        default:
            return (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    Unknown payment provider: {providerId}
                </div>
            );
    }
}
