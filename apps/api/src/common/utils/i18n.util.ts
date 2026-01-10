import { loadLocales, SupportedLocale, SUPPORTED_LOCALES } from '@fundraising/white-labeling'

export class I18nUtil {
    /**
     * Helper to resolve a nested key in a locale object.
     */
    private static resolveKey(obj: any, path: string): string | undefined {
        return path.split('.').reduce((prev, curr) => prev && prev[curr], obj)
    }

    /**
     * Loads the effective locale data by merging defaults with overrides using the shared library logic.
     */
    static getEffectiveLocaleData(locale: string, overrides?: Record<string, any>): any {
        // We simulate a config object to leverage loadLocales
        // loadLocales merges nested overrides and handles flat keys
        const effectiveLocales = loadLocales(null, { locales: { overrides } })

        const targetLocale = (
            SUPPORTED_LOCALES.includes(locale as SupportedLocale) ? locale : 'en'
        ) as SupportedLocale

        return effectiveLocales[targetLocale]
    }

    /**
     * Translate a key using the provided locale data.
     */
    static t(data: any, key: string, params: Record<string, string | number> = {}): string {
        let value = I18nUtil.resolveKey(data, key)

        if (value === undefined) {
            // Fallback to English if not found in target locale
            const enValue = I18nUtil.resolveKey(loadLocales().en, key)
            value = enValue !== undefined ? enValue : key
        }

        if (typeof value !== 'string') {
            return key
        }

        // Replace params: {{param}}
        return value.replace(/{{(\w+)}}/g, (_, paramKey) => {
            return params[paramKey] !== undefined ? String(params[paramKey]) : `{{${paramKey}}}`
        })
    }
}
