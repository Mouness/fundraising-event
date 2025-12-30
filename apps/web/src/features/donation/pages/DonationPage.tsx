import { CheckoutForm } from '../components/CheckoutForm';
import { useTranslation } from 'react-i18next';
import { useEventConfig } from '../../event/hooks/useEventConfig';

export const DonationPage = () => {
    const { t } = useTranslation('common');
    const { config } = useEventConfig();

    return (
        <div
            className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500"
            style={{
                background: 'var(--background-gradient, var(--background-color, #f8fafc))'
            }}
        >
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center">
                    {config.theme?.assets?.logo && (
                        <div className="mb-6 flex justify-center">
                            <img src={config.theme.assets.logo} alt="Event Logo" className="h-16 w-auto object-contain" />
                        </div>
                    )}
                    <h1 className="text-3xl font-extrabold text-gray-900">{config.content.title || t('donation.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('donation.subtitle')}</p>
                </div>
                <CheckoutForm />
            </div>
        </div>
    );
}
