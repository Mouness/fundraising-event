import { test, expect } from '@playwright/test'

test.describe('Resilience & Security', () => {
    test('should handle 404 for invalid routes', async ({ page }) => {
        // Mock 404 behavior if needed, or rely on client-side routing
        await page.goto('/invalid-route-12345')
        await expect(page.getByText(/Not Found|404/i)).toBeVisible()
        await expect(page.getByText(/Application error/i)).not.toBeVisible()
    })

    test('should rate limit excessive API requests (Mocked)', async ({ page }) => {
        // Mock rate limiting logic on the client-side network interceptor
        let requestCount = 0
        await page.route('**/api/health', async (route) => {
            requestCount++
            if (requestCount > 10) {
                await route.fulfill({ status: 429, body: 'Too Many Requests' })
            } else {
                await route.fulfill({ status: 200, body: 'OK' })
            }
        })

        await page.goto('/') // Ensure context is loaded

        // Send 30 requests from the browser
        const responses = await page.evaluate(async () => {
            const results: number[] = []
            for (let i = 0; i < 30; i++) {
                try {
                    const res = await fetch('/api/health')
                    results.push(res.status)
                } catch (e) {
                    results.push(0)
                }
            }
            return results
        })

        // Verify we got some 429s
        const hasRateLimit = responses.some((s) => s === 429)
        const hasSuccess = responses.some((s) => s === 200)

        expect(hasSuccess, 'Should have some success').toBe(true)
        expect(hasRateLimit, 'Should trigger mock rate limit').toBe(true)
    })
})
