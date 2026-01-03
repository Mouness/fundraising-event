import { BRAND_ASSETS, BRAND_COLORS } from './theme';

export const GLOBAL_SETTINGS = {
    organization: 'Islamic Demo',
    email: 'contact@islamic-demo.org',
    phone: '+41 22 123 45 67',
    website: 'https://islamic-demo.org',
    address: 'Genève, Suisse',
    themeVariables: {
        '--color-primary': BRAND_COLORS.primary,
        '--color-primary-fg': '#FFFFFF',
        '--color-secondary': BRAND_COLORS.secondary,
        '--color-accent': BRAND_COLORS.accent,
        '--color-background': BRAND_COLORS.background,
        '--color-foreground': BRAND_COLORS.text,
        '--radius': '0.5rem',
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '--font-family': '"Inter", sans-serif'
    },
    assets: {
        logo: BRAND_ASSETS.logo,
        favicon: BRAND_ASSETS.favicon,
        backgroundLanding: BRAND_ASSETS.bgLanding,
        backgroundDonor: BRAND_ASSETS.bgDonor,
        backgroundLive: BRAND_ASSETS.bgLive
    },
    communication: {
        footerText: 'Islamic Demo est une organisation de démonstration.',
        emailConfig: {
            senderName: 'Islamic Demo Team',
            replyTo: 'donations@islamic-demo.org',
            subjectLine: 'Merci pour votre don'
        },
        pdf: {
            template: 'formal',
            footer: 'Merci pour votre générosité. Votre don fait la différence.'
        }
    },
    payment: {
        currency: 'CHF',
        provider: 'stripe'
    },
    locales: {
        default: 'fr',
        supported: ['fr', 'de', 'en', 'it'] // Swiss locales
    },
    socialNetwork: {
        facebook: 'https://www.facebook.com/',
        instagram: 'https://www.instagram.com/',
        twitter: 'https://twitter.com/',
        linkedin: 'https://www.linkedin.com/'
    }
};
