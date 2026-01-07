import { render, screen } from '@testing-library/react';
import { IdentityForm } from '@/features/admin/components/global-settings/IdentityForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            organization: 'My Org',
            website: 'https://example.com',
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('IdentityForm', () => {
    it('renders with values from form context', () => {
        render(
            <Wrapper>
                <IdentityForm />
            </Wrapper>
        );

        expect(screen.getByLabelText('admin_branding.identity.org_name')).toHaveValue('My Org');
        expect(screen.getByLabelText('admin_branding.identity.website')).toHaveValue('https://example.com');
    });
});
