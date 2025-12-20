import { CheckoutForm } from '../components/CheckoutForm';
import { useTranslation } from 'react-i18next';

export function DonationPage() {
    const { t } = useTranslation('common');

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">{t('donation.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('donation.subtitle')}</p>
                </div>
                <CheckoutForm />
            </div>
        </div>
    );
}
