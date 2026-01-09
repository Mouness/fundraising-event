import { render, screen, fireEvent } from '@testing-library/react';
import { BrandDesignForm } from '@/features/admin/components/global-settings/BrandDesignForm';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

const Wrapper = ({ children, defaultValues }: { children: React.ReactNode, defaultValues?: any }) => {
    const methods = useForm({
        defaultValues: defaultValues || {
            commonVariables: {},
            themeVariables: [],
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('BrandDesignForm', () => {
    it('renders all sections and default variable rows', () => {
        render(
            <Wrapper>
                <BrandDesignForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.theme.colors.title')).toBeDefined();
        expect(screen.getByText('admin_branding.theme.elements.title')).toBeDefined();
        expect(screen.getByText('admin_branding.theme.secondary_colors.title')).toBeDefined();

        const rows = screen.getAllByTestId('variable-row');
        expect(rows.length).toBeGreaterThan(10);
    });

    it('allows adding and removing custom variables', () => {
        render(
            <Wrapper>
                <BrandDesignForm />
            </Wrapper>
        );

        expect(screen.getByText('admin_branding.theme.custom.empty')).toBeDefined();

        const addBtn = screen.getByText('admin_branding.theme.custom.add');
        fireEvent.click(addBtn);

        expect(screen.queryByText('admin_branding.theme.custom.empty')).toBeNull();
        expect(screen.getByPlaceholderText('--custom-var')).toBeDefined();

        const removeBtn = screen.getByLabelText('Remove Custom Variable');
        fireEvent.click(removeBtn);

        expect(screen.getByText('admin_branding.theme.custom.empty')).toBeDefined();
    });
});
