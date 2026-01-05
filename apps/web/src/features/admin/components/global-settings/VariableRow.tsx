import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { useFormContext } from 'react-hook-form';

interface VariableRowProps {
    label: string;
    name: string;
    type?: 'color' | 'radius' | 'text';
}

export const VariableRow = ({ label, name, type = 'color' }: VariableRowProps) => {
    const { register, watch } = useFormContext();
    const value = watch(name);

    return (
        <div className="flex items-center gap-4 mb-2">
            <Label className="w-40 shrink-0 text-right font-medium text-sm text-muted-foreground">{label}</Label>
            <Input {...register(name)} className="flex-1 font-mono h-9 text-xs" />

            {/* Preview Box */}
            <div className="w-9 h-9 shrink-0 border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center relative shadow-sm">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

                {/* Color Preview */}
                {type === 'color' && (
                    <div className="w-full h-full transition-colors" style={{ backgroundColor: value }} />
                )}

                {/* Radius Preview */}
                {type === 'radius' && (
                    <div className="w-6 h-6 border-2 border-foreground/80 bg-background shadow-sm"
                        style={{ borderRadius: value || '0' }} />
                )}

                {/* Text/Font Preview */}
                {type === 'text' && (
                    <span className="text-foreground font-medium text-xs" style={{ fontSize: value }}>Aa</span>
                )}
            </div>
        </div>
    );
};
