import type { VariableType } from '../../utils/theme-utils';

interface VariablePreviewProps {
    value: string;
    type: VariableType;
}

export const VariablePreview = ({ value, type }: VariablePreviewProps) => {
    if (type === 'none') return null;

    return (
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
    );
};
