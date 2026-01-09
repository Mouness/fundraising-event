import { useFormContext } from 'react-hook-form'
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/card'
import { Label } from '@core/components/ui/label'
import { Input } from '@core/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@core/components/ui/select'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@core/components/ui/checkbox'

export const PaymentForm = () => {
    const { t } = useTranslation()
    const { register, watch, setValue } = useFormContext()
    const provider = watch('payment.provider')

    // Safe handle switch change
    const onProviderChange = (val: string) => {
        setValue('payment.provider', val)
    }

    return (
        <Card
            style={{
                backgroundColor: 'var(--admin-card-bg)',
                borderColor: 'var(--admin-border-color)',
            }}
        >
            <CardHeader>
                <CardTitle>{t('admin_branding.modules.payment_title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {t('admin_branding.modules.payment_description')}
                </p>
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
                        <h4 className="text-sm font-medium text-muted-foreground">
                            {t('admin_branding.modules.stripe.title', 'Stripe Settings')}
                        </h4>
                        <div className="grid gap-2">
                            <Label htmlFor="stripe-publishable-key">
                                {t(
                                    'admin_branding.modules.stripe.publishable_key',
                                    'Publishable Key',
                                )}
                            </Label>
                            <Input
                                id="stripe-publishable-key"
                                {...register('payment.config.stripe.publishableKey')}
                                placeholder="pk_test_..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stripe-secret-key">
                                {t('admin_branding.modules.stripe.secret_key', 'Secret Key')}
                            </Label>
                            <Input
                                id="stripe-secret-key"
                                type="password"
                                {...register('payment.config.stripe.secretKey')}
                                placeholder="sk_test_..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stripe-webhook-secret">
                                {t(
                                    'admin_branding.modules.stripe.webhook_secret',
                                    'Webhook Secret',
                                )}
                            </Label>
                            <Input
                                id="stripe-webhook-secret"
                                type="password"
                                {...register('payment.config.stripe.webhookSecret')}
                                placeholder="whsec_..."
                            />
                        </div>
                    </div>
                )}

                {provider === 'paypal' && (
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            {t('admin_branding.modules.paypal.title', 'PayPal Settings')}
                        </h4>
                        <div className="grid gap-2">
                            <Label htmlFor="paypal-client-id">
                                {t('admin_branding.modules.paypal.client_id', 'Client ID')}
                            </Label>
                            <Input
                                id="paypal-client-id"
                                {...register('payment.config.paypal.clientId')}
                                placeholder={t(
                                    'admin_branding.modules.paypal.client_id',
                                    'Client ID',
                                )}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paypal-secret">
                                {t('admin_branding.modules.paypal.secret', 'Client Secret')}
                            </Label>
                            <Input
                                id="paypal-secret"
                                type="password"
                                {...register('payment.config.paypal.clientSecret')}
                                placeholder={t(
                                    'admin_branding.modules.paypal.secret',
                                    'Client Secret',
                                )}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paypal-webhook-id">
                                {t('admin_branding.modules.paypal.webhook_id', 'Webhook ID')}
                            </Label>
                            <Input
                                id="paypal-webhook-id"
                                {...register('payment.config.paypal.webhookId')}
                                placeholder={t(
                                    'admin_branding.modules.paypal.webhook_id',
                                    'Webhook ID',
                                )}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="paypal-sandbox"
                                checked={watch('payment.config.paypal.sandbox')}
                                onCheckedChange={(c: boolean) =>
                                    setValue('payment.config.paypal.sandbox', c)
                                }
                            />
                            <Label htmlFor="paypal-sandbox">
                                {t('admin_branding.modules.paypal.sandbox', 'Sandbox Mode')}
                            </Label>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
