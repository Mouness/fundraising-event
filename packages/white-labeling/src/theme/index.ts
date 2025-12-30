import { getDbConfig } from '../store';

/**
 * Loads and optionally applies DB-overridden CSS variables.
 * @param apply If true, applies variables to document root.
 */
export function loadTheme(apply = false): Record<string, string> {
    const variables = getDbConfig()?.themeConfig?.variables || {};

    if (apply && variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            if (value) root.style.setProperty(key, String(value));
        });
    }

    return variables;
}
