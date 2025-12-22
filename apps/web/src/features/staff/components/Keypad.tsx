import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface KeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onClear: () => void;
    disabled?: boolean;
}

export const Keypad = ({ onKeyPress, onDelete, onClear, disabled }: KeypadProps) => {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4">
            {keys.map((key) => (
                <Button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    disabled={disabled}
                    variant="outline"
                    className="h-16 text-2xl font-semibold active:scale-95 transition-transform bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white"
                >
                    {key}
                </Button>
            ))}
            <Button
                onClick={onDelete}
                disabled={disabled}
                variant="destructive"
                className="h-16 flex items-center justify-center active:scale-95 transition-transform bg-red-500 hover:bg-red-600 text-white border border-red-600"
            >
                <ArrowLeft className="w-8 h-8" />
            </Button>
            <Button
                onClick={onClear}
                disabled={disabled}
                variant="outline"
                className="col-span-3 h-12 text-muted-foreground uppercase tracking-widest text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white"
            >
                Clear
            </Button>
        </div>
    );
};
