import { render, screen } from '@testing-library/react';
import { ReceiptForm } from '@/features/admin/components/global-settings/ReceiptForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

const Wrapper = ({ children, defaultValues }: { children: React.ReactNode, defaultValues?: any }) => {
    const methods = useForm({
        defaultValues: defaultValues || {
            emailReceipt: { enabled: false, provider: 'console', config: { smtp: {} } },
            pdfReceipt: { enabled: false },
            footerText: '',
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
    Trans: ({ children }: any) => children,
}));

describe('ReceiptForm', () => {
    it('renders toggles initially', () => {
        render(
            <Wrapper>
                <ReceiptForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.receipts.title')).toBeDefined();
        expect(screen.getByText('admin_branding.communication.email.enable')).toBeDefined();
        expect(screen.getByText('admin_branding.communication.pdf.enable')).toBeDefined();
    });

    it('shows footer text field when enabled', () => {
        render(
            <Wrapper defaultValues={{ emailReceipt: { enabled: true } }}>
                <ReceiptForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.receipts.footer_text')).toBeDefined();
    });

    it('shows email settings when email is enabled', () => {
        render(
            <Wrapper defaultValues={{ emailReceipt: { enabled: true, provider: 'smtp', config: { smtp: {} } } }}>
                <ReceiptForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.email.config_title')).toBeDefined();
        // Check for SMTP fields
        expect(screen.getByText('admin_branding.communication.email.smtp.title')).toBeDefined();
        expect(screen.getByText('admin_branding.communication.email.smtp.host')).toBeDefined();
    });
});
