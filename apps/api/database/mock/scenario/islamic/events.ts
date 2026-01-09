export const events = [
    {
        // Case 1: Standard Modern Event (Ramadan)
        // Theme: Green/Gold/Night
        slug: 'ramadan-gala-2025',
        name: 'Grand Gala Ramadan 2025',
        goalAmount: 500000,
        status: 'active',
        date: new Date('2025-03-15'),
        description:
            'Une soirée de partage et de générosité pour soutenir nos actions à travers le monde.',
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/cover_ramadan.jpg',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/live_modern_abstract.jpg',
                },
                variables: {
                    '--primary': '#14532D', // Darker Green
                    '--accent': '#F59E0B', // Amber/Gold
                    '--live-page-bg': '#020617', // Very dark night blue
                    '--live-title-color': '#FCD34D', // Gold text
                    '--live-amount-color': '#FCD34D',
                    '--live-gauge-from': '#FCD34D',
                    '--live-gauge-to': '#14532D',
                },
            },
            donation: {
                form: {
                    address: { enabled: true, required: false },
                    phone: { enabled: true, required: false },
                },
                sharing: {
                    enabled: true,
                    networks: ['facebook', 'twitter', 'linkedin'],
                },
            },
        },
    },
    {
        // Case 2: Vibrant Festival (Eid)
        // Theme: Bright, Pink/Purple/Teal, Rounded
        slug: 'eid-festival-gift',
        name: "Cadeaux de l'Aïd pour Tous",
        goalAmount: 150000,
        status: 'active',
        date: new Date('2025-04-10'),
        description:
            'Offrez un sourire à un orphelin ce jour de fête. Jouets, vêtements et friandises.',
        config: {
            live: {
                theme: 'elegant',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/cover_orphans.jpg',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/live_elegant.jpg',
                },
                variables: {
                    '--primary': '#DB2777', // Pink/Magenta
                    '--primary-foreground': '#FFFFFF',
                    '--secondary': '#FCE7F3', // Light pink
                    '--accent': '#2DD4BF', // Teal accent
                    '--radius': '1rem', // Very rounded
                    '--live-page-bg': '#500724', // Dark Pink bg
                    '--live-text-main': '#FCE7F3',
                    '--live-amount-color': '#FFFFFF',
                },
            },
            donation: {
                form: {
                    address: { enabled: false, required: false },
                    phone: { enabled: false, required: false },
                    company: { enabled: false, required: false },
                },
            },
        },
    },
    {
        // Case 3: Emergency (Gaza/Earthquake etc)
        // Theme: Red/Black/White, Sharp, High Contrast
        slug: 'emergency-relief',
        name: 'URGENCE: Fonds de Secours',
        goalAmount: 1000000,
        status: 'active',
        date: new Date('2024-12-01'),
        description:
            "Aide médicale et alimentaire d'urgence. Situation critique. Agissez maintenant.",
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/cover_gaza.jpg',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/bg_live.jpg',
                },
                variables: {
                    '--primary': '#DC2626', // Urgent Red
                    '--primary-foreground': '#FFFFFF',
                    '--secondary': '#171717', // Black
                    '--secondary-foreground': '#FFFFFF',
                    '--background': '#000000', // Black bg landing
                    '--foreground': '#FFFFFF', // White text
                    '--radius': '0rem', // Sharp edges
                    '--accent': '#FFFFFF',
                    '--live-page-bg': '#000000',
                    '--live-text-main': '#FFFFFF',
                    '--live-amount-color': '#DC2626',
                },
            },
            donation: {
                form: {
                    address: { enabled: true, required: false },
                    phone: { enabled: true, required: false },
                    company: { enabled: true, required: false },
                },
                payment: {
                    currency: 'USD',
                },
            },
        },
    },
    {
        // Case 4: Formal/Corporate (Waqf/Building)
        // Theme: Navy/Grey, Minimal, Serif fonts maybe?
        slug: 'education-center-waqf',
        name: 'Waqf: Centre Éducatif',
        goalAmount: 2000000,
        status: 'active',
        date: new Date('2025-06-01'),
        description: "Une aumône perpétuelle. Participez à la construction de l'avenir.",
        config: {
            live: {
                theme: 'elegant',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/cover_orphans.jpg',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/live_waqf.jpg',
                },
                variables: {
                    '--primary': '#1E293B', // Slate 800
                    '--primary-foreground': '#F8FAFC',
                    '--secondary': '#CBD5E1', // Slate 300
                    '--radius': '0.2rem', // Small radius
                    '--live-page-bg': '#0F172A', // Slate 900
                    '--live-elegant-gold': '#94A3B8', // Silver instead of gold
                    '--live-text-main': '#F8FAFC',
                },
            },
            communication: {
                footerText: 'Waqf Shares Certificate - Ummah Care',
                pdf: {
                    enabled: true,
                },
            },
            locales: {
                overrides: {
                    fr: {
                        'donations.title': 'Parts de Waqf',
                        'common.total': 'Total Investi',
                    },
                    en: {
                        'donations.title': 'Waqf Shares',
                    },
                },
            },
            donation: {
                form: {
                    company: { enabled: true, required: false },
                    address: { enabled: true, required: false },
                },
            },
        },
    },
    {
        // Case 5: Community (Water/Wells)
        // Theme: Blue/Cyan, Soft, Trustworthy
        slug: 'clean-water-project',
        name: 'Projet Eau Potable',
        goalAmount: 30000,
        status: 'active',
        date: new Date('2025-08-15'),
        description: "L'eau c'est la vie. 100% de votre don va au projet.",
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/cover_water.jpg',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/922f8f190722f5ad863851273beaa50efe8aca55/apps/api/database/mock/scenario/islamic/assets/bg_live_clean.jpg',
                },
                variables: {
                    '--primary': '#0284C7', // Sky Blue
                    '--secondary': '#E0F2FE',
                    '--radius': '0.75rem',
                    '--live-page-bg': '#0C4A6E', // Dark Sky
                    '--live-gauge-from': '#38BDF8',
                    '--live-gauge-to': '#0284C7',
                    '--live-text-main': '#E0F2FE',
                },
            },
            donation: {
                payment: {
                    currency: 'GBP',
                },
            },
        },
    },
]
