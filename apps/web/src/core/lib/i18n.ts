import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { loadLocales } from '@fundraising/white-labeling'

const locales = loadLocales()

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: locales.en },
            fr: { common: locales.fr },
            de: { common: locales.de },
            it: { common: locales.it },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common'],
        debug: true, // import.meta.env.DEV

        interpolation: {
            escapeValue: false,
        },
    })

/**
 * Re-syncs i18n resources from the white-labeling package.
 * This should be called after initWhiteLabeling() to apply dynamic overrides.
 */
export const syncLocales = () => {
    const locales = loadLocales()
    Object.entries(locales).forEach(([lng, resources]) => {
        i18n.addResourceBundle(lng, 'common', resources, true, true)
    })
}

export default i18n
