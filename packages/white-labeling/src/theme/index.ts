import { getGlobalConfig, getEventConfig } from '../store';

/**
 * Loads and optionally applies DB-overridden CSS variables.
 * @param apply If true, applies variables to document root.
 */
let appliedThemeKeys: string[] = [];

export function loadTheme(apply = false): Record<string, string> {
    const globalTheme = getGlobalConfig()?.theme?.variables || {};
    const eventTheme = getEventConfig()?.theme?.variables || {};

    const variables = { ...globalTheme, ...eventTheme };

    if (apply) {
        const root = document.documentElement;

        // 1. Clear previously applied keys to restore CSS defaults
        appliedThemeKeys.forEach(key => root.style.removeProperty(key));
        appliedThemeKeys = [];

        // 2. Apply new keys if they exist
        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                if (value) {
                    root.style.setProperty(key, String(value));
                    appliedThemeKeys.push(key);
                }
            });
        }
    }

    return variables;
}
