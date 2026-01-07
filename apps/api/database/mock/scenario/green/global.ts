export const globalSettings = {
    organization: 'TerraGuardians',
    email: 'hello@terra-guardians.org',
    phone: '+41 22 999 00 00',
    website: 'https://terra-guardians.org',
    address: 'Zürich, Switzerland',
    liveTheme: 'modern',
    themeVariables: {
        '--primary': '#2E7D32',        // Forest Green
        '--primary-foreground': '#FFFFFF',
        '--secondary': '#E8F5E9',      // Light Green
        '--secondary-foreground': '#1B5E20',
        '--accent': '#81C784',         // Light accent
        '--accent-foreground': '#000000',
        '--background': '#FAFAFA',
        '--foreground': '#262626',
        '--muted': '#F5F5F5',
        '--muted-foreground': '#757575',
        '--card': '#FFFFFF',
        '--card-foreground': '#262626',
        '--radius': '0.75rem' // Soft organic feel
    },
    assets: {
        logo: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/green/assets/logo.png',
        favicon: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/green/assets/favicon.png',
        backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/green/assets/landing_global.png'
    },
    communication: {
        footerText: 'TerraGuardians - Protecting our planet for future generations.',
        emailConfig: {
            senderName: 'TerraGuardians HQ',
            replyTo: 'support@terra-guardians.org',
            subjectLine: 'Thank you for standing with nature'
        },
        pdf: {
            template: 'minimal',
            footer: 'Every donation plants a seed of hope.'
        }
    },
    payment: {
        currency: 'CHF',
        provider: 'stripe'
    },
    locales: {
        default: 'en',
        supported: ['en', 'de', 'fr']
    }
};
