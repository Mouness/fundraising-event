import { Button } from "@core/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface KeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onClear: () => void;
    disabled?: boolean;
}

export const Keypad = ({ onKeyPress, onDelete, onClear, disabled }: KeypadProps) => {
    const { t } = useTranslation('common');
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

    return (
        <div
            className="grid grid-cols-3 w-full max-w-sm mx-auto p-4"
            style={{ gap: 'var(--staff-keypad-gap)' }}
        >
            {keys.map((key) => (
                <Button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    disabled={disabled}
                    variant="outline"
                    className="text-2xl font-semibold active:scale-95 transition-transform"
                    style={{
                        height: 'var(--staff-keypad-button-height)',
                        backgroundColor: 'var(--staff-keypad-button-bg)',
                        borderColor: 'var(--staff-display-border)',
                        boxShadow: 'inset 0 1px 0 var(--staff-keypad-shadow)',
                        color: 'var(--staff-keypad-button-text)'
                    }}
                >
                    {key}
                </Button>
            ))}
            <Button
                onClick={onDelete}
                disabled={disabled}
                variant="destructive"
                className="flex items-center justify-center active:scale-95 transition-transform text-white border"
                style={{
                    height: 'var(--staff-keypad-button-height)',
                    backgroundColor: 'var(--staff-keypad-delete-bg)',
                    borderColor: 'var(--staff-keypad-delete-hover)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--staff-keypad-delete-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--staff-keypad-delete-bg)'}
            >
                <ArrowLeft className="w-8 h-8" />
            </Button>
            <Button
                onClick={onClear}
                disabled={disabled}
                variant="outline"
                className="col-span-3 h-12 uppercase tracking-widest text-sm hover:opacity-80"
                style={{ backgroundColor: 'var(--staff-keypad-button-bg)', borderColor: 'var(--staff-display-border)', color: 'var(--staff-keypad-button-text)' }}
            >
                {t('staff.keypad.clear')}
            </Button>
        </div >
    );
};
