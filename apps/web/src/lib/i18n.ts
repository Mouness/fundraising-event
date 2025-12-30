import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { loadLocales } from '@fundraising/white-labeling';

const locales = loadLocales();

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: locales.en },
            fr: { common: locales.fr }
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common'],
        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
