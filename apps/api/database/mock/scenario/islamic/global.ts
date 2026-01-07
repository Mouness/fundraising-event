export const globalSettings = {
    organization: 'Ummah Care Foundation',
    email: 'contact@ummah-care.org',
    phone: '+41 22 555 01 23',
    website: 'https://ummah-care.org',
    address: 'Genève, Suisse',
    liveTheme: 'modern',
    themeVariables: {
        '--primary': '#0F5132',        // Deep Islamic Green
        '--primary-foreground': '#FFFFFF',
        '--secondary': '#F8F9FA',      // Off-white
        '--secondary-foreground': '#1A1A1A',
        '--accent': '#D4AF37',         // Gold
        '--accent-foreground': '#1A1A1A',
        '--background': '#FFFFFF',
        '--foreground': '#0F172A',
        '--muted': '#F1F5F9',
        '--muted-foreground': '#64748B',
        '--card': '#FFFFFF',
        '--card-foreground': '#0F172A',
        '--radius': '0.3rem'
    },
    assets: {
        logo: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/logo.png',
        favicon: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/favicon.png',
        backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/landing_pattern.png',
        backgroundDonor: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/landing_pattern.png',
        backgroundLive: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/live_elegant.png'
    },
    communication: {
        footerText: 'Ummah Care Foundation est une organisation à but non lucratif enregistrée.',
        emailConfig: {
            senderName: 'Ummah Care Team',
            replyTo: 'donations@ummah-care.org',
            subjectLine: 'Jazak Allah Khair pour votre don'
        },
        pdf: {
            template: 'formal',
            footer: 'Votre générosité est une lumière. Merci de soutenir notre mission.'
        }
    },
    payment: {
        currency: 'EUR',
        provider: 'stripe'
    },
    locales: {
        default: 'fr',
        supported: ['fr', 'ar', 'en']
    },
    socialNetwork: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com'
    }
};
