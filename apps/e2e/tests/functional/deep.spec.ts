import { test, expect } from '@playwright/test'

test.describe('Deep Functional & Integrations', () => {
    test.beforeEach(async ({ page }) => {
        // Debug
        page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`))
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))
        page.on('request', (request) => console.log('REQ >>', request.method(), request.url()))

        // Catch-all Mocking
        await page.route('**', async (route) => {
            const url = route.request().url()

            // Mock Global Config
            if (url.includes('/api/settings/global') || url.includes('/white-labeling/config')) {
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
            if (url.includes('/api/events/ramadan-gala-2025/settings')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        content: {
                            title: 'Grand Gala Ramadan',
                            goalAmount: 500000,
                            landing: {
                                impact: {
                                    enabled: true,
                                    title: 'Impact',
                                    description: 'Our impact',
                                },
                                community: {
                                    enabled: true,
                                    title: 'Community',
                                    description: 'Our community',
                                },
                                interactive: {
                                    enabled: true,
                                    title: 'Interactive',
                                    description: 'Interactive features',
                                },
                            },
                        },
                        donation: {
                            enabled: true,
                            payment: { provider: 'stripe' },
                            amounts: [10, 20, 50, 100],
                        },
                        theme: {
                            variables: {
                                'primary-color': '#10b981',
                            },
                        },
                        id: 'event-config-1',
                        slug: 'ramadan-gala-2025',
                    },
                })
                return
            }

            // Mock Event Details
            if (url.includes('/api/events/ramadan-gala-2025') && !url.includes('settings')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        id: '1',
                        name: 'Grand Gala Ramadan',
                        slug: 'ramadan-gala-2025',
                        status: 'ACTIVE',
                        goalAmount: 500000,
                        raised: 125000,
                        currency: 'EUR',
                        description: 'Support our cause',
                    },
                })
                return
            }

            // Mock Events List
            if (url.includes('/api/events') && !url.includes('settings')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        data: [{ id: '1', name: 'Ramadan', slug: 'ramadan-gala-2025' }],
                        total: 1,
                    },
                })
                return
            }

            // Mock Donation Intent
            if (url.includes('/donations/intent')) {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    json: {
                        id: 'pi_3MtwBwLkdIwHu7ix28a3tqPa',
                        clientSecret: 'pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_OtZ8834921abcdef123456',
                    },
                })
                return
            }

            // Mock Donations List
            if (url.includes('/api/donations')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: { data: [], total: 0 },
                })
                return
            }

            // Mock Auth
            if (url.includes('/auth/login')) {
                await route.fulfill({
                    status: 201,
                    json: { accessToken: 'mock-token', user: { id: 'admin-1', role: 'ADMIN' } },
                })
                return
            }

            await route.continue()
        })
    })

    test('should handle immediate localization switching', async ({ page }) => {
        await page.goto('/ramadan-gala-2025?lng=en')
        await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
        await expect(page.getByRole('button', { name: /Donate/i }).first()).toBeVisible()

        await page.goto('/ramadan-gala-2025?lng=fr')
        await expect(page.getByRole('button', { name: /Faire un don/i })).toBeVisible()
    })

    test('should validate and process custom donation amounts', async ({ page }) => {
        await page.goto('/ramadan-gala-2025/donate?lng=en')
        const customInput = page.getByPlaceholder(/Amount|Montant|Custom/i)
        await expect(customInput).toBeVisible()
        await customInput.fill('123')
        await page.getByLabel('Name', { exact: false }).fill('Custom Donor')
        await page.getByLabel('Email', { exact: false }).fill('custom@test.com')

        // Listen for the intent request
        const intentRequestPromise = page.waitForRequest(
            (request) => request.url().includes('/donations/intent') && request.method() === 'POST',
        )

        await page.getByRole('button', { name: /Donate|Pay|Contribute/i }).click()

        const request = await intentRequestPromise
        const postData = request.postDataJSON()

        // Verify the payload contains the custom amount (in cents)
        expect(postData.amount).toBe(12300)
    })
})
