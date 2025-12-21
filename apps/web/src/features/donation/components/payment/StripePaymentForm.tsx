import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import type { PaymentProviderProps } from '../../types/payment.types';

// Initialize Stripe outside to avoid recreation
// In a real app config.publishableKey would come from prop, but loadStripe runs once.
// We can use a singleton lazily initialized if key changes.
// Singleton promise to prevent multiple Stripe element initializations
let stripePromise: Promise<any> | null = null;

// Lazily load Stripe only when needed, reusing the promise
const getStripePromise = (key: string) => {
    if (!stripePromise) {
        stripePromise = loadStripe(key);
    }
    return stripePromise;
};

const StripeFormContent = ({ onSuccess, onBack, onError }: { onSuccess: () => void, onBack?: () => void, onError?: (msg: string) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation('common');
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStripeReady, setIsStripeReady] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/donate',
            },
            redirect: 'if_required'
        });

        if (error) {
            const msg = error.message || t('donation.error');
            setMessage(msg);
            if (onError) onError(msg);
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('donation.payment')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <PaymentElement onReady={() => setIsStripeReady(true)} />
                    {message && <div className="mt-4 p-3 bg-red-50 text-red-500 rounded text-sm">{message}</div>}
                </CardContent>
                <CardFooter className="flex gap-4">
                    {onBack && (
                        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
                            {t('common.back', 'Back')}
                        </Button>
                    )}
                    <Button type="submit" className="w-full" disabled={!stripe || !elements || isProcessing || !isStripeReady}>
                        {isProcessing ? t('donation.processing') : t('donation.pay_now')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

export const StripePaymentForm = (props: PaymentProviderProps) => {
    const { sessionData, config } = props;
    const clientSecret = sessionData?.clientSecret;
    const configKey = config?.publishableKey;
    // If config has placeholder, fallback to ENV.
    const publishableKey = (configKey && !configKey.includes('placeholder') ? configKey : undefined)
        || import.meta.env.VITE_STRIPE_PUBLIC_KEY
        || 'pk_test_placeholder';

    if (!clientSecret) {
        return <div className="text-red-500">Error: Missing client secret for Stripe payment.</div>;
    }

    if (!publishableKey || publishableKey.includes('placeholder')) {
        return <div className="text-red-500">Configuration Error: Stripe Publishable Key is missing or invalid.</div>;
    }

    return (
        <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <StripeFormContent
                onSuccess={props.onSuccess}
                onBack={props.onBack}
                onError={props.onError}
            />
        </Elements>
    );
}
