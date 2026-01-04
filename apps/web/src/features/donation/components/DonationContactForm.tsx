import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { DonationFormValues } from '../schemas/donation.schema';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface DonationContactFormProps {
    register: UseFormRegister<DonationFormValues>;
    errors: FieldErrors<DonationFormValues>;
    currentAmount: number;
    submitError: string | null;
}

export const DonationContactForm = ({
    register,
    errors,
    currentAmount,
    submitError
}: DonationContactFormProps) => {
    const { t } = useTranslation('common');
    const { config } = useAppConfig();
    const { formatCurrency } = useCurrencyFormatter();

    const panelClass = "backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t rounded-3xl overflow-hidden mt-6";
    const panelStyle = {
        backgroundColor: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderRadius: 'var(--panel-radius, 1.5rem)'
    };

    return (
        <Card className={panelClass} style={panelStyle}>
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

                {config.donation.form.address?.enabled && (
                    <div className="space-y-2">
                        <Label htmlFor="address" style={{ color: 'var(--donation-label-color)' }}>{t('donation.address')} {config.donation.form.address.required && '*'}</Label>
                        <Input
                            id="address"
                            {...register('address', { required: config.donation.form.address.required ? t('validation.required') : false })}
                            style={{
                                backgroundColor: 'var(--donation-input-bg)',
                                color: 'var(--donation-input-text)',
                                borderColor: 'var(--donation-input-border)'
                            }}
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                    </div>
                )}

                {config.donation.form.company?.enabled && (
                    <div className="space-y-2">
                        <Label htmlFor="company" style={{ color: 'var(--donation-label-color)' }}>{t('donation.company')} {config.donation.form.company.required && '*'}</Label>
                        <Input
                            id="company"
                            {...register('company', { required: config.donation.form.company.required ? t('validation.required') : false })}
                            style={{
                                backgroundColor: 'var(--donation-input-bg)',
                                color: 'var(--donation-input-text)',
                                borderColor: 'var(--donation-input-border)'
                            }}
                        />
                        {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
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
                    {t('donation.submit', { amount: formatCurrency(currentAmount || 0) })}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </Card>
    );
};
