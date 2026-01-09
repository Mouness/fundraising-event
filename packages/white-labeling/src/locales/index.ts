import enDefault from './en.default.json';
import frDefault from './fr.default.json';
import deDefault from './de.default.json';
import itDefault from './it.default.json';
import { getGlobalConfig, getEventConfig } from '../store';
import { deepMerge } from '../utils/merge';
import { EventConfig, DeepPartial } from '../types';

import { SupportedLocale } from '../types/locales';

export const defaultLocales: Record<SupportedLocale, any> = {
    en: enDefault,
    fr: frDefault,
    de: deDefault,
    it: itDefault
};

/**
 * Sets a value in a nested object based on a dot-notated path string.
 */
const applyFlatOverride = (target: any, path: string, value: string) => {
    const parts = path.split('.');
    if (parts.length < 2) return;

    const key = parts.pop()!;
    const leaf = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
        return acc[part];
    }, target);

    leaf[key] = value;
}

/**
 * Merges overrides and applies flat dot-notation keys.
 */
const processOverrides = (base: any, overrides: any) => {
    // 1. Deep merge to handle nested objects
    const result = deepMerge(base, overrides);

    // 2. Scan for dot-notation keys
    Object.keys(overrides).forEach(key => {
        if (key.includes('.')) {
            // Top-level flat override (e.g. "en.auth.title")
            applyFlatOverride(result, key, String(overrides[key]));
        } else if (typeof overrides[key] === 'object') {
            // Nested flat override (e.g. en: { "auth.title": "..." })
            const nested = overrides[key] as Record<string, string>;
            Object.keys(nested).forEach(nestedKey => {
                if (nestedKey.includes('.')) {
                    applyFlatOverride(result, `${key}.${nestedKey}`, String(nested[nestedKey]));
                }
            });
        }
    });

    return result;
}

/**
 * Loads the application locales by merging static defaults with dynamic database overrides.
 * Supports both nested structures and flat-map overrides (e.g. { "en.donation.title": "..." }).
 */
export const loadLocales = (
    providedGlobalConfig?: DeepPartial<EventConfig> | null,
    providedEventConfig?: DeepPartial<EventConfig> | null
): typeof defaultLocales => {
    const globalConfig = providedGlobalConfig ?? getGlobalConfig();
    const eventConfig = providedEventConfig ?? getEventConfig();

    // 1. Defaults
    let result = defaultLocales;

    // 2. Global Overrides (Nested Structure + Flat Map)
    if (globalConfig?.locales?.overrides) {
        result = processOverrides(result, globalConfig.locales.overrides);
    }

    // 3. Event Overrides (Nested Structure + Flat Map)
    if (eventConfig?.locales?.overrides) {
        result = processOverrides(result, eventConfig.locales.overrides);
    }

    return result;
}
