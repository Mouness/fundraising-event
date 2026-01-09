import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Textarea } from '@core/components/ui/textarea';
import { Checkbox } from '@core/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ReceiptForm } from './ReceiptForm';

export const CommunicationForm = () => {
    const { t } = useTranslation();
    const { register, setValue, control } = useFormContext(); // Added control back if needed elsewhere, though mostly used in sub-forms
    const sharingEnabled = useWatch({ control, name: 'sharing.enabled' });
    const networks = useWatch({ control, name: 'sharing.networks' }) || [];

    return (
        <div className="space-y-6">
            {/* Contact Points */}
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_branding.communication.contact.title')}</CardTitle>
                    <CardDescription>{t('admin_branding.communication.contact.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('admin_branding.communication.contact.email')}</Label>
                            <Input id="email" {...register('email')} placeholder={t('admin_branding.communication.contact.email_placeholder')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">{t('admin_branding.communication.contact.phone')}</Label>
                            <Input id="phone" {...register('phone')} placeholder={t('admin_branding.communication.contact.phone_placeholder')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t('admin_branding.communication.contact.tax_id')}</Label>
                            <Input {...register('taxId')} placeholder={t('admin_branding.communication.contact.tax_id_placeholder')} />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin_branding.communication.contact.signature_text')}</Label>
                            <Input {...register('signatureText')} placeholder={t('admin_branding.communication.contact.signature_text_placeholder')} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('admin_branding.communication.contact.signature_image')}</Label>
                        <Input {...register('signatureImage')} placeholder={t('admin_branding.communication.contact.signature_image_placeholder')} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">{t('admin_branding.communication.contact.address')}</Label>
                        <Textarea id="address" {...register('address')} rows={3} />
                    </div>
                </CardContent>
            </Card>

            {/* Receipt & Notifications */}
            <ReceiptForm />

            {/* Social Sharing Configuration */}
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('admin_branding.communication.sharing.title')}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sharingEnabled"
                                checked={sharingEnabled}
                                onCheckedChange={(checked: boolean) => setValue('sharing.enabled', checked === true)}
                            />
                            <label htmlFor="sharingEnabled" className="text-sm font-medium">{t('admin_branding.communication.sharing.enable')}</label>
                        </div>
                    </div>
                    <CardDescription>{t('admin_branding.communication.sharing.description')}</CardDescription>
                </CardHeader>
                {sharingEnabled && (
                    <CardContent className="space-y-4">
                        <Label>{t('admin_branding.communication.sharing.networks')}</Label>
                        <div className="flex flex-col gap-2">
                            {['facebook', 'twitter', 'linkedin'].map((network) => (
                                <div key={network} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`network-${network}`}
                                        checked={networks.includes(network)}
                                        onCheckedChange={(checked: boolean) => {
                                            const isChecked = checked === true;
                                            const newNetworks = isChecked
                                                ? [...networks, network]
                                                : networks.filter((n: string) => n !== network);
                                            setValue('sharing.networks', newNetworks);
                                        }}
                                    />
                                    <Label htmlFor={`network-${network}`}>{t(`admin_branding.communication.sharing.${network}`)}</Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};
