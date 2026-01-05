import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Button } from '@core/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select';
import { useTranslation } from 'react-i18next';

const CLIENT_LOCALE_GROUPS = {
    'en': 'English',
    'fr': 'Français'
};

interface LocalizationFormProps {
    localeOverrides: { key: string, value: string, locale: string }[];
    setLocaleOverrides: (val: { key: string, value: string, locale: string }[]) => void;
}

export const LocalizationForm = ({ localeOverrides, setLocaleOverrides }: LocalizationFormProps) => {
    const { t } = useTranslation();
    const { watch, setValue } = useFormContext();
    const [selectedLocale, setSelectedLocale] = useState('en');
    const [newLabelKey, setNewLabelKey] = useState('');

    const supportedLocales = watch('locales.supported') || [];

    const addLocaleOverride = () => {
        if (!newLabelKey || !selectedLocale) return;
        setLocaleOverrides([...localeOverrides, { key: newLabelKey, value: '', locale: selectedLocale }]);
        setNewLabelKey('');
    };

    const removeLocaleField = (idx: number) => {
        const newItems = [...localeOverrides];
        newItems.splice(idx, 1);
        setLocaleOverrides(newItems);
    };

    const updateLocaleField = (idx: number, val: string) => {
        const newItems = [...localeOverrides];
        newItems[idx].value = val;
        setLocaleOverrides(newItems);
    };

    const filteredOverrides = localeOverrides.filter(l => l.locale === selectedLocale);

    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('admin_branding.localization.title')}</CardTitle>
                <CardDescription>{t('admin_branding.localization.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-8">
                    {/* Supported Languages */}
                    <div>
                        <Label className="mb-4 block font-medium">{t('admin_branding.localization.supported_languages')}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {Object.entries(CLIENT_LOCALE_GROUPS).map(([code, name]) => {
                                const isSelected = supportedLocales.includes(code);
                                return (
                                    <div
                                        key={code}
                                        onClick={() => {
                                            const current = [...supportedLocales];
                                            let next = current;
                                            if (isSelected) {
                                                if (current.length > 1) { // Prevent deselecting all
                                                    next = current.filter((c: string) => c !== code);
                                                }
                                            } else {
                                                next = [...current, code];
                                            }
                                            if (next !== current) {
                                                setValue('locales.supported', next, { shouldDirty: true, shouldTouch: true });
                                            }
                                        }}
                                        className={`cursor-pointer rounded-md border px-3 py-2 flex items-center justify-center text-center transition-all text-sm font-medium ${isSelected
                                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                                            : 'bg-background hover:bg-muted hover:border-muted-foreground/50'
                                            }`}
                                    >
                                        {name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Label Overrides */}
                    <div className="space-y-4">
                        <Label className="font-medium">{t('admin_branding.localization.label_overrides')}</Label>

                        {/* Controls */}
                        <div className="flex gap-2 p-3 border rounded-md bg-muted/5 items-end">
                            <div className="grid gap-1.5 flex-1">
                                <Label className="text-xs text-muted-foreground">{t('admin_branding.localization.language')}</Label>
                                <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(CLIENT_LOCALE_GROUPS).map(code => (
                                            <SelectItem key={code} value={code}>{code.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5 flex-[1.5]">
                                <Label className="text-xs text-muted-foreground">{t('admin_branding.localization.key')}</Label>
                                <Input
                                    value={newLabelKey}
                                    onChange={(e) => setNewLabelKey(e.target.value)}
                                    placeholder={t('admin_branding.localization.key_placeholder')}
                                    className="h-8 text-xs bg-background"
                                />
                            </div>
                            <Button type="button" size="sm" onClick={addLocaleOverride} className="h-8 px-3">
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
                            {filteredOverrides.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm italic">
                                    {t('admin_branding.localization.no_overrides', { locale: selectedLocale.toUpperCase() })}
                                </div>
                            )}
                            {localeOverrides.map((item, idx) => {
                                if (item.locale !== selectedLocale) return null;
                                return (
                                    <div key={idx} className="flex gap-2 items-center bg-muted/10 p-2 rounded border border-transparent hover:border-border transition-colors">
                                        <div className="flex-1 grid gap-1">
                                            <span className="text-[10px] font-mono text-muted-foreground truncate" title={item.key}>{item.key}</span>
                                            <Input
                                                value={item.value}
                                                onChange={(e) => updateLocaleField(idx, e.target.value)}
                                                className="h-7 text-xs"
                                                placeholder={t('admin_branding.localization.translation')}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeLocaleField(idx)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
