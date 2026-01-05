import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AssetsForm = () => {
    const { t } = useTranslation();
    const { register } = useFormContext();

    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('admin_branding.assets.title')}</CardTitle>
                <CardDescription>{t('admin_branding.assets.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="logo">{t('admin_branding.assets.logo')}</Label>
                        <Input id="logo" {...register('logo')} placeholder="https://..." />
                        <p className="text-xs text-muted-foreground">{t('admin_branding.assets.logo_hint')}</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="favicon">{t('admin_branding.assets.favicon')}</Label>
                        <Input id="favicon" {...register('assets.favicon')} placeholder="https://..." />
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <Label className="text-base font-semibold block mb-4">{t('admin_branding.assets.backgrounds')}</Label>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="backgroundLanding">{t('admin_branding.assets.landing')}</Label>
                                <Input id="backgroundLanding" {...register('assets.backgroundLanding')} placeholder="https://..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="backgroundDonor">{t('admin_branding.assets.donor')}</Label>
                                <Input id="backgroundDonor" {...register('assets.backgroundDonor')} placeholder="https://..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="backgroundLive">{t('admin_branding.assets.live')}</Label>
                                <Input id="backgroundLive" {...register('assets.backgroundLive')} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
