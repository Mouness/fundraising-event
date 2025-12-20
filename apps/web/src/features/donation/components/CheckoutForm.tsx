import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/ui/card';
import type { DonationFormValues } from '../schemas/donation.schema';
import { donationSchema } from '../schemas/donation.schema';
import { api } from '@/lib/api';

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function PaymentSection({ clientSecret, onSuccess, onBack }: { clientSecret: string, onSuccess: () => void, onBack: () => void }) {
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
                return_url: window.location.origin + '/donate', // Redirect handled by redirect: 'if_required' usually, but good fallback
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message || t('donation.error'));
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
                    <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
                        {t('common.back', 'Back')}
                    </Button>
                    <Button type="submit" className="w-full" disabled={!stripe || !elements || isProcessing || !isStripeReady}>
                        {isProcessing ? t('donation.processing') : t('donation.pay_now')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

export function CheckoutForm() {
    const { t } = useTranslation('common');
    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number>(20);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // MOCK CONFIGURATION (Later fetch from API)
    const [formConfig] = useState({
        phone: { enabled: true, required: true },
        address: { enabled: false, required: false },
        message: { enabled: true, required: false },
        isAnonymous: { enabled: true, required: false }
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormValues>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            amount: 20,
            isAnonymous: false,
            name: '',
            email: '',
            message: ''
        }
    });

    const currentAmount = watch('amount');

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setValue('amount', amount);
    };

    const onSubmitDetails = async (data: DonationFormValues) => {
        try {
            // Frontend logic: Send amount in CENTS as verified by backend Controller
            const amountInCents = Math.round(data.amount * 100);
            const { data: intentData } = await api.post('/donations/stripe/intent', {
                amount: amountInCents,
                currency: 'usd',
                metadata: {
                    donorName: data.name,
                    donorEmail: data.email,
                    message: data.message,
                    isAnonymous: data.isAnonymous ? 'true' : 'false'
                }
            });
            setClientSecret(intentData.clientSecret);
            setStep('payment');
        } catch (err) {
            console.error(err);
            // In a real app, use toast here
        }
    };

    if (paymentSuccess) {
        return (
            <Card className="w-full max-w-md mx-auto mt-10">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold">{t('donation.success')}</h2>
                    <p className="text-muted-foreground">Your donation of ${currentAmount} has been received.</p>
                    <Button onClick={() => window.location.reload()} variant="outline">Make another donation</Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'payment' && clientSecret) {
        return (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <PaymentSection
                    clientSecret={clientSecret}
                    onSuccess={() => setPaymentSuccess(true)}
                    onBack={() => setStep('details')}
                />
            </Elements>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('donation.amount')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[10, 20, 50, 100].map((amt) => (
                            <Button
                                key={amt}
                                type="button"
                                variant={selectedAmount === amt ? 'default' : 'outline'}
                                onClick={() => handleAmountSelect(amt)}
                            >
                                ${amt}
                            </Button>
                        ))}
                        <div className="col-span-2 relative">
                            <Input
                                type="number"
                                placeholder={t('donation.custom_amount')}
                                {...register('amount', { valueAsNumber: true })}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) setSelectedAmount(val);
                                }}
                            />
                        </div>
                    </div>
                    {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('donation.contact_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('donation.name')}</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('donation.email')}</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    {formConfig.phone.enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number {formConfig.phone.required && '*'}</Label>
                            <Input id="phone" type="tel" {...register('phone' as any, { required: formConfig.phone.required ? 'Phone is required' : false })} />
                            {errors.phone && <p className="text-sm text-red-500">{(errors.phone as any).message}</p>}
                        </div>
                    )}

                    {formConfig.message.enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="message">{t('donation.message')}</Label>
                            <Input id="message" {...register('message')} />
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isAnonymous"
                            {...register('isAnonymous')}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isAnonymous">{t('donation.anonymous')}</Label>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        {t('donation.submit', { amount: `$${currentAmount || 0}` })}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
