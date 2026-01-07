/**
 * Supported language codes for the application.
 * This serves as the single source of truth for available translations.
 */
export type SupportedLocale = 'en' | 'fr' | 'de' | 'it';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'fr', 'de', 'it'];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano'
};
