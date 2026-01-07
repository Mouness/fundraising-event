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
            liveTheme: 'live-theme-modern',
            assets: {
                backgroundLanding: '/mock-assets/rainforest_landing.png'
            },
            themeVariables: {
                '--primary': '#1B5E20', // Darker Jungle Green
                '--accent': '#C6FF00',  // Lime Green
                '--live-page-bg': '#000000',
                '--live-text-main': '#E8F5E9',
                '--live-gauge-from': '#C6FF00',
                '--live-gauge-to': '#1B5E20'
            },
            form: {
                collectAddress: true,
                collectPhone: false,
                collectCompany: true
            }
        }
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
            liveTheme: 'live-theme-elegant',
            assets: {
                backgroundLive: '/mock-assets/ocean_live.png'
            },
            themeVariables: {
                '--primary': '#0288D1', // Ocean Blue
                '--secondary': '#E0F7FA',
                '--background': '#F0F9FF',
                '--live-page-bg': '#083344', // Dark Cyan
                '--live-elegant-gold': '#22D3EE', // Cyan instead of gold
                '--live-elegant-amount-color': '#FFFFFF'
            },
            locales: {
                overrides: [
                    { locale: 'en', key: 'live.latest_donations', value: 'Latest Impacts' },
                    { locale: 'fr', key: 'live.latest_donations', value: 'Derniers Impacts' }
                ]
            },
            form: {
                collectCompany: true // Corporate sponsors
            }
        }
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
            liveTheme: 'live-theme-modern',
            assets: {
                backgroundLive: '/mock-assets/solar_live.png'
            },
            themeVariables: {
                '--primary': '#FACC15', // Yellow
                '--primary-foreground': '#000000',
                '--secondary': '#262626', // Dark Grey
                '--secondary-foreground': '#FFFFFF',
                '--background': '#171717', // Dark Mode Layout
                '--foreground': '#FFFFFF',
                '--radius': '0rem', // Sharp modern look
                '--live-page-bg': '#000000', // Pitch black
                '--live-text-main': '#FACC15',
                '--live-status-indicator': '#FACC15'
            },
            payment: {
                currency: 'USD'
            }
        }
    },
    {
        // Case 4: Wildlife (Tigers/Rhinos)
        // Theme: Earthy, Brown/Orange, Warm
        slug: 'wildlife-sanctuary',
        name: 'Endangered Species Sanctuary',
        goalAmount: 600000,
        status: 'active',
        date: new Date('2025-10-04'), // Animal Day
        description: 'Building safe havens for the world\'s most vulnerable species.',
        config: {
            liveTheme: 'live-theme-elegant',
            themeVariables: {
                '--primary': '#78350F', // Brown
                '--primary-foreground': '#FFFFFF',
                '--secondary': '#FFEDD5', // Light Orange
                '--accent': '#F97316', // Orange
                '--radius': '0.5rem',
                '--live-page-bg': '#291206', // Dark Brown
                '--live-elegant-gold': '#F97316' // Orange highlight
            },
            assets: {
                backgroundLanding: '/mock-assets/wildlife_landing.png'
            }
        }
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
            liveTheme: 'live-theme-modern',
            assets: {
                backgroundLive: '/mock-assets/urban_live.png'
            },
            themeVariables: {
                '--primary': '#86EFAC', // Pastel Green
                '--primary-foreground': '#064E3B',
                '--secondary': '#F0FDF4',
                '--background': '#FFFFFF',
                '--radius': '1.5rem', // Ultra rounded
                '--live-page-bg': '#ECFCCB', // Lime light bg
                '--live-text-main': '#064E3B',
                '--live-feed-item-bg': '#FFFFFF'
            },
            form: {
                collectPhone: true // Coordinating volunteers
            }
        }
    }
];
