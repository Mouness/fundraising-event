export const events = [
    {
        // Case 1: Flagship Event (Rainforest)
        // Theme: Jungle, Deep Green, Modern
        slug: 'save-the-rainforest',
        name: 'Save the Amazon Gala',
        goalAmount: 2500000,
        status: 'active',
        date: new Date('2025-04-22'),
        description: 'Join us for a night of action to protect the lungs of our planet.',
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/rainforest_landing.png',
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/live_global.png',
                },
                variables: {
                    '--primary': '#1B5E20', // Darker Jungle Green
                    '--accent': '#C6FF00', // Lime Green
                    '--live-page-bg': '#000000',
                    '--live-text-main': '#E8F5E9',
                    '--live-text-title': '#FFFFFF',
                    '--live-gauge-from': '#C6FF00',
                    '--live-gauge-to': '#1B5E20',
                },
            },
            donation: {
                form: {
                    address: { enabled: true, required: false },
                    phone: { enabled: false, required: false },
                    company: { enabled: true, required: false },
                },
            },
        },
    },
    {
        // Case 2: Ocean (Water)
        // Theme: Blues, Teals, Elegant Live
        slug: 'ocean-cleanup-2025',
        name: 'Ocean Cleanup Initiative',
        goalAmount: 800000,
        status: 'active',
        date: new Date('2025-06-08'), // Ocean Day
        description: 'Removing 50 tons of plastic from the Pacific Garbage Patch.',
        config: {
            live: {
                theme: 'elegant',
            },
            theme: {
                assets: {
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/ocean_live.jpg',
                },
                variables: {
                    '--primary': '#0288D1', // Ocean Blue
                    '--secondary': '#E0F7FA',
                    '--background': '#F0F9FF',
                    '--live-page-bg': '#083344', // Dark Cyan
                    '--live-elegant-gold': '#22D3EE', // Cyan instead of gold
                    '--live-elegant-amount-color': '#FFFFFF',
                    '--live-text-main': '#F0F9FF', // High contrast light blue
                },
            },
            locales: {
                overrides: {
                    en: { 'live.latest_donations': 'Latest Impacts' },
                    fr: { 'live.latest_donations': 'Derniers Impacts' },
                },
            },
            donation: {
                form: {
                    company: { enabled: true, required: false },
                },
            },
        },
    },
    {
        // Case 3: Tech/Solar (Future)
        // Theme: Yellow/Black, Sharp, High Energy
        slug: 'solar-for-schools',
        name: 'Solar Power for Schools',
        goalAmount: 300000,
        status: 'active',
        date: new Date('2025-09-01'),
        description: 'Empowering the next generation with renewable energy independence.',
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/solar_live.jpg',
                },
                variables: {
                    '--primary': '#e6d079ff', // Yellow
                    '--primary-foreground': '#000000',
                    '--secondary': '#262626', // Dark Grey
                    '--secondary-foreground': '#FFFFFF',
                    '--background': '#171717', // Dark Mode Layout
                    '--foreground': '#FFFFFF',
                    '--radius': '0rem', // Sharp modern look
                    '--live-page-bg': '#000000', // Pitch black
                    '--live-text-title': '#FFFFFF',
                    '--live-text-main': '#FACC15',
                    '--live-status-indicator': '#FACC15',
                },
            },
        },
    },
    {
        // Case 4: Wildlife (Tigers/Rhinos)
        // Theme: Earthy, Brown/Orange, Warm
        slug: 'wildlife-sanctuary',
        name: 'Endangered Species Sanctuary',
        goalAmount: 600000,
        status: 'active',
        date: new Date('2025-10-04'), // Animal Day
        description: "Building safe havens for the world's most vulnerable species.",
        config: {
            live: {
                theme: 'elegant',
            },
            theme: {
                variables: {
                    '--primary': '#78350F', // Brown
                    '--primary-foreground': '#FFFFFF',
                    '--secondary': '#FFEDD5', // Light Orange
                    '--accent': '#F97316', // Orange
                    '--radius': '0.5rem',
                    '--live-page-bg': '#291206', // Dark Brown
                    '--live-elegant-gold': '#F97316', // Orange highlight
                    '--live-text-main': '#FFEDD5', // High contrast light orange
                },
                assets: {
                    backgroundLanding:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/wildlife_landing.jpg',
                },
            },
            donation: {
                form: {
                    phone: { enabled: true, required: false },
                },
            },
        },
    },
    {
        // Case 5: Urban Community (Gardens)
        // Theme: Pastel Green, Soft, Friendly
        slug: 'urban-gardens-city',
        name: 'City Roots: Urban Gardening',
        goalAmount: 40000,
        status: 'active',
        date: new Date('2025-05-15'),
        description: 'Transforming gray rooftops into green community spaces.',
        config: {
            live: {
                theme: 'modern',
            },
            theme: {
                assets: {
                    backgroundLive:
                        'https://raw.githubusercontent.com/Mouness/fundraising-event/117c6ac80414d9f3bfd887dd1d5c31b1d570178b/apps/api/database/mock/scenario/green/assets/urban_live.png',
                },
                variables: {
                    '--primary': '#86EFAC', // Pastel Green
                    '--primary-foreground': '#064E3B',
                    '--secondary': '#F0FDF4',
                    '--background': '#FFFFFF',
                    '--radius': '1.5rem', // Ultra rounded
                    '--live-page-bg': '#ECFCCB', // Lime light bg
                    '--live-text-title': '#FFFFFF',
                    '--live-text-main': '#064E3B',
                    '--live-feed-item-bg': '#FFFFFF',
                },
            },
            donation: {
                form: {
                    phone: { enabled: true, required: false },
                },
            },
        },
    },
]
