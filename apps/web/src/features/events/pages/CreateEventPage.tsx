import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { api } from '@core/lib/api'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createEventSchema, type CreateEventFormValues } from '../schemas/create-event.schema'

export const CreateEventPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const form = useForm<CreateEventFormValues>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            name: '',
            slug: '',
            goalAmount: 10000,
        },
    })

    const onSubmit = async (values: CreateEventFormValues) => {
        try {
            await api.post('/events', values)
            toast.success(t('admin_events.create_success', 'Event created successfully'))
            navigate('/admin/events')
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message
            toast.error(msg || t('admin_events.create_error', 'Failed to create event'))
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto p-4">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/events')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('admin_events.create_title', 'Create New Campaign')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('admin_events.create_subtitle', 'Launch a new fundraising campaign')}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin_events.details', 'Event Details')}</CardTitle>
                    <CardDescription>
                        {t('admin_events.details_desc', 'Basic information about your campaign')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('admin_events.name', 'Campaign Name')}</Label>
                            <Input
                                id="name"
                                placeholder={t(
                                    'admin_events.create_placeholder_name',
                                    'e.g. Annual Charity Gala',
                                )}
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">{t('admin_events.slug', 'URL Slug')}</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1.5 rounded">
                                    /
                                </span>
                                <Input
                                    id="slug"
                                    placeholder={t(
                                        'admin_events.create_placeholder_slug',
                                        'my-event',
                                    )}
                                    {...form.register('slug')}
                                    className="font-mono"
                                />
                            </div>
                            {form.formState.errors.slug && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.slug.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goalAmount">
                                {t('admin_events.goal_amount', 'Fundraising Goal')}
                            </Label>
                            <Input
                                id="goalAmount"
                                type="number"
                                placeholder={t('admin_events.create_placeholder_goal', '10000')}
                                {...form.register('goalAmount', { valueAsNumber: true })}
                            />
                            {form.formState.errors.goalAmount && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.goalAmount.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('admin_events.create_action', 'Create Campaign')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

// Default export for lazy loading
export default CreateEventPage
