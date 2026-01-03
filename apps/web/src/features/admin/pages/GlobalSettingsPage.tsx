import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api, API_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Globe, Palette, Mail, Save, CreditCard, Image as ImageIcon } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { IdentityForm } from '../components/global-settings/IdentityForm';
import { AssetsForm } from '../components/global-settings/AssetsForm';
import { CommunicationForm } from '../components/global-settings/CommunicationForm';
import { BrandDesignForm } from '../components/global-settings/BrandDesignForm';
import { LocalizationForm } from '../components/global-settings/LocalizationForm';
import { defaultConfig, fetchGlobalConfig, loadTheme, type EventConfig } from '@fundraising/white-labeling';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type GlobalSettingsForm } from '../types/settings';
import { useTranslation } from 'react-i18next';



export const GlobalSettingsPage = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    // State for local sidebar navigation
    const [activeSection, setActiveSection] = useState('identity');

    const { data: globalConfigData, isLoading } = useQuery({
        queryKey: ['global-settings'],
        queryFn: async () => {
            const config = await fetchGlobalConfig(API_URL);
            return config || ({} as EventConfig);
        }
    });

    const mutation = useMutation({
        mutationFn: (payload: any) => api.patch('/settings/global', payload),
        onSuccess: () => {
            toast.success(t('admin_branding.success_save'));
            queryClient.invalidateQueries({ queryKey: ['global-settings'] });
            // Refresh store and themes without page reload
            fetchGlobalConfig(API_URL).then(() => {
                loadTheme(true);
            });
            setSaving(false);
        },
        onError: () => {
            toast.error(t('admin_branding.error_save'));
            setSaving(false);
        }
    });

    const methods = useForm<GlobalSettingsForm>({
        defaultValues: {
            organization: defaultConfig.communication?.legalName || '',
            logo: '',
            email: defaultConfig.communication?.supportEmail || '',
            address: defaultConfig.communication?.address || '',
            phone: '',
            website: defaultConfig.communication?.website || '',
            themeVariables: [],
            // Helper object for common vars
            commonVariables: {} as any,
            event: { totalLabel: defaultConfig.content?.totalLabel },
            payment: {
                currency: defaultConfig.donation?.payment?.currency,
                provider: defaultConfig.donation?.payment?.provider
            },
            locales: {
                default: defaultConfig.locales?.default,
                supported: defaultConfig.locales?.supported
            },

            // Default Communication structure
            emailReceipt: {
                enabled: defaultConfig.communication?.email?.enabled ?? true,
                senderName: defaultConfig.communication?.legalName,
                replyTo: defaultConfig.communication?.supportEmail,
                subjectLine: defaultConfig.communication?.email?.subjectLine,
                footerText: defaultConfig.communication?.email?.footerText
            },
            pdfReceipt: {
                enabled: defaultConfig.communication?.pdf?.enabled ?? true,
                footerText: defaultConfig.communication?.pdf?.footerText,
                templateStyle: (defaultConfig.communication?.pdf?.templateStyle as any)
            },

            assets: { favicon: '', backgroundDonor: '', backgroundLive: '', backgroundLanding: '' }
        }
    });

    const { register, handleSubmit, reset, watch } = methods;

    const [localeOverrides, setLocaleOverrides] = useState<{ key: string, value: string, locale: string }[]>([]);

    const COMMON_KEYS_MAP: Record<string, string> = {
        primary: '--primary',
        background: '--background',
        foreground: '--foreground',
        muted: '--muted',
        mutedForeground: '--muted-foreground',
        card: '--card',
        cardForeground: '--card-foreground',
        popover: '--popover',
        popoverForeground: '--popover-foreground',
        primaryForeground: '--primary-foreground',
        border: '--border',
        input: '--input',
        ring: '--ring',
        radius: '--radius',
        radiusSm: '--radius-sm',
        radiusLg: '--radius-lg',
        secondary: '--secondary',
        secondaryForeground: '--secondary-foreground',
        accent: '--accent',
        accentForeground: '--accent-foreground',
        destructive: '--destructive',
        destructiveForeground: '--destructive-foreground'
    };

    // Load Data & Defaults
    useEffect(() => {
        if (!globalConfigData) return;

        const data = globalConfigData;

        // 2. Map merged values back to form fields
        const commonVars: Record<string, string> = {};
        Object.entries(COMMON_KEYS_MAP).forEach(([key, cssVar]) => {
            commonVars[key] = data.theme?.variables?.[cssVar] || '';
        });

        // 3. Custom vars: Filter out known keys.
        // We verify against what is actually in the DB (data.theme) to separate "Common" vs "Custom" inputs
        const knownKeys = new Set(Object.values(COMMON_KEYS_MAP));
        const customVariablesArray = Object.entries(data.theme?.variables || {})
            .filter(([key]) => !knownKeys.has(key as string))
            .map(([key, value]) => ({ key, value: String(value) }));

        reset({
            organization: data.communication?.legalName || data.content?.title || defaultConfig.communication?.legalName || '',
            logo: data.theme?.assets?.logo || '',
            email: data.communication?.supportEmail || defaultConfig.communication?.supportEmail || '',
            address: data.communication?.address || defaultConfig.communication?.address || '',
            phone: data.communication?.phone || '',
            website: data.communication?.website || defaultConfig.communication?.website || '',

            themeVariables: customVariablesArray,
            commonVariables: commonVars as any,

            event: { totalLabel: data.content?.totalLabel || defaultConfig.content?.totalLabel },
            payment: data.donation?.payment || defaultConfig.donation?.payment,
            locales: data.locales || defaultConfig.locales,
            emailReceipt: data.communication?.email || {
                enabled: defaultConfig.communication?.email?.enabled ?? true,
                senderName: defaultConfig.communication?.legalName,
                replyTo: defaultConfig.communication?.supportEmail,
                subjectLine: defaultConfig.communication?.email?.subjectLine,
                footerText: defaultConfig.communication?.email?.footerText
            },
            pdfReceipt: data.communication?.pdf || {
                enabled: defaultConfig.communication?.pdf?.enabled ?? true,
                footerText: defaultConfig.communication?.pdf?.footerText,
                templateStyle: (defaultConfig.communication?.pdf?.templateStyle as any)
            },
            assets: data.theme?.assets || { favicon: '', backgroundDonor: '', backgroundLive: '', backgroundLanding: '' }
        });

        setLocaleOverrides([]);
    }, [globalConfigData, reset]);


    const mapThemeVariables = (formData: GlobalSettingsForm) => {
        const vars: Record<string, string> = {};
        Object.entries(COMMON_KEYS_MAP).forEach(([formKey, cssKey]) => {
            const val = (formData.commonVariables as any)[formKey];
            if (val) vars[cssKey] = val;
        });
        formData.themeVariables.forEach(v => {
            if (v.key && v.key.startsWith('--')) vars[v.key] = v.value;
        });
        return vars;
    };

    const mapLocalesWithOverrides = (formData: GlobalSettingsForm) => {
        const localesPayload: any = { ...formData.locales };
        localeOverrides.forEach(({ locale, key, value }) => {
            if (!localesPayload[locale]) localesPayload[locale] = {};
            localesPayload[locale][key] = value;
        });

        const overriddenLocales = Array.from(new Set(localeOverrides.map(l => l.locale)));
        const currentSupported = new Set(localesPayload.supported || []);
        overriddenLocales.forEach(l => currentSupported.add(l));
        localesPayload.supported = Array.from(currentSupported);
        return localesPayload;
    };

    const mapFormToPayload = (formData: GlobalSettingsForm) => ({
        organization: formData.organization,
        logo: formData.logo,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        themeVariables: mapThemeVariables(formData),
        event: formData.event,
        communication: {
            legalName: formData.organization,
            address: formData.address,
            website: formData.website,
            supportEmail: formData.email,
            phone: formData.phone,
            email: formData.emailReceipt,
            pdf: formData.pdfReceipt
        },
        payment: formData.payment,
        locales: mapLocalesWithOverrides(formData),
        assets: formData.assets
    });

    const onSubmit = (formData: GlobalSettingsForm) => {
        setSaving(true);
        mutation.mutate(mapFormToPayload(formData));
    };


    const renderActiveSection = () => {
        switch (activeSection) {
            case 'identity': return <IdentityForm />;
            case 'communication': return <CommunicationForm />;
            case 'theme': return <BrandDesignForm />;
            case 'assets': return <AssetsForm />;
            case 'modules': return (
                <div className="space-y-6">
                    <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                        <CardHeader>
                            <CardTitle>{t('admin_branding.modules.payment_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>{t('admin_branding.modules.currency')}</Label><Input {...register('payment.currency')} /></div>
                                <div className="grid gap-2"><Label>{t('admin_branding.modules.provider')}</Label><Input {...register('payment.provider')} /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <LocalizationForm localeOverrides={localeOverrides} setLocaleOverrides={setLocaleOverrides} />
                </div>
            );
            default: return null;
        }
    };

    if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>;

    const navItems = [
        { id: 'identity', label: t('admin_branding.nav.identity'), icon: Globe },
        { id: 'communication', label: t('admin_branding.nav.communication'), icon: Mail },
        { id: 'theme', label: t('admin_branding.nav.theme'), icon: Palette },
        { id: 'assets', label: t('admin_branding.nav.assets'), icon: ImageIcon },
        { id: 'modules', label: t('admin_branding.nav.modules'), icon: CreditCard },
    ];

    return (
        <FormProvider {...methods}>
            <div className="max-w-[1400px] mx-auto pb-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('admin_branding.title')}</h2>
                        <p className="text-muted-foreground">{t('admin_branding.subtitle')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleSubmit(onSubmit)} disabled={saving} size="lg">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {saving ? t('admin_branding.saving') : t('admin_branding.save')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Settings Sidebar */}
                    <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                type="button"
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeSection === item.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    } `}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 md:col-span-9 lg:col-span-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {renderActiveSection()}
                            </div>

                            {/* Live Preview Sidebar (Sticky) */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-6 border-dashed bg-muted/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t('admin_branding.preview.title')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 text-center pt-6">
                                        {/* Logo Preview */}
                                        <div className="bg-background rounded-lg p-4 border shadow-sm inline-block">
                                            {watch('logo') ? (
                                                <img src={watch('logo')} alt="Logo" className="h-16 w-auto object-contain mx-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            ) : (
                                                <div className="h-16 w-16 mx-auto rounded bg-secondary/20 flex items-center justify-center text-2xl font-bold text-secondary">
                                                    {watch('organization')?.charAt(0) || 'A'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Identity Preview */}
                                        <div className="space-y-1">
                                            <p className="font-bold text-xl">{activeSection === 'identity' ? (watch('organization') || t('admin_branding.preview.organization_placeholder')) : (watch('organization') || t('admin_branding.preview.charity_placeholder'))}</p>
                                            <p className="text-sm text-muted-foreground">{watch('email') || t('admin_branding.preview.email_placeholder')}</p>
                                        </div>

                                        {/* Color Palette Preview */}
                                        <div className="space-y-3 pt-4 border-t">
                                            <p className="text-xs font-medium text-muted-foreground uppercase">{t('admin_branding.preview.theme_colors')}</p>
                                            <div className="flex justify-center gap-2">
                                                <div className="w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-background" style={{ backgroundColor: watch('commonVariables.primary') }} title="Primary" />
                                                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: watch('commonVariables.secondary') }} title="Secondary" />
                                                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: watch('commonVariables.accent') }} title="Accent" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};
