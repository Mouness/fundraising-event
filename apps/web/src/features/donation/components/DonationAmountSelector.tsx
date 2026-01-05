import { Button } from '@core/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/card';
import { Input } from '@core/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { DonationFormValues } from '../schemas/donation.schema';

interface DonationAmountSelectorProps {
    selectedAmount: number;
    onAmountSelect: (amount: number) => void;
    register: UseFormRegister<DonationFormValues>;
    errors: FieldErrors<DonationFormValues>;
    setValue: UseFormSetValue<DonationFormValues>;
}

export const DonationAmountSelector = ({
    selectedAmount,
    onAmountSelect,
    register,
    errors
}: DonationAmountSelectorProps) => {
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrencyFormatter();

    const glassCardClass = "backdrop-blur-md border shadow-xl overflow-hidden";
    const glassCardStyle = { backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(var(--glass-blur))' };

    return (
        <Card className={glassCardClass} style={glassCardStyle}>
            <CardHeader>
                <CardTitle className="text-xl text-gray-800">{t('donation.amount')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {[10, 20, 50, 100].map((amt) => (
                        <Button
                            key={amt}
                            type="button"
                            variant={selectedAmount === amt ? 'default' : 'outline'}
                            onClick={() => onAmountSelect(amt)}
                            className={`h-12 text-lg transition-all ${selectedAmount === amt ? 'shadow-lg scale-105' : 'hover:opacity-90'}`}
                            style={{
                                backgroundColor: selectedAmount === amt ? 'var(--donation-amount-button-selected-bg)' : 'var(--donation-amount-button-bg)',
                                color: selectedAmount === amt ? 'var(--donation-amount-button-selected-text)' : 'var(--donation-amount-button-text)',
                                borderColor: selectedAmount !== amt ? 'var(--donation-input-border)' : 'transparent'
                            }}
                        >
                            {formatCurrency(amt)}
                        </Button>
                    ))}
                    <div className="col-span-2 relative">
                        <Input
                            type="number"
                            placeholder={t('donation.custom_amount')}
                            {...(() => {
                                const { onChange, ...rest } = register('amount', { valueAsNumber: true });
                                return {
                                    ...rest,
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                        onChange(e);
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) onAmountSelect(val);
                                    }
                                };
                            })()}
                            className="h-12 transition-colors"
                            style={{
                                backgroundColor: 'var(--donation-input-bg)',
                                color: 'var(--donation-input-text)',
                                borderColor: 'var(--donation-input-border)'
                            }}
                        />
                    </div>
                </div>
                {errors.amount && <p className="text-sm text-red-500 font-medium">{errors.amount.message}</p>}
            </CardContent>
        </Card>
    );
};
