import { useFormContext } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';

export const PaymentForm = () => {
    const { t } = useTranslation();
    const { register, watch, setValue } = useFormContext();
    const provider = watch('payment.provider');

    // Safe handle switch change
    const onProviderChange = (val: string) => {
        setValue('payment.provider', val);
    };

    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('admin_branding.modules.payment_title', 'Payment Configuration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>{t('admin_branding.modules.currency')}</Label>
                        <Select
                            value={watch('payment.currency')}
                            onValueChange={(val) => setValue('payment.currency', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CAD">CAD</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="CHF">CHF</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('admin_branding.modules.provider')}</Label>
                        <Select value={provider} onValueChange={onProviderChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="offline">Offline / Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {provider === 'stripe' && (
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Stripe Settings</h4>
                        <div className="grid gap-2">
                            <Label>Publishable Key</Label>
                            <Input {...register('payment.config.stripe.publishableKey')} placeholder="pk_test_..." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Secret Key</Label>
                            <Input type="password" {...register('payment.config.stripe.secretKey')} placeholder="sk_test_..." />
                        </div>
                    </div>
                )}

                {provider === 'paypal' && (
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground">PayPal Settings</h4>
                        <div className="grid gap-2">
                            <Label>Client ID</Label>
                            <Input {...register('payment.config.paypal.clientId')} placeholder="Client ID" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Secret</Label>
                            <Input type="password" {...register('payment.config.paypal.secret')} placeholder="Secret" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="paypal-sandbox"
                                checked={watch('payment.config.paypal.sandbox')}
                                onCheckedChange={(c: boolean) => setValue('payment.config.paypal.sandbox', c)}
                            />
                            <Label htmlFor="paypal-sandbox">Sandbox Mode</Label>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
