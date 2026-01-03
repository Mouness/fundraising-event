import enDefault from './en.default.json';
import frDefault from './fr.default.json';
import { getGlobalConfig, getEventConfig } from '../store';
import { deepMerge } from '../utils/merge';

import { SupportedLocale } from '../types/locales';

const defaultLocales: Record<SupportedLocale, any> = {
    en: enDefault,
    fr: frDefault
};


/**
 * Loads the application locales by merging static defaults with dynamic database overrides.
 * Supports both nested structures and flat-map overrides (e.g. { "en.donation.title": "..." }).
 */
export function loadLocales(): typeof defaultLocales {
    const globalConfig = getGlobalConfig();
    const eventConfig = getEventConfig();

    // 1. Defaults
    let result = defaultLocales;

    // 2. Global Overrides (Nested Structure + Flat Map)
    if (globalConfig?.locales?.overrides) {
        // First, deep merge to handle nested objects (e.g. { en: { ... } })
        result = deepMerge(result, globalConfig.locales.overrides);

        // Then, scan for dot-notation keys to handle flat overrides
        Object.keys(globalConfig.locales.overrides).forEach(key => {
            if (key.includes('.')) {
                applyFlatOverride(result, key, String(globalConfig.locales!.overrides![key]));
            }
        });
    }

    // 3. Event Overrides (Nested Structure + Flat Map)
    if (eventConfig?.locales?.overrides) {
        result = deepMerge(result, eventConfig.locales.overrides);

        Object.keys(eventConfig.locales.overrides).forEach(key => {
            if (key.includes('.')) {
                applyFlatOverride(result, key, String(eventConfig.locales!.overrides![key]));
            }
        });
    }

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
