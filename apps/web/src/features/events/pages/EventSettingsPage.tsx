
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvent } from '@/features/events/context/EventContext';

const getEventSchema = (t: any) => z.object({
    name: z.string().min(1, t('validation.required')),
    goalAmount: z.coerce.number().min(1, t('validation.min_value', { count: 1 })),
    slug: z.string().min(1, t('validation.required')),
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, t('validation.invalid_hex')),
    logoUrl: z.string().url(t('validation.invalid_url')).optional().or(z.literal('')),
});

type EventFormValues = z.infer<ReturnType<typeof getEventSchema>>;

export const EventSettingsPage = () => {
    const queryClient = useQueryClient();
    const { event, isLoading } = useEvent();
    const { t } = useTranslation('common');

    const eventSchema = getEventSchema(t);
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            goalAmount: 0,
            slug: '',
            primaryColor: '#000000',
            logoUrl: '',
        },
    });

    // Populate form when data loads
    useEffect(() => {
        if (event) {
            const primary = event.themeConfig?.variables?.['--primary'] || '#000000';
            const logo = event.themeConfig?.assets?.logo || '';

            form.reset({
                name: event.name,
                goalAmount: Number(event.goalAmount),
                slug: event.slug,
                primaryColor: primary,
                logoUrl: logo,
            });
        }
    }, [event, form]);

    const mutation = useMutation({
        mutationFn: async (values: EventFormValues) => {
            if (!event?.id) throw new Error('No active event ID');

            const currentThemeConfig = event.themeConfig || {};

            // Deep merge logic
            const updatedThemeConfig = {
                ...currentThemeConfig,
                assets: {
                    ...currentThemeConfig.assets,
                    logo: values.logoUrl || undefined
                },
                variables: {
                    ...currentThemeConfig.variables,
                    '--primary': values.primaryColor
                }
            };

            await api.patch(`/events/${event.id}`, {
                name: values.name,
                goalAmount: values.goalAmount,
                slug: values.slug,
                themeConfig: updatedThemeConfig,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-event-settings'] });
            // Ideally invalidate 'events' list too
            queryClient.invalidateQueries({ queryKey: ['events'] });
            alert("Settings saved successfully!");
        },
        onError: (error: any) => {
            console.error('Failed to save settings', error);
            const msg = error?.response?.data?.message || error?.message || "Unknown error";
            alert(`Failed to save settings: ${msg}`);
        }
    });

    const onSubmit = (values: EventFormValues) => {
        mutation.mutate(values);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!event) {
        return <div className="p-8">No event found. Please initialize the database.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Event Settings</h2>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic details about your fundraising event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Event Name</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input id="slug" {...form.register('slug')} />
                            {form.formState.errors.slug && <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="goalAmount">Fundraising Goal ($)</Label>
                            <Input id="goalAmount" type="number" {...form.register('goalAmount')} />
                            {form.formState.errors.goalAmount && <p className="text-sm text-red-500">{form.formState.errors.goalAmount.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Branding & Theme</CardTitle>
                        <CardDescription>Customize the look and feel of public pages.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="logoUrl">Logo URL (Leave empty for default)</Label>
                            <Input id="logoUrl" placeholder="https://..." {...form.register('logoUrl')} />
                            {form.formState.errors.logoUrl && <p className="text-sm text-red-500">{form.formState.errors.logoUrl.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <Controller
                                control={form.control}
                                name="primaryColor"
                                render={({ field }) => (
                                    <div className="flex gap-2">
                                        <Input
                                            id="primaryColor"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={field.value || '#000000'}
                                            onChange={(e) => {
                                                field.onChange(e.target.value.toUpperCase());
                                                setTimeout(() => e.target.blur(), 0);
                                            }}
                                        />
                                        <Input
                                            type="text"
                                            className="flex-1"
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                )}
                            />
                            {form.formState.errors.primaryColor && <p className="text-sm text-red-500">{form.formState.errors.primaryColor.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};
