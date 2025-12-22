import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, ScrollText, Wallet } from "lucide-react";

import type { DonationType } from "../types";

interface DonationTypeSelectorProps {
    value: DonationType;
    onChange: (type: DonationType) => void;
    disabled?: boolean;
}

export const DonationTypeSelector = ({ value, onChange, disabled }: DonationTypeSelectorProps) => {
    const types: { id: DonationType; label: string; icon: React.ElementType }[] = [
        { id: 'cash', label: 'Cash', icon: Banknote },
        { id: 'check', label: 'Check', icon: ScrollText },
        { id: 'pledge', label: 'Pledge', icon: Wallet },
        { id: 'other', label: 'Other', icon: CreditCard },
    ];

    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto px-4 mb-4">
            {types.map(({ id, label, icon: Icon }) => (
                <Button
                    key={id}
                    onClick={() => onChange(id)}
                    disabled={disabled}
                    variant={value === id ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center h-20 gap-1 ${value === id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--text-inverse)] ring-2 ring-offset-2 ring-[var(--primary)]"
                        : "text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white"
                        }`}
                >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{label}</span>
                </Button>
            ))}
        </div>
    );
};
