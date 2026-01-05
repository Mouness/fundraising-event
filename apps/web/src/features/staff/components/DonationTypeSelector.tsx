import { Button } from "@core/components/ui/button";
import { Banknote, CreditCard, ScrollText, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { DonationType } from "../types";

interface DonationTypeSelectorProps {
    value: DonationType;
    onChange: (type: DonationType) => void;
    disabled?: boolean;
}

export const DonationTypeSelector = ({ value, onChange, disabled }: DonationTypeSelectorProps) => {
    const { t } = useTranslation('common');

    const types: { id: DonationType; label: string; icon: React.ElementType }[] = [
        { id: 'cash', label: t('staff.type.cash', 'Cash'), icon: Banknote },
        { id: 'check', label: t('staff.type.check', 'Check'), icon: ScrollText },
        { id: 'pledge', label: t('staff.type.pledge', 'Pledge'), icon: Wallet },
        { id: 'other', label: t('staff.type.other', 'Other'), icon: CreditCard },
    ];

    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto px-4 mb-4">
            {types.map(({ id, label, icon: Icon }) => {
                const isSelected = value === id;
                return (
                    <Button
                        key={id}
                        onClick={() => onChange(id)}
                        disabled={disabled}
                        variant={isSelected ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-20 gap-1"
                        style={isSelected ? {
                            backgroundColor: 'var(--staff-type-button-selected-bg)',
                            color: 'var(--staff-type-button-selected-text)',
                            borderColor: 'var(--staff-type-button-selected-bg)',
                        } : {
                            backgroundColor: 'var(--staff-type-button-bg)',
                            color: 'var(--staff-type-button-text)',
                            borderColor: 'var(--staff-type-button-border)',
                        }}
                    >
                        <Icon
                            className="w-6 h-6"
                            style={{ color: isSelected ? 'var(--staff-type-button-selected-icon)' : 'var(--staff-type-button-icon-color)' }}
                        />
                        <span className="text-xs font-medium">{label}</span>
                    </Button>
                );
            })}
        </div>
    );
};
