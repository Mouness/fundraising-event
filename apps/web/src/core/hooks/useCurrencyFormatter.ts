import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { useCallback } from 'react';

export const useCurrencyFormatter = () => {
    const { i18n } = useTranslation();
    const { config } = useAppConfig();
    const currency = config?.donation?.payment?.currency || 'EUR';

    const formatCurrency = useCallback((amount: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0, // Default to no cents for cleaner look
            ...options
        }).format(amount);
    }, [i18n.language, currency]);

    return { formatCurrency, currency };
};
