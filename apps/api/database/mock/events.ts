export const EVENTS = [
    {
        slug: 'gaza-emergency',
        name: 'Urgence Gaza',
        goalAmount: 500000,
        status: 'active',
        date: new Date('2024-03-10'),
        description: 'Aide d\'urgence pour les familles à Gaza : nourriture, eau et fournitures médicales.',
        config: {
            assets: {
                backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/10c982dfeec35ed87d29b448250fc674c2ddf3dc/apps/api/database/mock/assets/cover_gaza.png'
            },
            themeVariables: {
                '--primary': '#0062A7', // Keep brand blue
                '--accent': '#D32F2F',  // Urgent Red for buttons/highlights
                '--radius': '0rem'            // Sharp corners for serious tone
            },
            form: {
                collectAddress: true,
                collectPhone: true,
                collectCompany: false
            }
        }
    },
    {
        slug: 'ramadan-2024',
        name: 'Campagne Ramadan 2024',
        goalAmount: 250000,
        status: 'active',
        date: new Date('2024-03-11'),
        description: 'Partagez vos bénédictions ce Ramadan. Zakat & Sadaqah.',
        config: {
            assets: {
                backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/10c982dfeec35ed87d29b448250fc674c2ddf3dc/apps/api/database/mock/assets/cover_ramadan.png'
            },
            themeVariables: {
                '--primary': '#B49349', // Goldish
                '--primary-foreground': '#FFFFFF', // White on Gold
                '--secondary': '#F5F5F5', // Light
                '--secondary-foreground': '#1A1A1A',
                '--background': '#FFFFFF', // White Background (Clean)
                '--foreground': '#1A1A1A', // Dark Text (Readable)
                '--card': '#FFFFFF', // White Cards
                '--card-foreground': '#1A1A1A', // Dark Text on Cards
                '--popover': '#FFFFFF',
                '--popover-foreground': '#1A1A1A',
                '--muted': '#F5F5F5',
                '--muted-foreground': '#525252', // Darker gray for muted text
                '--accent': '#F5F5F5',
                '--accent-foreground': '#1A1A1A',
                '--border': '#E5E5E5',
                '--input': '#FFFFFF',
                '--ring': '#B49349',
                '--radius': '1rem', // Soft rounded

                // Live Page Overrides for Contrast
                '--live-page-bg': '#1A1A1A', // Dark Background
                '--live-text-main': '#F5F5F5', // Light Text
                '--live-title-color': '#B49349', // Gold Title
                '--live-subtitle-text': '#FFFFFF', // White subtitle for readability
                '--live-highlight-color': '#FFFFFF', // White highlight URL
                '--live-qr-bg': '#FFFFFF', // White QR Background
                '--live-feed-item-bg': 'rgba(255, 255, 255, 0.1)', // Glassy white feel instead of dark
                '--live-amount-color': '#B49349', // Gold Amount
                '--live-text-secondary': '#FFFFFF', // White "Total Raised" label
                '--live-text-muted': '#E5E5E5', // Light grey "Goal" text for hierarchy
                '--live-badge-bg': 'rgba(255, 255, 255, 0.15)', // More transparent/white
                '--live-badge-border': 'rgba(255, 255, 255, 0.3)',
                '--live-badge-text': '#FFFFFF',
                '--live-gauge-track': 'rgba(255, 255, 255, 0.05)', // More subtle track
                '--live-gauge-from': '#B49349', // Gold
                '--live-gauge-to': '#F5F5F5' // White (instead of Dark) to pop against background
            },
            form: {
                collectAddress: false,
                collectPhone: false
            }
        }
    },
    {
        slug: 'orphelins',
        name: 'Parrainage d\'Orphelins',
        goalAmount: 100000,
        status: 'active',
        date: new Date('2024-06-01'),
        description: 'Offrez un avenir meilleur aux orphelins du monde entier.',
        config: {
            assets: {
                backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/10c982dfeec35ed87d29b448250fc674c2ddf3dc/apps/api/database/mock/assets/cover_orphans.png'
            },
            themeVariables: {
                '--primary': '#0CA678', // Teal/Green for growth/hope
                '--secondary': '#E6FCF5',
                '--radius': '0.75rem'
            },
            form: {
                collectAddress: true,
                collectPhone: true
            }
        }
    }
];
