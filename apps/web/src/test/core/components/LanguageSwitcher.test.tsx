import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/core/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

describe('LanguageSwitcher', () => {
    const mockChangeLanguage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useTranslation as any).mockReturnValue({
            t: (k: string) => k,
            i18n: {
                language: 'en',
                changeLanguage: mockChangeLanguage,
            },
        });
    });

    it('renders with current language', () => {
        render(<LanguageSwitcher />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('en');
    });

    it('calls changeLanguage when selection changes', () => {
        render(<LanguageSwitcher />);
        const select = screen.getByRole('combobox');

        fireEvent.change(select, { target: { value: 'fr' } });

        expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
    });
});
