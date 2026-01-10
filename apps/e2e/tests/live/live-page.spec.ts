import { test, expect } from '@playwright/test'

test.describe('Live Event Page', () => {
    const eventSlug = 'ramadan-gala-2025'

    test.beforeEach(async ({ page }) => {
        // Debug logs
        page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`))
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))
        page.on('request', (request) => console.log('REQ >>', request.method(), request.url()))
        page.on('requestfailed', (request) =>
            console.log('REQ FAILED >>', request.url(), request.failure()?.errorText),
        )

        // Catch-all Mocking
        await page.route('**', async (route) => {
            const url = route.request().url()

            // Mock Global Config
            if (url.match(/\/api\/settings\/global/) || url.match(/\/white-labeling\/config/)) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        theme: { variables: {}, assets: {} },
                        donation: { payment: { provider: 'stripe' } },
                        features: {},
                        id: 'global-config',
                    },
                })
                return
            }

            // Mock Event Settings
            if (url.includes(`/api/events/${eventSlug}/settings`)) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        content: {
                            title: 'Grand Gala Ramadan',
                            goalAmount: 500000,
                            landing: { enabled: true },
                        },
                        donation: {
                            enabled: true,
                            payment: { provider: 'stripe' },
                        },
                        live: {
                            theme: 'modern',
                        },
                        theme: {
                            variables: {
                                'primary-color': '#10b981',
                            },
                        },
                        id: 'event-config-1',
                        slug: eventSlug,
                    },
                })
                return
            }

            // Mock Event Entity (Goal, Raised, Donations)
            // This is the CRITICAL mock for initial data load
            if (url.includes(`/api/events/${eventSlug}`) && !url.includes('settings')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        id: '1',
                        name: 'Grand Gala Ramadan',
                        slug: eventSlug,
                        status: 'ACTIVE',
                        goalAmount: 500000,
                        raised: 125000,
                        currency: 'EUR',
                        description: 'Support our cause',
                        donations: [
                            {
                                id: 'd1',
                                amount: 5000,
                                currency: 'EUR',
                                donorName: 'Alice',
                                message: 'Bravo!',
                                createdAt: new Date().toISOString(),
                            },
                            {
                                id: 'd2',
                                amount: 10000,
                                currency: 'EUR',
                                donorName: 'Bob',
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    },
                })
                return
            }

            // Mock Donations Feed (Extra safeguard if code fetches distinct endpoint)
            if (url.includes('/api/donations') && !url.includes('intent')) {
                console.log('MOCKING DONATIONS LIST:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        data: [
                            {
                                id: 'd1',
                                amount: 5000,
                                currency: 'EUR',
                                donorName: 'Alice',
                                message: 'Bravo!',
                                createdAt: new Date().toISOString(),
                            },
                            {
                                id: 'd2',
                                amount: 10000,
                                currency: 'EUR',
                                donorName: 'Bob',
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 2,
                    },
                })
                return
            }

            await route.continue()
        })
    })

    test('should render the live dashboard with correct components', async ({ page }) => {
        await page.goto(`/${eventSlug}/live`)

        // Verify Goal Amount is visible (500,000 from mock)
        // Match 500,000 OR 500 000 OR 500.000, etc.
        await expect(page.getByText(/500[.,\s\u00A0\u202F]*000/i)).toBeVisible()

        // Verify QR Code is present
        await expect(page.locator('svg[viewBox^="0 0"]')).toBeVisible()
    })

    test('should display recent donations', async ({ page }) => {
        await page.goto(`/${eventSlug}/live`)

        // Wait for the feed to load
        await expect(page.getByText('Alice')).toBeVisible()
        await expect(page.getByText('Bravo!')).toBeVisible()
    })
})
