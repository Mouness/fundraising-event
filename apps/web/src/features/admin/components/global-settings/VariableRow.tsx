import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { useFormContext } from 'react-hook-form'
import { VariablePreview } from './VariablePreview'
import type { VariableType } from '../../utils/theme-utils'

interface VariableRowProps {
    label: string
    name: string
    type?: VariableType
    hideLabel?: boolean
    className?: string
    variableKey?: string
}

export const VariableRow = ({
    label,
    name,
    type = 'color',
    hideLabel = false,
    className,
    variableKey,
}: VariableRowProps) => {
    const { register, watch } = useFormContext()
    const value = watch(name)

    return (
        <div
            data-testid="variable-row"
            className={`group flex items-center gap-4 mb-2 ${className || ''}`}
        >
            {!hideLabel && (
                <div className="w-40 shrink-0 text-right flex flex-col items-end justify-center">
                    <Label className="font-medium text-sm text-muted-foreground leading-tight">
                        {label}
                    </Label>
                    {variableKey && (
                        <span
                            className="text-[10px] text-muted-foreground/60 font-mono transition-all"
                            title={variableKey}
                        >
                            {variableKey}
                        </span>
                    )}
                </div>
            )}

            <div className="flex-1 relative group/input">
                <Input {...register(name)} className="font-mono h-9 text-xs" title={variableKey} />
            </div>

            <VariablePreview value={value} type={type} />
        </div>
    )
}
