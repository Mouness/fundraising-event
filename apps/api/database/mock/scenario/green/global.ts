export const globalSettings = {
    organization: 'TerraGuardians',
    email: 'hello@terra-guardians.org',
    phone: '+41 22 999 00 00',
    website: 'https://terra-guardians.org',
    address: 'Zürich, Switzerland',
    live: {
        theme: 'modern',
    },
    theme: {
        variables: {
            '--primary': '#2E7D32', // Forest Green
            '--primary-foreground': '#FFFFFF',
            '--secondary': '#E8F5E9', // Light Green
            '--secondary-foreground': '#1B5E20',
            '--accent': '#81C784', // Light accent
            '--accent-foreground': '#000000',
            '--background': '#FAFAFA',
            '--foreground': '#262626',
            '--muted': '#F5F5F5',
            '--muted-foreground': '#757575',
            '--card': '#FFFFFF',
            '--card-foreground': '#262626',
            '--radius': '0.75rem', // Soft organic feel
        },
        assets: {
            logo: 'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/green/assets/logo.png',
            favicon:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/green/assets/favicon.png',
            backgroundLanding:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/green/assets/landing_global.jpg',
            backgroundDonor:
                'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/green/assets/donor_bg.jpg',
        },
    },
    communication: {
        legalName: 'TerraGuardians',
        address: 'Zürich, Switzerland',
        supportEmail: 'hello@terra-guardians.org',
        website: 'https://terra-guardians.org',
        phone: '+41 22 999 00 00',
        taxId: '12-3456789',
        signatureText: 'Jane Doe, Executive Director',
        footerText: 'Every donation plants a seed of hope.',
        pdf: {
            enabled: true,
        },
        email: {
            enabled: true,
            senderName: 'TerraGuardians HQ',
            replyTo: 'support@terra-guardians.org',
            subjectLine: 'Thank you for standing with nature',
        },
    },
    donation: {
        payment: {
            currency: 'CHF',
            provider: 'stripe',
        },
        sharing: {
            enabled: true,
            networks: ['facebook', 'twitter', 'linkedin'],
        },
    },
    locales: {
        default: 'en',
        supported: ['en', 'de', 'fr'],
    },
}
