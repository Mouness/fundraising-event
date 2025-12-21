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
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CreditCard } from 'lucide-react';

export const CheckoutForm = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { config } = useEventConfig();
    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [sessionData, setSessionData] = useState<any>(null);
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
            const amountInCents = Math.round(data.amount * 100);
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

            setSessionData(intentData);
            setStep('payment');
        } catch (err) {
            console.error(err);
        }
    };

    const glassCardClass = "bg-white/80 backdrop-blur-md border-white/20 shadow-xl overflow-hidden";

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
                        <Card className={glassCardClass}>
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
                                            className={`h-12 text-lg transition-all ${selectedAmount === amt ? 'bg-primary shadow-lg scale-105' : 'bg-white/50 hover:bg-white/80'}`}
                                        >
                                            ${amt}
                                        </Button>
                                    ))}
                                    <div className="col-span-2 relative">
                                        <Input
                                            type="number"
                                            placeholder={t('donation.custom_amount')}
                                            {...register('amount', { valueAsNumber: true })}
                                            className="h-12 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val)) setSelectedAmount(val);
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors.amount && <p className="text-sm text-red-500 font-medium">{errors.amount.message}</p>}
                            </CardContent>
                        </Card>

                        <Card className={glassCardClass}>
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-800">{t('donation.contact_info')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700">{t('donation.name')} *</Label>
                                    <Input id="name" {...register('name')} className="bg-white/50 focus:bg-white" />
                                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700">{t('donation.email')} *</Label>
                                    <Input id="email" type="email" {...register('email')} className="bg-white/50 focus:bg-white" />
                                    {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                                </div>

                                {config.donation.form.phone.enabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('donation.phone')} {config.donation.form.phone.required && '*'}</Label>
                                        <Input id="phone" type="tel" {...register('phone', { required: config.donation.form.phone.required ? t('donation.phone_required') : false })} className="bg-white/50 focus:bg-white" />
                                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                                    </div>
                                )}

                                {config.donation.form.message.enabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="message">{t('donation.message')}</Label>
                                        <textarea
                                            id="message"
                                            {...register('message')}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white"
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
                                        <Label htmlFor="isAnonymous">{t('donation.anonymous_label')}</Label>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" size="lg" className="w-full text-lg shadow-lg hover:shadow-xl transition-all">
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
                    <Card className={glassCardClass}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-primary" />
                                {t('donation.payment_details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sessionData && (
                                <PaymentFormFactory
                                    providerId={config.donation.payment.provider}
                                    sessionData={sessionData} // Kept sessionData as it's used for clientSecret in some implementations
                                    amount={currentAmount || 0} // Changed to currentAmount || 0
                                    currency="usd" // Kept currency as it's a standard prop
                                    config={config.donation.payment.config}
                                    onSuccess={() => {
                                        navigate('/thank-you', {
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
            )}
        </AnimatePresence>
    );
}
