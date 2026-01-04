import type { PaymentProviderProps } from '../../types/payment.types';
import { StripePaymentForm } from './StripePaymentForm';
import { PayPalPaymentForm } from './PayPalPaymentForm';
import { useTranslation } from 'react-i18next';

interface PaymentFormFactoryProps extends PaymentProviderProps {
    providerId: string;
}

export const PaymentFormFactory = (props: PaymentFormFactoryProps) => {
    const { providerId, ...paymentProps } = props;
    const { t } = useTranslation('common');

    switch (providerId) {
        case 'stripe':
            return <StripePaymentForm {...paymentProps} />;
        case 'paypal':
            return <PayPalPaymentForm {...paymentProps} />;

        default:
            return (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    {t('payment.unknown_provider', { providerId })}
                </div>
            );
    }
}
