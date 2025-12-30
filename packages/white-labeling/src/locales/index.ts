import enDefault from './en.default.json';
import frDefault from './fr.default.json';
import { getDbConfig } from '../store';
import { deepMerge } from '../utils/merge';

const defaultLocales = {
    en: enDefault,
    fr: frDefault
};


/**
 * Loads the application locales.
 * Currently returns embedded defaults.
 * Future: Merge with database overrides if 'locales' support is added to EventConfig.
 */
export function loadLocales(): typeof defaultLocales {
    const dbLocales = getDbConfig()?.themeConfig?.locales || {};
    return deepMerge(defaultLocales, dbLocales);
}
