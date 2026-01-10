// Types
export type { DeepPartial } from './types'
export type {
    EventConfig,
    ThemeConfig,
    ContentConfig,
    LiveConfig,
    DonationFormFieldConfig,
    SharingConfig,
    PaymentConfig,
    DonationConfig,
    PdfConfig,
    EmailConfig,
    CommunicationConfig,
    LocalesConfig,
    StripeProviderConfig,
    PayPalProviderConfig,
    SupportedLocale,
} from './types'

export { SUPPORTED_LOCALES, LOCALE_LABELS } from './types'

export {
    initWhiteLabeling,
    getGlobalConfig,
    getEventConfig,
    fetchGlobalConfig,
    fetchEventConfig,
    resetWhiteLabelStore,
} from './store'

// Loaders
export { loadAssets } from './assets'
export { loadConfigs, defaultConfig } from './config'
export { loadLocales } from './locales'
export { loadTheme } from './theme'

// Utils
export { deepMerge } from './utils/merge'
