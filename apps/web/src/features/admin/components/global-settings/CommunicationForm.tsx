import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const CommunicationForm = () => {
    const { t } = useTranslation();
    const { register, control, setValue } = useFormContext();
    const emailEnabled = useWatch({ control, name: 'emailReceipt.enabled' });
    const pdfEnabled = useWatch({ control, name: 'pdfReceipt.enabled' });

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
                    <div className="grid gap-2">
                        <Label htmlFor="address">{t('admin_branding.communication.contact.address')}</Label>
                        <Textarea id="address" {...register('address')} rows={3} />
                    </div>
                </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('admin_branding.communication.email.title')}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="emailEnabled"
                                checked={emailEnabled}
                                onCheckedChange={(checked) => setValue('emailReceipt.enabled', checked === true)}
                            />
                            <label htmlFor="emailEnabled" className="text-sm font-medium">{t('admin_branding.communication.email.enable')}</label>
                        </div>
                    </div>
                    <CardDescription>{t('admin_branding.communication.email.description')}</CardDescription>
                </CardHeader>
                {emailEnabled && (
                    <CardContent className="space-y-4">
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
                        <div className="grid gap-2">
                            <Label>{t('admin_branding.communication.email.footer')}</Label>
                            <Textarea {...register('emailReceipt.footerText')} className="font-mono text-xs" rows={2} />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* PDF Configuration */}
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('admin_branding.communication.pdf.title')}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="pdfEnabled"
                                checked={pdfEnabled}
                                onCheckedChange={(checked) => setValue('pdfReceipt.enabled', checked === true)}
                            />
                            <label htmlFor="pdfEnabled" className="text-sm font-medium">{t('admin_branding.communication.pdf.enable')}</label>
                        </div>
                    </div>
                    <CardDescription>{t('admin_branding.communication.pdf.description')}</CardDescription>
                </CardHeader>
                {pdfEnabled && (
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>{t('admin_branding.communication.pdf.template')}</Label>
                            <select
                                {...register('pdfReceipt.templateStyle')}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="formal">{t('admin_branding.communication.pdf.formal')}</option>
                                <option value="minimal">{t('admin_branding.communication.pdf.minimal')}</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin_branding.communication.pdf.footer')}</Label>
                            <Textarea {...register('pdfReceipt.footerText')} className="font-mono text-xs" rows={2} />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};
