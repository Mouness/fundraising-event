import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
    test.beforeEach(async ({ page }) => {
        // Debug console logs from browser
        page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`))
        page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`))

        // Mock API for Dashboard to bypass backend latency
        await page.route('**', async (route) => {
            const url = route.request().url()

            if (url.includes('/auth/login')) {
                console.log('MOCKING LOGIN:', url)
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    json: {
                        accessToken: 'mock-token-123',
                        user: {
                            id: 'admin-1',
                            email: 'admin@example.com',
                            role: 'ADMIN',
                        },
                    },
                })
                return
            }

            if (url.includes('/auth/logout')) {
                console.log('MOCKING LOGOUT:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: { success: true },
                })
                return
            }

            if (url.includes('/auth/me')) {
                console.log('MOCKING AUTH ME (Default 200):', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        id: 'admin-1',
                        email: 'admin@example.com',
                        role: 'ADMIN',
                    },
                })
                return
            }

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

            // Mock Event Settings (Specific first)
            if (url.includes('/api/events/') && url.includes('/settings')) {
                console.log('MOCKING EVENT SETTINGS:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        content: { title: 'Mock Event', goalAmount: 10000 },
                        donation: { enabled: true, payment: { provider: 'stripe' } },
                        theme: { variables: {} },
                        id: 'event-config-1',
                        slug: 'mock-event',
                    },
                })
                return
            }

            if (url.match(/\/api\/events\/[^\/]+$/)) {
                console.log('MOCKING SINGLE EVENT:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        id: '1',
                        name: 'Mock Event',
                        status: 'ACTIVE',
                        raised: 5000,
                        donorCount: 10,
                        goalAmount: 10000,
                        slug: 'mock-event',
                    },
                })
                return
            }

            if (url.includes('/api/events')) {
                console.log('MOCKING EVENTS LIST:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: [
                        {
                            id: '1',
                            name: 'Mock Event',
                            status: 'ACTIVE',
                            raised: 5000,
                            donorCount: 10,
                            goalAmount: 10000,
                            slug: 'mock-event',
                        },
                    ],
                })
                return
            }

            if (url.includes('/api/donations')) {
                console.log('MOCKING DONATIONS:', url)
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    json: {
                        data: [
                            {
                                id: '1',
                                amount: 5000,
                                currency: 'EUR',
                                donorName: 'John Doe',
                                createdAt: new Date().toISOString(),
                                isAnonymous: false,
                            },
                        ],
                        total: 1,
                    },
                })
                return
            }

            await route.continue()
        })
    })

    test('should allow admin to login and logout', async ({ page }) => {
        // 1. Visit Login
        await page.goto('/login')

        // 2. Login
        await page.getByLabel(/Email/i).fill('admin@example.com')
        await page.getByLabel(/Password|Mot de passe/i).fill('admin123')
        await page.getByRole('button', { name: /Login|Connexion|Sign in/i }).click()

        await expect(page).toHaveURL(/\/admin/)

        // Verify dashboard actually loads (this is where dashboard.spec fails)
        await expect(page.getByText('Overview', { exact: false })).toBeVisible({ timeout: 15000 })

        // 4. Logout
        // Finding the logout button in header
        await page.getByRole('button', { name: /Log out|Logout|Log off|Sign out/i }).click()

        // Use text fallback if aria-label is missing, or specific ID
        if (await page.getByText('Log out').isVisible()) {
            await page.getByText('Log out').click()
        }

        // 5. Verify Redirect to Login
        await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect unauthenticated users', async ({ page }) => {
        // Override mock to simulate 401 Unauthenticated
        await page.route('**/auth/me*', async (route) => {
            console.log('MOCKING 401 FOR UNAUTH TEST')
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                json: { message: 'Unauthorized' },
            })
        })

        // Ensure we are truly unauthenticated - must be on a valid origin
        await page.goto('/')
        await page.context().clearCookies()
        await page.evaluate(() => localStorage.clear())

        await page.goto('/admin')

        // Wait for potential client-side redirect
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })
})
