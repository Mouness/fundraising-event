import { useFormContext, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Checkbox } from '@core/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@core/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@core/components/ui/select'

import { Button } from '@core/components/ui/button'
import {
    AlertCircle as AlertIcon,
    Palette,
    Image as ImageIcon,
    Mail,
    Plus,
    Trash2,
} from 'lucide-react'
import { ToggledInputField } from './ToggledInputField'

export const BrandingForm = () => {
    const { t } = useTranslation('common')
    const { register, watch, setValue, control } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'themeVariables',
    })

    const useGlobalBranding = watch('useGlobalBranding')
    const communicationEnabled = watch('communication.enabled')

    return (
        <div className="space-y-8">
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        {t('event_settings.branding.strategy_title', 'Branding Strategy')}
                    </CardTitle>
                    <CardDescription>
                        {t(
                            'event_settings.branding.strategy_desc',
                            'Decide if this event should follow organization-wide branding or have its own identity.',
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                        <Checkbox
                            id="useGlobalBranding"
                            checked={useGlobalBranding}
                            onCheckedChange={(checked) =>
                                setValue('useGlobalBranding', checked as boolean)
                            }
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="useGlobalBranding"
                                className="font-semibold cursor-pointer"
                            >
                                {t(
                                    'event_settings.branding.use_global',
                                    'Use Organization Branding (Recommended)',
                                )}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'event_settings.branding.use_global_desc',
                                    'Inherit logo, colors, and organization info from the Global Branding Center.',
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Always visible Landing Page Links */}
                    <div className="space-y-4 pt-6 border-t">
                        <Label className="text-base font-semibold block mb-2">
                            {t('admin_branding.assets.links_title', 'Landing Page External Links')}
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t(
                                'admin_branding.assets.links_desc',
                                'Configure the destination URLs for the landing page feature boxes.',
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ToggledInputField
                                id="impact"
                                label={t('admin_branding.assets.impact_label')}
                                inputLabel={t('admin_branding.assets.impact_url')}
                                enabledPath="landing.impact.enabled"
                                inputPath="landing.impact.url"
                            />
                            <ToggledInputField
                                id="community"
                                label={t('admin_branding.assets.community_label')}
                                inputLabel={t('admin_branding.assets.community_url')}
                                enabledPath="landing.community.enabled"
                                inputPath="landing.community.url"
                            />
                            <ToggledInputField
                                id="interactive"
                                label={t('admin_branding.assets.interactive_label')}
                                inputLabel={t('admin_branding.assets.interactive_url')}
                                enabledPath="landing.interactive.enabled"
                                inputPath="landing.interactive.url"
                            />
                        </div>
                    </div>

                    {/* Live Page Customization - Always Visible */}
                    <div className="space-y-4 pt-6 border-t">
                        <Label className="text-base font-semibold block mb-2">
                            {t('event_settings.branding.live_page_title', 'Live Page Theme')}
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t(
                                'event_settings.branding.live_page_desc',
                                'Customize the appearance of the real-time donation display.',
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Theme Selection</Label>
                                <Select
                                    onValueChange={(value) => setValue('live.theme', value)}
                                    value={watch('live.theme') || 'classic'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="classic">Classic (Default)</SelectItem>
                                        <SelectItem value="modern">Modern (Bold)</SelectItem>
                                        <SelectItem value="elegant">
                                            Elegant (Gold & Serif)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Custom Branding Fields - Only show if NOT using global */}
                    {!useGlobalBranding && (
                        <div className="space-y-8 pt-6 border-t animate-in fade-in slide-in-from-top-2">
                            {/* Basic Identity */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                                    {t(
                                        'event_settings.branding.identity_assets',
                                        'Identity & Assets',
                                    )}
                                </h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="organization">
                                            {t('event_settings.branding.display_name') ||
                                                'Event Display Title (Override)'}
                                        </Label>
                                        <Input
                                            id="organization"
                                            placeholder="e.g. Annual Charity Gala"
                                            {...register('organization')}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('event_settings.branding.display_name_desc') ||
                                                'Leave empty to use the Event Name.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="logo" className="flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3" /> Logo URL
                                        </Label>
                                        <Input
                                            id="logo"
                                            placeholder="https://..."
                                            {...register('assets.logo')}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="bgLanding"
                                            className="flex items-center gap-2"
                                        >
                                            <ImageIcon className="h-3 w-3" />{' '}
                                            {t(
                                                'event_settings.branding.background_landing',
                                                'Landing Background',
                                            )}
                                        </Label>
                                        <Input
                                            id="bgLanding"
                                            placeholder="https://..."
                                            {...register('assets.backgroundLanding')}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bgLive" className="flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3" />{' '}
                                            {t(
                                                'event_settings.branding.background_live',
                                                'Live Screen Background',
                                            )}
                                        </Label>
                                        <Input
                                            id="bgLive"
                                            placeholder="https://..."
                                            {...register('assets.backgroundLive')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* CSS Variables */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        {t(
                                            'event_settings.branding.theme_overrides',
                                            'Theme Overrides (CSS Variables)',
                                        )}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            append({ key: '--primary', value: '#000000' })
                                        }
                                    >
                                        <Plus className="h-3 w-3 mr-2" />{' '}
                                        {t('common.add_variable', 'Add Variable')}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {fields.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">
                                            {t(
                                                'event_settings.branding.no_overrides',
                                                'No overrides. Click "Add Variable" to customize theme.',
                                            )}
                                        </p>
                                    )}
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-start">
                                            <div className="grid gap-1 flex-1">
                                                <Input
                                                    placeholder="--variable-name"
                                                    {...register(`themeVariables.${index}.key`)}
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-1 flex-1">
                                                <Input
                                                    placeholder="Value (e.g. #ff0000)"
                                                    {...register(`themeVariables.${index}.value`)}
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Communication Overrides */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />{' '}
                                    {t(
                                        'event_settings.branding.communication.title',
                                        'Communication Overrides',
                                    )}
                                </h3>

                                <div className="flex items-center space-x-2 mb-4">
                                    <Checkbox
                                        id="commEnabled"
                                        checked={communicationEnabled}
                                        onCheckedChange={(checked) =>
                                            setValue('communication.enabled', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="commEnabled">
                                        {t(
                                            'event_settings.branding.communication.override_label',
                                            'Override default communication settings',
                                        )}
                                    </Label>
                                </div>

                                {communicationEnabled && (
                                    <div className="grid gap-4 pl-6 border-l-2 border-muted animate-in fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>
                                                    {t(
                                                        'admin_branding.communication.sender_name',
                                                        'Sender Name',
                                                    )}
                                                </Label>
                                                <Input
                                                    {...register('communication.senderName')}
                                                    placeholder={t(
                                                        'admin_branding.communication.sender_name_placeholder',
                                                        'e.g. Gala Team',
                                                    )}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>
                                                    {t(
                                                        'admin_branding.communication.reply_to',
                                                        'Reply-To Email',
                                                    )}
                                                </Label>
                                                <Input
                                                    {...register('communication.replyTo')}
                                                    placeholder="gala@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>
                                                {t(
                                                    'admin_branding.communication.subject_line',
                                                    'Subject Line Prefix',
                                                )}
                                            </Label>
                                            <Input
                                                {...register('communication.subjectLine')}
                                                placeholder={t(
                                                    'admin_branding.communication.subject_line_placeholder',
                                                    'Thanks for attending the Gala!',
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex gap-2 text-yellow-800 text-sm italic">
                                <AlertIcon className="h-4 w-4 shrink-0" />
                                {t(
                                    'event_settings.branding.override_warning',
                                    'These settings will override the organization defaults for this event only.',
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
