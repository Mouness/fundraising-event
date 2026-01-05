import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Button } from '@core/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { VariableRow } from './VariableRow';


export const BrandDesignForm = () => {
    const { t } = useTranslation();
    const { control, register, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: "themeVariables" });

    return (
        <div className="space-y-6">
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_branding.theme.colors.title')}</CardTitle>
                    <CardDescription>{t('admin_branding.theme.colors.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1 max-w-xl">
                        <VariableRow label={t('admin_branding.theme.colors.primary')} name="commonVariables.primary" />
                        <VariableRow label={t('admin_branding.theme.colors.primary_fg')} name="commonVariables.primaryForeground" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.colors.background')} name="commonVariables.background" />
                        <VariableRow label={t('admin_branding.theme.colors.foreground')} name="commonVariables.foreground" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.colors.card')} name="commonVariables.card" />
                        <VariableRow label={t('admin_branding.theme.colors.card_fg')} name="commonVariables.cardForeground" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.colors.muted')} name="commonVariables.muted" />
                        <VariableRow label={t('admin_branding.theme.colors.muted_fg')} name="commonVariables.mutedForeground" />
                    </div>
                </CardContent>
            </Card>

            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_branding.theme.elements.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1 max-w-xl">
                        <VariableRow label={t('admin_branding.theme.elements.border')} name="commonVariables.border" />
                        <VariableRow label={t('admin_branding.theme.elements.input')} name="commonVariables.input" />
                        <VariableRow label={t('admin_branding.theme.elements.ring')} name="commonVariables.ring" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.elements.radius')} name="commonVariables.radius" type="radius" />
                    </div>
                </CardContent>
            </Card>

            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_branding.theme.secondary_colors.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1 max-w-xl">
                        <VariableRow label={t('admin_branding.theme.secondary_colors.secondary')} name="commonVariables.secondary" />
                        <VariableRow label={t('admin_branding.theme.secondary_colors.secondary_fg')} name="commonVariables.secondaryForeground" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.secondary_colors.accent')} name="commonVariables.accent" />
                        <VariableRow label={t('admin_branding.theme.secondary_colors.accent_fg')} name="commonVariables.accentForeground" />
                        <div className="h-4" />
                        <VariableRow label={t('admin_branding.theme.secondary_colors.destructive')} name="commonVariables.destructive" />
                        <VariableRow label={t('admin_branding.theme.secondary_colors.destructive_fg')} name="commonVariables.destructiveForeground" />
                    </div>
                </CardContent>
            </Card>

            {/* Custom Variables Section (Manual Entry Only) */}
            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('admin_branding.theme.custom.title')}</CardTitle>
                            <CardDescription>{t('admin_branding.theme.custom.description')}</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ key: '--', value: '' })}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('admin_branding.theme.custom.add')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-start bg-muted/20 p-2 rounded-md">
                                <div className="grid gap-1 flex-1">
                                    <Label className="text-xs text-muted-foreground">{t('admin_branding.theme.custom.name')}</Label>
                                    <Input {...register(`themeVariables.${index}.key`)} placeholder="--custom-var" className="font-mono text-sm" />
                                </div>
                                <div className="grid gap-1 flex-1">
                                    <Label className="text-xs text-muted-foreground">{t('admin_branding.theme.custom.value')}</Label>
                                    <div className="flex items-center gap-2">
                                        <VariableRow
                                            label=""
                                            name={`themeVariables.${index}.value`}
                                            type={watch(`themeVariables.${index}.key`)?.includes('color') ? 'color' : 'text'}
                                        />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="mt-6 h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-sm text-muted-foreground italic py-4 text-center border-2 border-dashed rounded-md">
                                {t('admin_branding.theme.custom.empty')}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
