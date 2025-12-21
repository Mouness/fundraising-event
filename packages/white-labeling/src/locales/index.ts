import enDefault from './en.default.json';
import frDefault from './fr.default.json';
import { deepMerge } from '../utils/merge';

export const defaultLocales = {
    en: enDefault,
    fr: frDefault
};

export type LocaleKey = keyof typeof defaultLocales;
export type TranslationResource = typeof enDefault;

import { DeepPartial } from '../types';

/**
 * Merges a custom translation resource with the default for a given locale.
 * @param locale 'en' | 'fr'
 * @param customTranslations Partial translation object
 * @returns Merged translation object
 */
export function mergeLocales(locale: LocaleKey, customTranslations?: DeepPartial<TranslationResource>): TranslationResource {
    const base = defaultLocales[locale];
    if (!customTranslations) return base;
    return deepMerge(base, customTranslations);
}

