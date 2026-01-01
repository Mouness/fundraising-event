import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import type { DonationFormValues } from '../schemas/donation.schema';
import { getDonationSchema } from '../schemas/donation.schema';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { api } from '@/lib/api';
import { PaymentFormFactory } from './payment/PaymentFormFactory';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CreditCard } from 'lucide-react';

export const CheckoutForm = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { config } = useAppConfig();
    const [step, setStep] = useState<'details' | 'payment'>('details');
    // Define type or import Response type. For now locally.
    const [sessionData, setSessionData] = useState<{ id: string; clientSecret: string } | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number>(20);

    // Validate slug against config to ensure consistency
    if (slug && config.slug && slug !== config.slug) {
        console.warn(`Slug mismatch: URL param '${slug}' does not match config slug '${config.slug}'. Using config slug.`);
    }
    const activeSlug = slug || config.slug;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormValues>({
        resolver: zodResolver(getDonationSchema(t)),
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
        if (!activeSlug) {
            setSubmitError(t('donation.error_invalid_event'));
            return;
        }

        try {
            const amountInCents = Math.round(data.amount * 100);
            const { data: intentData } = await api.post('/donations/intent', {
                amount: amountInCents,
                currency: 'usd',
                eventId: config.id, // Use ID for backend, but slug for navigation
                metadata: {
                    donorName: data.name,
                    donorEmail: data.email,
                    message: data.message,
                    isAnonymous: data.isAnonymous ? 'true' : 'false'
                }
            });

            setSessionData(intentData);
            setStep('payment');
        } catch (err) {
            console.error(err);
            setSubmitError('Failed to initialize donation. Please try again.');
        }
    };

    const glassCardClass = "backdrop-blur-md border shadow-xl overflow-hidden";
    const glassCardStyle = { backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(var(--glass-blur))' };

    // Soft panel style for contact form to match Staff UI
    const panelClass = "backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t rounded-3xl overflow-hidden mt-6";
    const panelStyle = {
        backgroundColor: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderRadius: 'var(--panel-radius, 1.5rem)'
    };

    return (
        <AnimatePresence mode="wait">
            {step === 'details' ? (
                <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-6">
                        <Card className={glassCardClass} style={glassCardStyle}>
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-800">{t('donation.amount')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[10, 20, 50, 100].map((amt) => (
                                        <Button
                                            key={amt}
                                            type="button"
                                            variant={selectedAmount === amt ? 'default' : 'outline'}
                                            onClick={() => handleAmountSelect(amt)}
                                            className={`h-12 text-lg transition-all ${selectedAmount === amt ? 'shadow-lg scale-105' : 'hover:opacity-90'}`}
                                            style={{
                                                backgroundColor: selectedAmount === amt ? 'var(--donation-amount-button-selected-bg)' : 'var(--donation-amount-button-bg)',
                                                color: selectedAmount === amt ? 'var(--donation-amount-button-selected-text)' : 'var(--donation-amount-button-text)',
                                                borderColor: selectedAmount !== amt ? 'var(--donation-input-border)' : 'transparent'
                                            }}
                                        >
                                            ${amt}
                                        </Button>
                                    ))}
                                    <div className="col-span-2 relative">
                                        <Input
                                            type="number"
                                            placeholder={t('donation.custom_amount')}
                                            {...(() => {
                                                const { onChange, ...rest } = register('amount', { valueAsNumber: true });
                                                return {
                                                    ...rest,
                                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                                        onChange(e);
                                                        const val = parseFloat(e.target.value);
                                                        if (!isNaN(val)) setSelectedAmount(val);
                                                    }
                                                };
                                            })()}
                                            className="h-12 transition-colors"
                                            style={{
                                                backgroundColor: 'var(--donation-input-bg)',
                                                color: 'var(--donation-input-text)',
                                                borderColor: 'var(--donation-input-border)'
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors.amount && <p className="text-sm text-red-500 font-medium">{errors.amount.message}</p>}
                            </CardContent>
                        </Card>


                        <Card
                            className={panelClass}
                            style={panelStyle}
                        >
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-800">{t('donation.contact_info')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" style={{ color: 'var(--donation-label-color)' }}>{t('donation.name')} *</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        style={{
                                            backgroundColor: 'var(--donation-input-bg)',
                                            color: 'var(--donation-input-text)',
                                            borderColor: 'var(--donation-input-border)'
                                        }}
                                    />
                                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" style={{ color: 'var(--donation-label-color)' }}>{t('donation.email')} *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        style={{
                                            backgroundColor: 'var(--donation-input-bg)',
                                            color: 'var(--donation-input-text)',
                                            borderColor: 'var(--donation-input-border)'
                                        }}
                                    />
                                    {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                                </div>

                                {config.donation.form.phone.enabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" style={{ color: 'var(--donation-label-color)' }}>{t('donation.phone')} {config.donation.form.phone.required && '*'}</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            {...register('phone', { required: config.donation.form.phone.required ? t('donation.phone_required') : false })}
                                            style={{
                                                backgroundColor: 'var(--donation-input-bg)',
                                                color: 'var(--donation-input-text)',
                                                borderColor: 'var(--donation-input-border)'
                                            }}
                                        />
                                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                                    </div>
                                )}

                                {config.donation.form.message.enabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="message" style={{ color: 'var(--donation-label-color)' }}>{t('donation.message')}</Label>
                                        <textarea
                                            id="message"
                                            {...register('message')}
                                            className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{
                                                backgroundColor: 'var(--donation-input-bg)',
                                                color: 'var(--donation-input-text)',
                                                borderColor: 'var(--donation-input-border)'
                                            }}
                                        />
                                    </div>
                                )}

                                {config.donation.form.anonymous.enabled && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isAnonymous"
                                            {...register('isAnonymous')}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="isAnonymous" style={{ color: 'var(--donation-label-color)' }}>{t('donation.anonymous')}</Label>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full text-lg shadow-lg hover:shadow-xl transition-all"
                                    style={{
                                        backgroundColor: 'var(--donation-next-button-bg)',
                                        color: 'var(--donation-next-button-text)'
                                    }}
                                >
                                    {t('donation.submit', { amount: `$${currentAmount || 0} ` })}
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className={panelClass} style={panelStyle}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-primary" />
                                {t('donation.payment')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sessionData && (
                                <PaymentFormFactory
                                    providerId={config.donation.payment.provider}
                                    sessionData={sessionData}
                                    amount={currentAmount || 0}
                                    currency="usd"
                                    config={config.donation.payment.config}
                                    onSuccess={() => {
                                        navigate(`/${slug}/thank-you`, {
                                            state: {
                                                amount: currentAmount,
                                                donorName: watch('name'),
                                                transactionId: sessionData.id
                                            }
                                        });
                                    }}
                                    onBack={() => setStep('details')}
                                    onError={(msg: string) => console.error(msg)}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}
