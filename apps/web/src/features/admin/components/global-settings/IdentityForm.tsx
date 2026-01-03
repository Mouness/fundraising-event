import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const IdentityForm = () => {
    const { t } = useTranslation();
    const { register } = useFormContext();

    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('admin_branding.identity.title')}</CardTitle>
                <CardDescription>{t('admin_branding.identity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="organization">{t('admin_branding.identity.org_name')}</Label>
                        <Input id="organization" {...register('organization')} placeholder={t('admin_branding.identity.org_placeholder')} />
                        <p className="text-xs text-muted-foreground">{t('admin_branding.identity.org_hint')}</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website">{t('admin_branding.identity.website')}</Label>
                        <Input id="website" {...register('website')} placeholder={t('admin_branding.identity.website_placeholder')} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
