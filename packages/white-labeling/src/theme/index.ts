import { getGlobalConfig, getEventConfig } from '../store';

/**
 * Loads and optionally applies DB-overridden CSS variables.
 * @param apply If true, applies variables to document root.
 */
export function loadTheme(apply = false): Record<string, string> {
    const globalTheme = getGlobalConfig()?.theme?.variables || {};
    const eventTheme = getEventConfig()?.theme?.variables || {};

    const variables = { ...globalTheme, ...eventTheme };

    if (apply && variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            if (value) root.style.setProperty(key, String(value));
        });
    }

    return variables;
}
