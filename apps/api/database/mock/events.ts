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
                backgroundLanding: 'http/todo/cover_gaza.png'
            },
            themeVariables: {
                '--color-primary': '#0062A7', // Keep brand blue
                '--color-accent': '#D32F2F',  // Urgent Red for buttons/highlights
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
                backgroundLanding: 'http/todo/cover_ramadan.png'
            },
            themeVariables: {
                '--color-primary': '#B49349', // Goldish
                '--color-secondary': '#1A1A1A', // Dark Night
                '--color-background': '#121212', // Dark mode feel
                '--color-foreground': '#F5F5F5',
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
                backgroundLanding: 'http/todo/cover_orphans.png'
            },
            themeVariables: {
                '--color-primary': '#0CA678', // Teal/Green for growth/hope
                '--color-secondary': '#E6FCF5',
                '--radius': '0.75rem'
            },
            form: {
                collectAddress: true,
                collectPhone: true
            }
        }
    }
];
