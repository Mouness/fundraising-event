export const globalSettings = {
    organization: 'Ummah Care Foundation',
    email: 'contact@ummah-care.org',
    phone: '+41 22 555 01 23',
    website: 'https://ummah-care.org',
    address: 'Genève, Suisse',
    live: {
        theme: 'modern',
    },
    theme: {
        variables: {
            '--primary': '#0F5132', // Deep Islamic Green
            '--primary-foreground': '#FFFFFF',
            '--secondary': '#F8F9FA', // Off-white
            '--secondary-foreground': '#1A1A1A',
            '--accent': '#D4AF37', // Gold
            '--accent-foreground': '#1A1A1A',
            '--background': '#FFFFFF',
            '--foreground': '#0F172A',
            '--muted': '#F1F5F9',
            '--muted-foreground': '#64748B',
            '--card': '#FFFFFF',
            '--card-foreground': '#0F172A',
            '--radius': '0.3rem',
        },
        assets: {
            logo: 'https://raw.githubusercontent.com/Mouness/fundraising-event/b3d693251d9b8754a39ebcd494c4432bfbd5c0fc/apps/api/database/mock/scenario/islamic/assets/logo.png',
            favicon:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/b3d693251d9b8754a39ebcd494c4432bfbd5c0fc/apps/api/database/mock/scenario/islamic/assets/favicon.png',
            backgroundLanding:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/b3d693251d9b8754a39ebcd494c4432bfbd5c0fc/apps/api/database/mock/scenario/islamic/assets/landing_pattern_light.jpg',
            backgroundDonor:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/b3d693251d9b8754a39ebcd494c4432bfbd5c0fc/apps/api/database/mock/scenario/islamic/assets/bg_donor.jpg',
            backgroundLive:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/b3d693251d9b8754a39ebcd494c4432bfbd5c0fc/apps/api/database/mock/scenario/islamic/assets/live_elegant.png',
        },
    },
    communication: {
        legalName: 'Ummah Care Foundation',
        address: 'Genève, Suisse',
        supportEmail: 'contact@ummah-care.org',
        website: 'https://ummah-care.org',
        phone: '+41 22 555 01 23',
        taxId: 'CHE-123.456.789',
        signatureText: 'Abdullah Al-Fulan, Director',
        footerText: 'Votre générosité est une lumière. Merci de soutenir notre mission.',
        pdf: {
            enabled: false,
        },
        email: {
            enabled: true,
            senderName: 'Ummah Care Team',
            replyTo: 'donations@ummah-care.org',
            subjectLine: 'Jazak Allah Kheir pour votre don',
        },
    },
    donation: {
        payment: {
            currency: 'EUR',
            provider: 'stripe',
        },
        sharing: {
            enabled: true,
            networks: ['facebook', 'twitter', 'linkedin'],
        },
    },
    locales: {
        default: 'fr',
        supported: ['fr', 'ar', 'en'],
    },
}
