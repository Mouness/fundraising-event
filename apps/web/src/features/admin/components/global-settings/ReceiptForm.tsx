import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation, Trans } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Textarea } from '@core/components/ui/textarea';
import { Checkbox } from '@core/components/ui/checkbox';
import { SMTP_PROVIDERS, type SmtpProviderType } from '../../constants/mail-providers';

export const ReceiptForm = () => {
    const { t } = useTranslation();
    const { register, control, setValue } = useFormContext();

    const emailEnabled = useWatch({ control, name: 'emailReceipt.enabled' });
    const provider = useWatch({ control, name: 'emailReceipt.provider' });
    const pdfEnabled = useWatch({ control, name: 'pdfReceipt.enabled' });
    const smtpSecure = useWatch({ control, name: 'emailReceipt.config.smtp.secure' });
    useEffect(() => {
        if (provider in SMTP_PROVIDERS) {
            const config = SMTP_PROVIDERS[provider as SmtpProviderType];
            setValue('emailReceipt.config.smtp.host', config.host);
            setValue('emailReceipt.config.smtp.port', config.port);
            setValue('emailReceipt.config.smtp.secure', config.secure);
            if (config.user) {
                setValue('emailReceipt.config.smtp.auth.user', config.user);
            }
        }
    }, [provider, setValue]);


    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('admin_branding.communication.receipts.title')}</CardTitle>
                <CardDescription>{t('admin_branding.communication.receipts.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Toggles */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="emailEnabled"
                            checked={emailEnabled ?? false}
                            onCheckedChange={(checked: boolean) => setValue('emailReceipt.enabled', checked === true)}
                        />
                        <label htmlFor="emailEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('admin_branding.communication.email.enable')}
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="pdfEnabled"
                            checked={pdfEnabled ?? false}
                            onCheckedChange={(checked: boolean) => setValue('pdfReceipt.enabled', checked === true)}
                        />
                        <label htmlFor="pdfEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('admin_branding.communication.pdf.enable')}
                        </label>
                    </div>
                </div>

                <div className="border-t"></div>

                {/* Common Footer Text */}
                {(emailEnabled || pdfEnabled) && (
                    <div className="grid gap-2">
                        <Label>{t('admin_branding.communication.receipts.footer_text')}</Label>
                        <Textarea
                            {...register('footerText')}
                            className="font-mono text-xs"
                            rows={2}
                            placeholder={t('admin_branding.communication.receipts.footer_text_placeholder')}
                        />
                        <p className="text-xs text-muted-foreground">{t('admin_branding.communication.receipts.footer_text_help')}</p>
                    </div>
                )}

                {/* Email Settings */}
                {emailEnabled && (
                    <>
                        <div className="border-t pt-2"></div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">{t('admin_branding.communication.email.config_title')}</Label>
                            </div>

                            {/* Provider Selection */}
                            <div className="grid gap-2">
                                <Label>{t('admin_branding.communication.email.provider_label')}</Label>
                                <select
                                    {...register('emailReceipt.provider')}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="console">{t('admin_branding.communication.email.providers.console')}</option>
                                    <option value="smtp">{t('admin_branding.communication.email.providers.smtp')}</option>
                                    <option value="resend">{t('admin_branding.communication.email.providers.resend')}</option>
                                    <option value="gmail">{t('admin_branding.communication.email.providers.gmail')}</option>
                                    <option value="outlook">{t('admin_branding.communication.email.providers.outlook')}</option>
                                </select>
                            </div>

                            {/* SMTP Configuration */}
                            {provider !== 'console' && (
                                <div className="space-y-4 border p-4 rounded-md">
                                    <Label className="text-base font-semibold">{t('admin_branding.communication.email.smtp.title')}</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>{t('admin_branding.communication.email.smtp.host')}</Label>
                                            <Input {...register('emailReceipt.config.smtp.host')} placeholder={t('admin_branding.communication.email.smtp.host_placeholder')} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('admin_branding.communication.email.smtp.port')}</Label>
                                            <Input
                                                type="number"
                                                {...register('emailReceipt.config.smtp.port', { valueAsNumber: true })}
                                                placeholder={t('admin_branding.communication.email.smtp.port_placeholder')}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="smtpSecure"
                                            checked={smtpSecure ?? false}
                                            onCheckedChange={(checked: boolean) => setValue('emailReceipt.config.smtp.secure', checked === true)}
                                        />
                                        <Label htmlFor="smtpSecure">{t('admin_branding.communication.email.smtp.secure')}</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>{t('admin_branding.communication.email.smtp.username')}</Label>
                                            <Input {...register('emailReceipt.config.smtp.auth.user')} placeholder={t('admin_branding.communication.email.smtp.username_placeholder')} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>{t('admin_branding.communication.email.smtp.password')}</Label>
                                            <Input
                                                type="password"
                                                {...register('emailReceipt.config.smtp.auth.pass')}
                                                placeholder={t('admin_branding.communication.email.smtp.password_placeholder')}
                                            />
                                        </div>
                                    </div>
                                    {provider === 'gmail' && (
                                        <p className="text-xs text-muted-foreground">
                                            <Trans i18nKey="admin_branding.communication.email.smtp.help.gmail">
                                                For Gmail, use an <strong>App Password</strong> (requires 2FA enabled).
                                            </Trans>
                                        </p>
                                    )}
                                    {provider === 'outlook' && (
                                        <p className="text-xs text-muted-foreground">
                                            <Trans i18nKey="admin_branding.communication.email.smtp.help.outlook">
                                                For Outlook, use an <strong>App Password</strong> if 2FA is enabled.
                                            </Trans>
                                        </p>
                                    )}
                                    {provider === 'resend' && (
                                        <p className="text-xs text-muted-foreground">
                                            <Trans i18nKey="admin_branding.communication.email.smtp.help.resend">
                                                For Resend, username should be <strong>resend</strong> and 'Password' is your API Key.
                                            </Trans>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Sender Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>{t('admin_branding.communication.email.sender')}</Label>
                                    <Input {...register('emailReceipt.senderName')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>{t('admin_branding.communication.email.reply_to')}</Label>
                                    <Input {...register('emailReceipt.replyTo')} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>{t('admin_branding.communication.email.subject')}</Label>
                                <Input {...register('emailReceipt.subjectLine')} />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
