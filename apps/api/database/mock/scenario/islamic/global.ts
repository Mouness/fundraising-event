export const globalSettings = {
    organization: 'Ummah Care Foundation',
    email: 'contact@ummah-care.org',
    phone: '+41 22 555 01 23',
    website: 'https://ummah-care.org',
    address: 'Genève, Suisse',
    liveTheme: 'live-theme-modern',
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
        logo: '/mock-assets/logo.png',
        favicon: '/mock-assets/favicon.png',
        backgroundLanding: '/mock-assets/landing_pattern.png',
        backgroundDonor: '/mock-assets/cover_orphans.png',
        backgroundLive: '/mock-assets/cover_gaza.png'
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
