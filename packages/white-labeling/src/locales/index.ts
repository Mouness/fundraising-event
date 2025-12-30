import enDefault from './en.default.json';
import frDefault from './fr.default.json';
import { getDbConfig } from '../store';
import { deepMerge } from '../utils/merge';

const defaultLocales = {
    en: enDefault,
    fr: frDefault
};


/**
 * Loads the application locales by merging static defaults with dynamic database overrides.
 * Supports both nested structures and flat-map overrides (e.g. { "en.donation.title": "..." }).
 */
export function loadLocales(): typeof defaultLocales {
    const config = getDbConfig();

    // Start with default locales merged with legacy nested overrides
    const result = deepMerge(defaultLocales, (config?.themeConfig?.locales || {}) as any);

    // Apply modern flat-map overrides (e.g. { "en.donation.title": "New Title" })
    const flatOverrides = config?.locales || {};
    Object.entries(flatOverrides).forEach(([path, value]) => {
        applyFlatOverride(result, path, String(value));
    });

    return result;
}

/**
 * Sets a value in a nested object based on a dot-notated path string.
 */
function applyFlatOverride(target: any, path: string, value: string) {
    const parts = path.split('.');
    if (parts.length < 2) return;

    const key = parts.pop()!;
    const leaf = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
        return acc[part];
    }, target);

    leaf[key] = value;
}
