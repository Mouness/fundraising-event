import { PayPalScriptProvider, PayPalButtons, type PayPalButtonsComponentProps } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
import { CardContent, CardFooter } from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import type { PaymentProviderProps } from '../../types/payment.types';

export const PayPalPaymentForm = (props: PaymentProviderProps) => {
    const { sessionData, config, onSuccess, onError, onBack, amount, currency } = props;
    const { t } = useTranslation('common');

    // For PayPal, sessionData might contain an orderID pre-created on the backend, or we might create it here.
    // Assuming backend creation for security (consistent with our Stripe intent flow).
    const initialOrderId = sessionData.orderID || sessionData.id;
    const clientId = config?.clientId as string | undefined;

    if (!clientId) {
        return <div className="text-red-500">{t('payment.error_missing_config')}</div>;
    }

    const createOrder: PayPalButtonsComponentProps['createOrder'] = async (_data, actions) => {
        // If we already have an orderID from the backend intention
        if (initialOrderId) {
            return initialOrderId;
        }
        // Fallback: Create order on client (less secure, but valid for simple flows)
        return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: currency.toUpperCase(),
                        value: amount.toString(),
                    },
                },
            ],
        });
    };

    const onApprove: PayPalButtonsComponentProps['onApprove'] = async (_data, actions) => {
        try {
            if (!actions.order) {
                throw new Error('PayPal actions.order is undefined');
            }

            // Capture the funds from the transaction
            const details = await actions.order.capture();

            console.log('PayPal Transaction completed:', details);

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('PayPal Capture Error', err);
            if (onError) onError(t('payment.error_processing'));
        }
    };

    return (
        <PayPalScriptProvider options={{ clientId: clientId, currency: currency.toUpperCase(), intent: "capture" }}>
            <CardContent className="space-y-4 pt-6">
                <div className="min-h-[150px] flex flex-col justify-center">
                    <PayPalButtons
                        style={{ layout: "vertical", shape: "rect", label: "donate" }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={(err) => {
                            console.error('PayPal Error', err);
                            if (onError) onError(t('payment.error_generic'));
                        }}
                    />
                </div>
            </CardContent>
            <CardFooter>
                {onBack && (
                    <Button variant="ghost" onClick={onBack} className="w-full">
                        {t('common.back')}
                    </Button>
                )}
            </CardFooter>
        </PayPalScriptProvider>
    );
}
