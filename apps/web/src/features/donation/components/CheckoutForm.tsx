import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import type { DonationFormValues } from '../schemas/donation.schema';
import { donationSchema } from '../schemas/donation.schema';
import { useEventConfig } from '../../event/hooks/useEventConfig';
import { api } from '@/lib/api';
import { PaymentFormFactory } from './payment/PaymentFormFactory';

export const CheckoutForm = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { config } = useEventConfig();
    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [sessionData, setSessionData] = useState<any>(null); // Generic session data
    const [selectedAmount, setSelectedAmount] = useState<number>(20);

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

            // Note: In a fully abstract system, the endpoint might also be generic like /donations/initiate
            // For now, we still rely on the Stripe-compatible intent endpoint, but we treat the result generically.
            const { data: intentData } = await api.post('/donations/intent', {
                amount: amountInCents,
                currency: 'usd',
                metadata: {
                    donorName: data.name,
                    donorEmail: data.email,
                    message: data.message,
                    isAnonymous: data.isAnonymous ? 'true' : 'false'
                }
            });

            setSessionData(intentData); // Store the whole response (contains clientSecret)
            setStep('payment');
        } catch (err) {
            console.error(err);
            // In a real app, use toast here
        }
    };

    if (step === 'payment' && sessionData) {
        // Derive variables for factory
        // 'stripe' is the default if missing in config, matching our default UseEventConfig
        const providerId = config?.payment?.provider || 'stripe';

        return (
            <PaymentFormFactory
                providerId={providerId}
                sessionData={sessionData}
                amount={currentAmount}
                currency="usd"
                config={config?.payment?.config}
                onSuccess={() => {
                    navigate('/thank-you', {
                        state: {
                            amount: currentAmount,
                            donorName: watch('name'),
                            transactionId: sessionData.id // Generic ID from backend response
                        }
                    });
                }}
                onBack={() => setStep('details')}
                onError={(msg: string) => console.error(msg)}
            />
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

                    {config.features.phone.enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('donation.phone')} {config.features.phone.required && '*'}</Label>
                            <Input id="phone" type="tel" {...register('phone', { required: config.features.phone.required ? t('donation.phone_required') : false })} />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>
                    )}

                    {config.features.message.enabled && (
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
                        {t('donation.submit', { amount: `$${currentAmount || 0} ` })}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
