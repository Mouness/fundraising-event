import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Checkbox } from '@core/components/ui/checkbox';

interface ToggledInputFieldProps {
    id: string;
    label: string;
    description?: string;
    inputLabel: string;
    placeholder?: string;
    enabledPath: string;
    inputPath: string;
    type?: string;
}

export const ToggledInputField = ({
    id,
    label,
    inputLabel,
    placeholder = 'https://...',
    enabledPath,
    inputPath,
    type = 'text'
}: ToggledInputFieldProps) => {
    const { t } = useTranslation('common');
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const isEnabled = watch(enabledPath) !== false;

    // Helper to get nested error
    const getNestedError = (path: string) => {
        return path.split('.').reduce((obj, key) => obj?.[key], errors as any);
    };

    const error = getNestedError(inputPath);

    return (
        <div className="space-y-3 p-4 rounded-lg border bg-muted/10">
            <div className="flex items-center justify-between">
                <Label htmlFor={`${id}Enabled`} className="text-xs font-bold uppercase tracking-wider">{label}</Label>
                <Checkbox
                    id={`${id}Enabled`}
                    checked={isEnabled}
                    onCheckedChange={(checked) => setValue(enabledPath, checked as boolean)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id} className="text-xs text-muted-foreground">{inputLabel}</Label>
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    {...register(inputPath)}
                    disabled={!isEnabled}
                    className={error ? 'border-destructive' : ''}
                />
                {error && (
                    <p className="text-[10px] text-destructive font-medium">
                        {error.message || t('validation.invalid_string.url')}
                    </p>
                )}
            </div>
        </div>
    );
};
