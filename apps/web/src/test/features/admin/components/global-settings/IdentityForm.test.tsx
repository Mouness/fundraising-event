import { render, screen } from '@testing-library/react';
import { IdentityForm } from '@/features/admin/components/global-settings/IdentityForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            organization: '',
            website: '',
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('IdentityForm', () => {
    it('renders identity form fields', () => {
        render(
            <Wrapper>
                <IdentityForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.identity.title')).toBeDefined();
        expect(screen.getByText('admin_branding.identity.org_name')).toBeDefined();
        expect(screen.getByText('admin_branding.identity.website')).toBeDefined();
        expect(screen.getByPlaceholderText('admin_branding.identity.org_placeholder')).toBeDefined();
    });
});
