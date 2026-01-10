import { test, expect } from '@playwright/test'

test.describe('Staff Collector App', () => {
    const eventSlug = 'ramadan-gala-2025'
    const VALID_PIN = '1111'

    test.setTimeout(60000)

    test.beforeEach(async ({ page }) => {
        // Debug console logs from browser
        page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`))
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))
        page.on('request', (request) => console.log('REQ >>', request.method(), request.url()))
        page.on('requestfailed', (request) =>
            console.log('REQ FAIL !!', request.url(), request.failure()?.errorText),
        )

        // Catch-all route to intercept EVERYTHING
        await page.route('**', async (route) => {
            const url = route.request().url()

            // Mock Staff Login
            if (url.includes('/auth/staff/login')) {
                console.log('MOCKING STAFF LOGIN:', url)
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    json: {
                        accessToken: 'mock-staff-token-123',
                        user: {
                            id: 'staff-1',
                            name: 'Staff Member',
                            role: 'STAFF',
                            eventId: '1',
                        },
                    },
                })
                return
            }

            // Mock Global Settings / Config
            if (url.includes('/api/settings/global') || url.includes('/white-labeling/config')) {
                console.log('MOCKING CONFIG/SETTINGS:', url)
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
            if (url.includes('/api/events/') && url.includes('/settings')) {
                console.log('MOCKING EVENT SETTINGS:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        content: { title: 'Ramadan Gala 2025', goalAmount: 10000 },
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

            // Mock Event Details
            if (url.match(/\/api\/events\/[^\/]+$/)) {
                console.log('MOCKING EVENTS DETAIL:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        id: '1',
                        name: 'Ramadan Gala 2025',
                        status: 'ACTIVE',
                        currency: 'EUR',
                        slug: eventSlug,
                        goalAmount: 10000,
                        raised: 5000,
                        donation: {
                            enabled: true,
                            payment: { provider: 'stripe' },
                            amounts: [10, 50, 100],
                        },
                    },
                })
                return
            }

            // Mock Donations (for collection)
            if (url.includes('/api/donations')) {
                console.log('MOCKING DONATION SUBMIT:', url)
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    json: {
                        id: 'new-donation-1',
                        amount: 50,
                        status: 'COMPLETED',
                    },
                })
                return
            }

            await route.continue()
        })

        // Ensure clean state
        await page.goto('/')
        await page.context().clearCookies()
        await page.evaluate(() => localStorage.clear())
    })

    test('should login with valid PIN', async ({ page }) => {
        await page.goto(`/${eventSlug}/staff/login`)

        // Enter PIN
        await page.getByLabel(/PIN/i).fill(VALID_PIN)
        await page.getByRole('button', { name: /Login|Entrer|Connect/i }).click()

        // Verify redirect to collector
        await expect(page).toHaveURL(new RegExp(`/${eventSlug}/staff/collect`))
    })

    test('should allow manual donation entry', async ({ page }) => {
        // Bypassing login for this test if possible, or repeating login
        await page.goto(`/${eventSlug}/staff/login`)
        await page.getByLabel(/PIN/i).fill(VALID_PIN)
        await page.getByRole('button', { name: /Login|Entrer|Connect/i }).click()

        // On Collector Page
        // Click "50"
        // Type "50" using Keypad
        await page.getByRole('button', { name: '5' }).click()
        await page.getByRole('button', { name: '0', exact: true }).click()

        // Select "Cash"
        await page.getByRole('button', { name: /Cash/i }).click()

        // Submit
        await page.getByRole('button', { name: /Collect|Valider/i }).click()

        // Verify Success
        await expect(page.getByText(/Collected|Validé/i)).toBeVisible()
    })
})
