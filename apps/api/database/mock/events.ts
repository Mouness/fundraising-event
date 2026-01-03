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
                '--primary-foreground': '#000000', // Black text on Gold
                '--secondary': '#1A1A1A', // Dark Night
                '--secondary-foreground': '#F5F5F5',
                '--background': '#3B3B3B', // Dark mode feel
                '--foreground': '#F5F5F5',
                '--card': '#454545', // Slightly lighter than background
                '--card-foreground': '#F5F5F5',
                '--popover': '#3B3B3B',
                '--popover-foreground': '#F5F5F5',
                '--muted': '#282828',
                '--muted-foreground': '#A3A3A3',
                '--accent': '#525252',
                '--accent-foreground': '#F5F5F5',
                '--border': '#575757',
                '--input': '#575757',
                '--ring': '#B49349',
                '--radius': '1rem' // Soft rounded
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
