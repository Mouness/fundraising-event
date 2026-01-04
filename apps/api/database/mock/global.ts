import { BRAND_ASSETS, BRAND_COLORS } from './theme';

export const GLOBAL_SETTINGS = {
    organization: 'Islamic Demo',
    email: 'contact@islamic-demo.org',
    phone: '+41 22 123 45 67',
    website: 'https://islamic-demo.org',
    address: 'Genève, Suisse',
    themeVariables: {
        // Base Colors
        '--primary': BRAND_COLORS.primary,        // #0062A7 (Blue)
        '--primary-foreground': '#FFFFFF',
        '--secondary': BRAND_COLORS.secondary,    // #EDEDED (Light Gray)
        '--secondary-foreground': '#1A1A1A',
        '--accent': BRAND_COLORS.accent,          // #FDB913 (Gold)
        '--accent-foreground': '#1A1A1A',
        '--destructive': '#ef4444',
        '--destructive-foreground': '#FFFFFF',

        // Background / Foreground
        '--background': BRAND_COLORS.background,
        '--foreground': BRAND_COLORS.text,

        // UI Elements
        '--muted': '#f1f5f9',
        '--muted-foreground': '#64748b',
        '--card': '#FFFFFF',
        '--card-foreground': '#1A1A1A',
        '--popover': '#FFFFFF',
        '--popover-foreground': '#1A1A1A',
        '--border': '#e2e8f0',
        '--input': '#e2e8f0',
        '--ring': BRAND_COLORS.primary,           // Ring matches primary

        // Radii
        '--radius': '0.5rem',
        '--radius-sm': '0.3rem',
        '--radius-lg': '0.7rem'
    },

    assets: {
        logo: BRAND_ASSETS.logoIcon,
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
        currency: 'EUR',
        provider: 'stripe'
    },
    locales: {
        default: 'fr',
        supported: ['fr', 'de', 'en', 'it']
    },
    socialNetwork: {
        facebook: 'https://www.facebook.com/',
        instagram: 'https://www.instagram.com/',
        twitter: 'https://twitter.com/',
        linkedin: 'https://www.linkedin.com/'
    }
};
