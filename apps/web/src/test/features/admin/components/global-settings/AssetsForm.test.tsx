import { render, screen } from '@testing-library/react';
import { AssetsForm } from '@/features/admin/components/global-settings/AssetsForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            logo: '',
            assets: {
                favicon: '',
                backgroundLanding: '',
                backgroundDonor: '',
                backgroundLive: '',
            },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AssetsForm', () => {
    it('renders assets form fields', () => {
        render(
            <Wrapper>
                <AssetsForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.assets.title')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.logo')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.favicon')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.backgrounds')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.landing')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.donor')).toBeDefined();
        expect(screen.getByText('admin_branding.assets.live')).toBeDefined();
    });
});
