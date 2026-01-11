import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

test.describe('Data Exports', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/login')
        await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL || 'admin@example.com')
        await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD || 'admin123')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/admin/)
    })

    test('should allow admin to export donations as CSV', async ({ page }) => {
        // 1. Navigate to Events List
        await page.goto('/admin/events')

        // 2. Select an event (we assume at least one exists from seeding or previous tests)
        // For robustness, we might want to create one, but for now let's try to pick the first one
        await page.locator('.space-y-6 .grid a').first().click()

        // 3. Go to Donations tab
        await page.getByRole('link', { name: /donations/i }).click()

        // 4. Trigger Export
        const downloadPromise = page.waitForEvent('download')
        await page.getByRole('button', { name: 'Export CSV' }).click()
        const download = await downloadPromise

        // 5. Verify Download
        expect(download.suggestedFilename()).toContain('.csv')
        expect(await download.failure()).toBeNull()
    })

    test('should allow admin to export receipts as ZIP', async ({ page }) => {
        // 1. Navigate to Events List
        await page.goto('/admin/events')
        await page.locator('.space-y-6 .grid a').first().click()

        // 3. Go to Donations tab
        await page.getByRole('link', { name: /donations/i }).click()

        // 4. Trigger Export
        const downloadPromise = page.waitForEvent('download')
        await page.getByRole('button', { name: 'Export PDFs (ZIP)' }).click()
        const download = await downloadPromise

        // 5. Verify Download
        expect(download.suggestedFilename()).toContain('.zip')
        expect(await download.failure()).toBeNull()
    })
})
