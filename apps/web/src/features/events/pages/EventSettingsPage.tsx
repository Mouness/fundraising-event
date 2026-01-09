import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@core/lib/api';
import { toast } from 'sonner';
import { Button } from '@core/components/ui/button';
import { Settings, Palette, Save, Loader2 } from 'lucide-react';
import { GeneralForm } from '../components/event-settings/GeneralForm';
import { BrandingForm } from '../components/event-settings/BrandingForm';
import { useEvent } from '../context/EventContext';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { type EventConfig } from '@fundraising/white-labeling';
import { eventSettingsSchema } from '../schemas/event-settings.schema';
import type { EventSettingsFormValues } from '../schemas/event-settings.schema';

// Helper to persist event-specific settings that should remain even when Global Branding is enabled.
const persistFunctionalSettings = async (eventId: string, values: EventSettingsFormValues) => {
    const payload: any = {};
    // Persist Live Theme
    if (values.live) {
        payload.live = values.live;
    }
    // Persist Landing Page Links
    if (values.landing) {
        payload.content = {
            landing: values.landing
        };
    }
    // Only fire request if there's something to save
    if (Object.keys(payload).length > 0) {
        await api.patch(`/events/${eventId}/branding`, payload);
    }
};

export const EventSettingsPage = () => {
    const { t } = useTranslation('common');
    const { event, isLoading: isEventLoading } = useEvent();
    const { refreshConfig } = useAppConfig();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState('general');

    const form = useForm({
        resolver: zodResolver(eventSettingsSchema),
        defaultValues: {
            // General Defaults
            name: '', goalAmount: 0, slug: '', status: 'draft', date: '', description: '',
            formConfig: {
                phone: { enabled: false, required: false },
                address: { enabled: false, required: false },
                company: { enabled: false, required: false },
                message: { enabled: true, required: false },
                anonymous: { enabled: true, required: false },
            },

            // Branding Defaults
            useGlobalBranding: true,
            organization: '',
            assets: { logo: '', backgroundLanding: '', backgroundLive: '' },
            themeVariables: [],
            communication: {
                enabled: false,
                senderName: '',
                replyTo: '',
                subjectLine: '',
                supportEmail: '',
                phone: '',
                website: '',
                address: ''
            },
            landing: {
                impact: { url: '', enabled: true },
                community: { url: '', enabled: true },
                interactive: { url: '', enabled: true },
            },
            live: {
                theme: 'classic'
            }
        }
    });

    const navItems = [
        { id: 'general', label: t('event_settings.nav.general', 'General'), icon: Settings },
        { id: 'branding', label: t('event_settings.nav.branding', 'Design & Branding'), icon: Palette },
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'general': return <GeneralForm />;
            case 'branding': return <BrandingForm />;
            default: return null;
        }
    };

    // Load Event Data and Branding Override using useQuery
    const { data: eventSettings } = useQuery({
        queryKey: ['event-settings', event?.slug],
        queryFn: async () => {
            if (!event?.slug) return null;
            // First fetch the raw settings to get general details and override status
            const res = await api.get(`/events/${event.slug}/settings`);
            return res.data;
        },
        enabled: !!event?.slug
    });

    // Sync form with loaded data
    useEffect(() => {
        if (!event || !eventSettings) return;

        const data = eventSettings;
        const variables = data.theme?.variables || {};
        const variableArray = Object.entries(variables).map(([key, value]) => ({ key, value: String(value) }));

        const donationForm = data.donation?.form;

        form.reset({
            // General
            name: event.name,
            goalAmount: Number(event.goalAmount),
            slug: event.slug,
            description: event.description || '',
            status: (event.status as "active" | "draft" | "closed") || 'draft',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            formConfig: {
                phone: { enabled: donationForm?.phone?.enabled ?? false, required: false },
                address: { enabled: donationForm?.address?.enabled ?? false, required: false },
                company: { enabled: donationForm?.company?.enabled ?? false, required: false },
                message: { enabled: donationForm?.message?.enabled ?? true, required: false },
                anonymous: { enabled: donationForm?.anonymous?.enabled ?? true, required: false },
            },
            // Branding
            useGlobalBranding: !data.isOverride,
            organization: data.content?.title || '',
            assets: {
                logo: data.theme?.assets?.logo || '',
                backgroundLanding: data.theme?.assets?.backgroundLanding || '',
                backgroundLive: data.theme?.assets?.backgroundLive || '',
            },
            landing: {
                impact: {
                    url: data.content?.landing?.impact?.url || '',
                    enabled: data.content?.landing?.impact?.enabled ?? true
                },
                community: {
                    url: data.content?.landing?.community?.url || '',
                    enabled: data.content?.landing?.community?.enabled ?? true
                },
                interactive: {
                    url: data.content?.landing?.interactive?.url || '',
                    enabled: data.content?.landing?.interactive?.enabled ?? true
                },
            },
            themeVariables: variableArray,
            communication: {
                enabled: data.overrides?.communication ?? !!data.communication?.email?.senderName,
                senderName: data.communication?.email?.senderName || '',
                replyTo: data.communication?.email?.replyTo || '',
                subjectLine: data.communication?.email?.subjectLine || '',
            },
            live: {
                theme: data.live?.theme || 'classic'
            }
        });
    }, [event, eventSettings, form]);

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof eventSettingsSchema>) => {
            if (!event?.id) throw new Error('No active event ID');

            // 1. Save General Settings
            await api.patch(`/events/${event.id}`, {
                name: values.name,
                goalAmount: values.goalAmount,
                slug: values.slug,
                status: values.status,
                description: values.description,
                date: values.date ? new Date(values.date).toISOString() : undefined,
                formConfig: values.formConfig,
            });

            // 2. Save Branding Settings
            if (values.useGlobalBranding) {
                // Delete event-specific branding overrides (reset to global)
                await api.delete(`/events/${event.id}/branding`);

                // CRITICAL: We must explicitly save settings that are event-specific 
                // but technically part of the "branding" structure (Live Theme, Landing Links).
                await persistFunctionalSettings(event.id, values);
            } else {
                // Transform variables array back to object
                const variablesMap = (values.themeVariables || []).reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
                    if (curr.key && curr.value) acc[curr.key] = curr.value;
                    return acc;
                }, {});

                await api.patch(`/events/${event.id}/branding`, {
                    communication: {
                        legalName: values.organization || undefined,
                        ...(values.communication?.enabled ? {
                            senderName: values.communication?.senderName,
                            replyTo: values.communication?.replyTo,
                            subjectLine: values.communication?.subjectLine,
                        } : {})
                    },
                    theme: {
                        assets: values.assets,
                        variables: variablesMap,
                    },
                    content: {
                        landing: values.landing
                    },
                    live: values.live
                } as any as Partial<EventConfig>);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-event-settings'] });
            queryClient.invalidateQueries({ queryKey: ['event-settings', event?.slug] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            refreshConfig();
            toast.success(t('common.saved_successfully'));
        },
        onError: (error: unknown) => {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || t('common.error_saving'));
        }
    });

    return (
        <FormProvider {...form}>
            <div className="max-w-[1400px] mx-auto pb-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('event_settings.title', 'Event Settings')}</h2>
                        <p className="text-muted-foreground">{t('event_settings.subtitle', 'Configure event details and appearance.')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={form.handleSubmit(
                                (data) => mutation.mutate(data),
                                (errors) => {
                                    console.error('Form Validation Errors:', errors);
                                    toast.error(t('common.form_validation_error', 'Please check the form for errors.'));
                                }
                            )}
                            disabled={mutation.isPending || isEventLoading}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.saving', 'Saving...')}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('common.save_changes', 'Save Changes')}
                                </>
                            )}
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
                        <div className="max-w-4xl">
                            {renderActiveSection()}
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};
