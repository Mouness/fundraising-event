
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';


const eventSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    goalAmount: z.coerce.number().min(1, 'Goal must be at least 1'),
    slug: z.string().min(1, 'Slug is required'),
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color'),
});

type EventFormValues = z.infer<typeof eventSchema>;

export const EventSettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [eventId, setEventId] = useState<string | null>(null);
    // const { toast } = useToast(); // If not exists, will use alert

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            goalAmount: 0,
            slug: '',
            primaryColor: '#000000',
        },
    });

    useEffect(() => {
        loadEvent();
    }, []);

    const loadEvent = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/events');
            if (data && data.length > 0) {
                const event = data[0];
                setEventId(event.id);
                form.reset({
                    name: event.name,
                    goalAmount: Number(event.goalAmount),
                    slug: event.slug,
                    primaryColor: event.themeConfig?.primaryColor || '#000000',
                });
            }
        } catch (error) {
            console.error('Failed to load event', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: EventFormValues) => {
        if (!eventId) return;

        try {
            setIsSaving(true);
            await api.patch(`/events/${eventId}`, {
                name: values.name,
                goalAmount: values.goalAmount,
                slug: values.slug, // Usually slug shouldn't change easily but allowing for now
                themeConfig: {
                    primaryColor: values.primaryColor,
                },
            });
            // toast({ title: "Settings saved", description: "Event configuration updated." });
            alert("Settings saved successfully!");
        } catch (error) {
            console.error('Failed to save settings', error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!eventId) {
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
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    {...form.register('primaryColor')}
                                />
                                <Input
                                    type="text"
                                    {...form.register('primaryColor')}
                                    className="flex-1"
                                />
                            </div>
                            {form.formState.errors.primaryColor && <p className="text-sm text-red-500">{form.formState.errors.primaryColor.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};
