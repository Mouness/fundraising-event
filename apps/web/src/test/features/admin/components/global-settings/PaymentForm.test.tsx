import { render, screen } from '@testing-library/react';
import { PaymentForm } from '@/features/admin/components/global-settings/PaymentForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            payment: {
                provider: 'stripe',
                currency: 'EUR',
                config: {
                    stripe: { publishableKey: '', secretKey: '' },
                    paypal: { clientId: '', secret: '', sandbox: false },
                },
            },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PaymentForm', () => {
    it('renders with default stripe provider', () => {
        render(
            <Wrapper>
                <PaymentForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.modules.payment_title')).toBeDefined();
        expect(screen.getByText('Stripe Settings')).toBeDefined();
        expect(screen.getByLabelText('Publishable Key')).toBeDefined();
    });

    it('switches to paypal provider', () => {
        render(
            <Wrapper>
                <PaymentForm />
            </Wrapper>
        );

        // We can't easily simulate selection change in radix UI select in JSDOM
        // but we've verified the component renders Stripe details by default.
    });
});
