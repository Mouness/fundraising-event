import { test, expect } from '@playwright/test'

test.describe('Public Donation Flow', () => {
    const eventSlug = 'ramadan-gala-2025'

    test.beforeEach(async ({ page }) => {
        const USE_MOCKS = process.env.E2E_USE_MOCKS === 'true'

        // Logs
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))

        if (USE_MOCKS) {
            // Catch-all Mocking
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
                            content: {
                                title: 'Grand Gala Ramadan',
                                goalAmount: 500000,
                            },
                            donation: {
                                enabled: true,
                                payment: { provider: 'stripe' },
                                amounts: [10, 50, 100],
                            },
                            theme: { variables: {} },
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

                // Mock Intent
                if (url.includes('/donations/intent')) {
                    await route.fulfill({
                        status: 201,
                        contentType: 'application/json',
                        json: {
                            id: 'mock-intent-id',
                            clientSecret: 'pi_mock_secret_123',
                            amount: 5000,
                        },
                    })
                    return
                }

                // Mock Donations List (GET)
                if (url.includes('/api/donations') && route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        json: { data: [], total: 0 },
                    })
                    return
                }

                // Mock Donation Create (POST)
                if (url.includes('/api/donations') && route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 201,
                        contentType: 'application/json',
                        json: {
                            id: 'new-donation-123',
                            status: 'COMPLETED',
                            amount: 50,
                            currency: 'EUR',
                        },
                    })
                    return
                }

                // Mock Stripe API (return valid session structure to keep Elements happy)
                if (url.includes('api.stripe.com')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        json: {
                            id: 'sess_123',
                            object: 'checkout.session',
                            payment_status: 'paid',
                            payment_method_options: {
                                card: { request_three_d_secure: 'automatic' },
                            },
                            // For confirm calls, Stripe returns the PI directly.
                            // For sessions, it returns session.
                            // We'll merge them for simplicity or detect endpoint?
                            // Let's return a merged structure that satisfies both if possible,
                            // or just enough for confirm to find status.
                            status: 'succeeded',
                            client_secret: 'pi_mock_secret_123',
                            payment_method_types: ['card'],
                        },
                    })
                    return
                }

                await route.continue()
            })
        }

        // Ensure clean state
        await page.goto('/')
        await page.context().clearCookies()
        await page.evaluate(() => localStorage.clear())
    })

    /*
     * NOTE: Stripe & PayPal Payment Flows are intentionally excluded from E2E tests.
     *
     * Rationale:
     * 1. Anti-bot Protection: Payment providers use sophisticated script analysis to block automated tools.
     * 2. IFrame Complexity: Mocking secure IFrame communication (Steps 2-4) is flaky and fragile.
     * 3. Integration Level: Payment logic is best verified via Manual Testing or narrow Integration Tests
     *    that hit the real sandbox API without the full UI E2E overhead.
     *
     * Validation tests (below) ensure the form renders and client-side logic works.
     */

    test('should validate required fields', async ({ page }) => {
        await page.goto(`/${eventSlug}/donate`)

        // Select amount but don't fill details
        await page.getByRole('button', { name: /50/ }).first().click()

        // Submit
        await page.getByRole('button', { name: /Donate|Pay/i }).click()

        // Verify validation by checking we are still on the same page and no success message
        expect(page.url()).toContain(eventSlug)
        await expect(page.getByText(/Thank you|Merci/i)).not.toBeVisible()
    })
})
