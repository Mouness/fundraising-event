import { render, screen } from '@testing-library/react';
import { CommunicationForm } from '@/features/admin/components/global-settings/CommunicationForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

const Wrapper = ({ children, defaultValues }: { children: React.ReactNode, defaultValues?: any }) => {
    const methods = useForm({
        defaultValues: defaultValues || {
            email: 'test@example.com',
            phone: '123456',
            address: 'Main St',
            emailReceipt: { enabled: false },
            pdfReceipt: { enabled: false },
            sharing: { enabled: false, networks: [] },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('CommunicationForm', () => {
    it('renders contact points', () => {
        render(
            <Wrapper>
                <CommunicationForm />
            </Wrapper>
        );

        expect(screen.getByLabelText('admin_branding.communication.contact.email')).toHaveValue('test@example.com');
        expect(screen.getByLabelText('admin_branding.communication.contact.phone')).toHaveValue('123456');
        expect(screen.getByLabelText('admin_branding.communication.contact.address')).toHaveValue('Main St');
    });

    it('shows email settings when enabled', () => {
        render(
            <Wrapper defaultValues={{ emailReceipt: { enabled: true } }}>
                <CommunicationForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.email.sender')).toBeDefined();
    });

    it('shows pdf settings when enabled', () => {
        render(
            <Wrapper defaultValues={{ pdfReceipt: { enabled: true } }}>
                <CommunicationForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.receipts.footer_text')).toBeDefined();
    });

    it('shows sharing settings when enabled', () => {
        render(
            <Wrapper defaultValues={{ sharing: { enabled: true, networks: ['facebook'] } }}>
                <CommunicationForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.communication.sharing.networks')).toBeDefined();
        // Checkbox for facebook should be checked - finding by role and checking state
        const fbCheckbox = screen.getByRole('checkbox', { name: /admin_branding.communication.sharing.facebook/i });
        expect(fbCheckbox.getAttribute('data-state')).toBe('checked');
    });
});
