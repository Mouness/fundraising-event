import { render, screen, fireEvent } from '@testing-library/react'
import { LocalizationForm } from '@/features/admin/components/global-settings/LocalizationForm'
import { useForm, FormProvider } from 'react-hook-form'
import { describe, it, expect, vi } from 'vitest'

const Wrapper = ({
    children,
    defaultValues,
}: {
    children: React.ReactNode
    defaultValues?: any
}) => {
    const methods = useForm({
        defaultValues: defaultValues || {
            locales: { supported: ['en'] },
        },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('LocalizationForm', () => {
    it('renders and allows toggling supported languages', () => {
        const setLocaleOverrides = vi.fn()
        render(
            <Wrapper>
                <LocalizationForm localeOverrides={[]} setLocaleOverrides={setLocaleOverrides} />
            </Wrapper>,
        )

        expect(screen.getByText('English')).toBeDefined()
        expect(screen.getByText('Français')).toBeDefined()

        // Toggling French
        const frBtn = screen.getByText('Français')
        fireEvent.click(frBtn)
        // We can't easily check the form state here without deeper access,
        // but we can check if it doesn't crash.
    })

    it('adds a new locale override', () => {
        const setLocaleOverrides = vi.fn()
        render(
            <Wrapper>
                <LocalizationForm localeOverrides={[]} setLocaleOverrides={setLocaleOverrides} />
            </Wrapper>,
        )

        const keyInput = screen.getByPlaceholderText('admin_branding.localization.key_placeholder')
        fireEvent.change(keyInput, { target: { value: 'new.key' } })

        const addButton = screen.getByLabelText('Add Override')
        fireEvent.click(addButton)

        expect(setLocaleOverrides).toHaveBeenCalledWith([
            { key: 'new.key', value: '', locale: 'en' },
        ])
    })

    it('updates and removes existing overrides', () => {
        const setLocaleOverrides = vi.fn()
        const overrides = [{ key: 'existing.key', value: 'Hello', locale: 'en' }]
        render(
            <Wrapper>
                <LocalizationForm
                    localeOverrides={overrides}
                    setLocaleOverrides={setLocaleOverrides}
                />
            </Wrapper>,
        )

        const input = screen.getByDisplayValue('Hello')
        fireEvent.change(input, { target: { value: 'Bonjour' } })
        expect(setLocaleOverrides).toHaveBeenCalledWith([
            { key: 'existing.key', value: 'Bonjour', locale: 'en' },
        ])

        const removeBtn = screen.getByLabelText('Remove Override')
        fireEvent.click(removeBtn)
        expect(setLocaleOverrides).toHaveBeenCalledWith([])
    })
})
