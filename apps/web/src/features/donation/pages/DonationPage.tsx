import { useAppConfig } from '@core/providers/AppConfigProvider';
import { CheckoutForm } from '../components/CheckoutForm';
import { AppHeader } from '@core/components/AppHeader';

export const DonationPage = () => {
    const { config } = useAppConfig();
    const bgImage = config.theme?.assets?.backgroundDonor;

    return (
        <div
            className="min-h-screen transition-colors duration-500 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundColor: 'var(--background)', // Fallback
            }}
        >
            {/* Overlay for readability if image exists */}
            {bgImage && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-0" />}

            <div className="relative z-10">
                <AppHeader />
                <main className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <CheckoutForm />
                    </div>
                </main>
            </div>
        </div>
    );
}
