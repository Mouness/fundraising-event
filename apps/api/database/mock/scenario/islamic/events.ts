export const events = [
    {
        // Case 1: Standard Modern Event (Ramadan)
        // Theme: Green/Gold/Night
        slug: 'ramadan-gala-2025',
        name: 'Grand Gala Ramadan 2025',
        goalAmount: 500000,
        status: 'active',
        date: new Date('2025-03-15'),
        description: 'Une soirée de partage et de générosité pour soutenir nos actions à travers le monde.',
        config: {
            liveTheme: 'modern',
            assets: {
                backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/landing_pattern.png',
                backgroundLive: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/live_modern.png' // Custom Modern BG Use
            },
            themeVariables: {
                '--primary': '#14532D', // Darker Green
                '--accent': '#F59E0B',  // Amber/Gold
                '--live-page-bg': '#020617', // Very dark night blue
                '--live-title-color': '#FCD34D', // Gold text
                '--live-amount-color': '#FCD34D',
                '--live-gauge-from': '#FCD34D',
                '--live-gauge-to': '#14532D'
            },
            form: {
                collectAddress: true,
                collectPhone: true
            },
            socialNetwork: {
                twitter: 'https://x.com/ummahcare' // Override adds twitter
            }
        }
    },
    {
        // Case 2: Vibrant Festival (Eid)
        // Theme: Bright, Pink/Purple/Teal, Rounded
        slug: 'eid-festival-gift',
        name: 'Cadeaux de l\'Aïd pour Tous',
        goalAmount: 150000,
        status: 'active',
        date: new Date('2025-04-10'),
        description: 'Offrez un sourire à un orphelin ce jour de fête. Jouets, vêtements et friandises.',
        config: {
            liveTheme: 'elegant', // Elegant theme for festival
            assets: {
                backgroundLanding: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/live_elegant.png', // Using elegant bg for landing too
                backgroundLive: 'https://raw.githubusercontent.com/Mouness/fundraising-event/0c4d6ab03605d8f54812b7e5e57f14c2f5cc5414/apps/api/database/mock/scenario/islamic/assets/live_elegant.png' // Custom Elegant BG Use
            },
            themeVariables: {
                '--primary': '#DB2777', // Pink/Magenta
                '--primary-foreground': '#FFFFFF',
                '--secondary': '#FCE7F3', // Light pink
                '--accent': '#2DD4BF', // Teal accent
                '--radius': '1rem', // Very rounded
                '--live-page-bg': '#500724', // Dark Pink bg
                '--live-text-main': '#FCE7F3',
                '--live-amount-color': '#FFFFFF'
            },
            form: {
                collectAddress: false, // Simple flow
                collectPhone: false,
                collectCompany: false
            }
        }
    },
    {
        // Case 3: Emergency (Gaza/Earthquake etc)
        // Theme: Red/Black/White, Sharp, High Contrast
        slug: 'emergency-relief',
        name: 'URGENCE: Fonds de Secours',
        goalAmount: 1000000,
        status: 'active', // Highly active
        date: new Date('2024-12-01'),
        description: 'Aide médicale et alimentaire d\'urgence. Situation critique. Agissez maintenant.',
        config: {
            liveTheme: 'modern',
            assets: {
                backgroundLanding: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop' // Rubble/Hands
            },
            themeVariables: {
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
                '--live-amount-color': '#DC2626'
            },
            form: {
                collectAddress: true, // Need mostly email/amount
                collectPhone: true,
                collectCompany: true // Corporate matching
            },
            payment: {
                currency: 'USD' // International aid
            }
        }
    },
    {
        // Case 4: Formal/Corporate (Waqf/Building)
        // Theme: Navy/Grey, Minimal, Serif fonts maybe?
        slug: 'education-center-waqf',
        name: 'Waqf: Centre Éducatif',
        goalAmount: 2000000,
        status: 'active',
        date: new Date('2025-06-01'),
        description: 'Une aumône perpétuelle. Participez à la construction de l\'avenir.',
        config: {
            liveTheme: 'elegant', // Elegant suits corporate
            themeVariables: {
                '--primary': '#1E293B', // Slate 800
                '--primary-foreground': '#F8FAFC',
                '--secondary': '#CBD5E1', // Slate 300
                '--radius': '0.2rem', // Small radius
                '--live-page-bg': '#0F172A', // Slate 900
                '--live-elegant-gold': '#94A3B8', // Silver instead of gold
                '--live-text-main': '#F8FAFC' // High contrast white slate
            },
            communication: {
                pdf: {
                    template: 'formal',
                    footer: 'Waqf Shares Certificate - Ummah Care'
                }
            },
            locales: {
                overrides: [
                    { locale: 'fr', key: 'donations.title', value: 'Parts de Waqf' },
                    { locale: 'en', key: 'donations.title', value: 'Waqf Shares' },
                    { locale: 'fr', key: 'common.total', value: 'Total Investi' }
                ]
            },
            form: {
                collectCompany: true,
                collectAddress: true
            }
        }
    },
    {
        // Case 5: Community (Water/Wells)
        // Theme: Blue/Cyan, Soft, Trustworthy
        slug: 'clean-water-project',
        name: 'Projet Eau Potable',
        goalAmount: 30000,
        status: 'active',
        date: new Date('2025-08-15'),
        description: 'L\'eau c\'est la vie. 100% de votre don va au projet.',
        config: {
            liveTheme: 'live-theme-modern',
            themeVariables: {
                '--primary': '#0284C7', // Sky Blue
                '--secondary': '#E0F2FE',
                '--radius': '0.75rem',
                '--live-page-bg': '#0C4A6E', // Dark Sky
                '--live-gauge-from': '#38BDF8',
                '--live-gauge-to': '#0284C7',
                '--live-text-main': '#E0F2FE' // High contrast light blue
            },
            payment: {
                currency: 'GBP' // UK base support
            }
        }
    }
];
