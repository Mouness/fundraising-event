import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

test.describe('Event Lifecycle', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/login')
        await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL || 'admin@example.com')
        await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD || 'admin123')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/admin/)
    })

    test('should allow admin to create a new event and view it publicly', async ({ page }) => {
        test.setTimeout(60000)
        const uniqueId = randomUUID().substring(0, 8)
        const eventName = `Gala ${uniqueId}`
        const eventSlug = `gala-${uniqueId}`
        const goalAmount = '50000'

        // 1. Navigate to Events List
        await page.goto('/admin/events')
        await expect(page.getByRole('heading', { name: /events/i })).toBeVisible()

        // 2. Click Create Event
        await page.getByRole('link', { name: /create/i }).click()
        await expect(page).toHaveURL(/\/admin\/events\/new/)

        // 3. Fill Form
        await page.getByLabel(/campaign name/i).fill(eventName)
        await page.getByLabel(/url slug/i).fill(eventSlug)
        await page.getByLabel(/fundraising goal/i).fill(goalAmount)

        // 4. Submit
        await page.getByRole('button', { name: /create campaign/i }).click({ force: true })

        // 5. Verify Redirect and Lists
        await expect(page).toHaveURL(/\/admin\/events/)
        await expect(page.getByText('Event created successfully')).toBeVisible()
        await expect(page.getByText(eventName)).toBeVisible()

        // 6. Verify Public Page
        // Open new context or just navigate
        await page.goto(`/${eventSlug}`)
        // await expect(page.getByText(eventName)).toBeVisible()
        await expect(page.getByText(/goal/i)).toBeVisible()
    })
})
