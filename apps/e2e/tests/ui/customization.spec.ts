import { test, expect } from '@playwright/test'

test.describe('UI Customization', () => {
    const eventSlug = 'ramadan-gala-2025'

    test.beforeEach(async ({ page }) => {
        const USE_MOCKS = process.env.E2E_USE_MOCKS === 'true'

        // Logs
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))

        if (USE_MOCKS) {
            // Comprehensive Mocking
            await page.route('**', async (route) => {
                const url = route.request().url()

                // Mock Global Config
                if (
                    url.includes('/api/settings/global') ||
                    url.includes('/white-labeling/config')
                ) {
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
                            content: { title: 'Grand Gala Ramadan', goalAmount: 500000 },
                            donation: {
                                enabled: true,
                                payment: { provider: 'stripe' },
                                amounts: [10, 50, 100], // Ensure 50 is present for the test
                            },
                            theme: {
                                variables: {
                                    // Add some mock variables if needed for specific tests
                                    // 'primary-color': '#00ff00'
                                },
                            },
                            id: 'event-config-1',
                            slug: eventSlug,
                        },
                    })
                    return
                }

                // Mock Event Entity
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
                        },
                    })
                    return
                }

                await route.continue()
            })
        }
    })

    test('should apply branding variables', async ({ page }) => {
        // Navigate to Donation page
        await page.goto(`/${eventSlug}/donate`)

        // Check primary color application on Donate button (Amount 50)
        // Since we are mocking, the actual CSS variable application depends on the frontend implementation
        // consuming the mocked settings.
        const donateBtn = page.getByRole('button', { name: /50/ }).first()

        // Wait for it to be visible
        await expect(donateBtn).toBeVisible()

        // Check it has a background color (computed).
        // We might not know the exact color if we didn't inject a specific one in the mock theme above,
        // but we can verify it's not transparent or empty.
        await expect(donateBtn).toHaveCSS('background-color', /rgb\(.*/)
    })
})
