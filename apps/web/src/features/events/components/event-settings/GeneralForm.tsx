import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@core/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@core/components/ui/select'
import { Checkbox } from '@core/components/ui/checkbox'

export const GeneralForm = () => {
    const { t } = useTranslation('common')
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext()

    return (
        <div className="space-y-6">
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader>
                    <CardTitle>
                        {t('event_settings.general.basic_details_title', 'Basic Details')}
                    </CardTitle>
                    <CardDescription>
                        {t(
                            'event_settings.general.basic_details_desc',
                            'Main information about your fundraising event.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            {t('event_settings.general.event_name', 'Event Name')}
                        </Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message as string}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            {t('event_settings.general.description', 'Description')}
                        </Label>
                        <textarea
                            id="description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description.message as string}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="slug">
                                {t('event_settings.general.url_slug', 'URL Slug')}
                            </Label>
                            <Input id="slug" {...register('slug')} />
                            {errors.slug && (
                                <p className="text-sm text-red-500">
                                    {errors.slug.message as string}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">
                                {t('event_settings.general.status', 'Status')}
                            </Label>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    'event_settings.general.status_placeholder',
                                                    'Select status',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                {t('admin_events.status.active', 'Active')}
                                            </SelectItem>
                                            <SelectItem value="draft">
                                                {t('admin_events.status.draft', 'Draft')}
                                            </SelectItem>
                                            <SelectItem value="closed">
                                                {t('admin_events.status.closed', 'Closed')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.status && (
                                <p className="text-sm text-red-500">
                                    {errors.status.message as string}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="goalAmount">
                                {t('event_settings.general.goal_amount', 'Fundraising Goal')}
                            </Label>
                            <Input id="goalAmount" type="number" {...register('goalAmount')} />
                            {errors.goalAmount && (
                                <p className="text-sm text-red-500">
                                    {errors.goalAmount.message as string}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">
                                {t('event_settings.general.event_date', 'Event Date')}
                            </Label>
                            <Input id="date" type="date" {...register('date')} />
                            {errors.date && (
                                <p className="text-sm text-red-500">
                                    {errors.date.message as string}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader>
                    <CardTitle>
                        {t('event_settings.general.form_config_title', 'Form Configuration')}
                    </CardTitle>
                    <CardDescription>
                        {t(
                            'event_settings.general.form_config_desc',
                            'Select additional fields to collect from donors.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="formConfig.phone.enabled"
                            render={({ field }) => (
                                <Checkbox
                                    id="collectPhone"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="collectPhone">
                            {t('event_settings.general.collect_phone', 'Collect Phone Number')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="formConfig.address.enabled"
                            render={({ field }) => (
                                <Checkbox
                                    id="collectAddress"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="collectAddress">
                            {t('event_settings.general.collect_address', 'Collect Address')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="formConfig.company.enabled"
                            render={({ field }) => (
                                <Checkbox
                                    id="collectCompany"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="collectCompany">
                            {t('event_settings.general.collect_company', 'Collect Company Name')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="formConfig.message.enabled"
                            render={({ field }) => (
                                <Checkbox
                                    id="collectMessage"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="collectMessage">
                            {t('event_settings.general.collect_message', 'Collect Message')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="formConfig.anonymous.enabled"
                            render={({ field }) => (
                                <Checkbox
                                    id="allowAnonymous"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="allowAnonymous">
                            {t(
                                'event_settings.general.allow_anonymous',
                                'Allow Anonymous Donations',
                            )}
                        </Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
