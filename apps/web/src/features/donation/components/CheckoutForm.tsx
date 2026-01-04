import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DonationFormValues } from '../schemas/donation.schema';
import { getDonationSchema } from '../schemas/donation.schema';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { api } from '@/lib/api';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { PaymentFormFactory } from './payment/PaymentFormFactory';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { DonationAmountSelector } from './DonationAmountSelector';
import { DonationContactForm } from './DonationContactForm';

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

    const { currency } = useCurrencyFormatter();

    // Validate slug against config to ensure consistency
    if (slug && config.slug && slug !== config.slug) {
        console.warn(`Slug mismatch: URL param '${slug}' does not match config slug '${config.slug}'. Using config slug.`);
    }
    const activeSlug = slug || config.slug;

    const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<DonationFormValues>({
        resolver: zodResolver(getDonationSchema(t)),
        defaultValues: {
            amount: 20,
            isAnonymous: false,
            name: '',
            email: '',
            message: ''
        }
    });

    // eslint-disable-next-line react-hooks/incompatible-library
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
                currency: currency,
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
                        <DonationAmountSelector
                            selectedAmount={selectedAmount}
                            onAmountSelect={handleAmountSelect}
                            register={register}
                            errors={errors}
                            setValue={setValue}
                        />

                        <DonationContactForm
                            register={register}
                            errors={errors}
                            currentAmount={currentAmount}
                            submitError={submitError}
                        />
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
                                    currency={config.donation?.payment?.currency || 'usd'}
                                    config={config.donation.payment.config}
                                    onSuccess={() => {
                                        navigate(`/${slug}/thank-you`, {
                                            state: {
                                                amount: currentAmount,
                                                donorName: getValues('name'),
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
