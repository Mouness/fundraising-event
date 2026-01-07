import { render, screen } from '@testing-library/react';
import { AssetsForm } from '@/features/admin/components/global-settings/AssetsForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

const Wrapper = ({ children, defaultValues }: { children: React.ReactNode, defaultValues?: any }) => {
    const methods = useForm({
        defaultValues: defaultValues || {
            logo: 'logo.png',
            assets: { favicon: 'favicon.ico', landing: '', donor: '', live: '' },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('AssetsForm', () => {
    it('renders and displays default values', () => {
        render(
            <Wrapper>
                <AssetsForm />
            </Wrapper>
        );

        expect(screen.getByLabelText('admin_branding.assets.logo')).toHaveValue('logo.png');
        expect(screen.getByLabelText('admin_branding.assets.favicon')).toHaveValue('favicon.ico');
        expect(screen.getByLabelText('admin_branding.assets.landing')).toBeDefined();
    });
});
