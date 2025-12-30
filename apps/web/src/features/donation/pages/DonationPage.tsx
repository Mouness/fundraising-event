import { CheckoutForm } from '../components/CheckoutForm';
import { AppHeader } from '@/components/AppHeader';

export const DonationPage = () => {
    return (
        <div
            className="min-h-screen transition-colors duration-500"
            style={{
                background: 'var(--donation-page-gradient)'
            }}
        >
            <AppHeader />

            <main className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <CheckoutForm />
                </div>
            </main>
        </div>
    );
}
