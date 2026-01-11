import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

test.describe('Admin Staff Management', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Login as Admin
        await page.goto('/login')
        await page.getByLabel(/Email/i).fill(process.env.ADMIN_EMAIL || 'admin@example.com')
        await page
            .getByLabel(/Password|Mot de passe/i)
            .fill(process.env.ADMIN_PASSWORD || 'admin123')
        await page.getByRole('button', { name: /Login|Connexion|Sign in/i }).click()
        await expect(page).toHaveURL(/\/admin/)
    })

    test('should allow admin to create, update, and delete a staff member', async ({ page }) => {
        const uniqueId = randomUUID().substring(0, 8)
        const staffName = `Staff ${uniqueId}`
        const staffCode = `99${uniqueId.substring(0, 4)}`
        const updatedName = `Updated ${uniqueId}`

        // 1. Navigate to Staff Page
        await page.goto('/admin/staff')

        // Wait for table to load
        // Heading is "Staff Management"
        await expect(
            page.getByRole('heading', { name: /Staff Management|Gestion Équipe/i, level: 2 }),
        ).toBeVisible()

        // 2. Create Staff Member
        // Button is "Add to Pool"
        await page.getByRole('button', { name: /Add to Pool|Ajouter/i }).click()

        // Fill Form
        await expect(page.getByRole('dialog')).toBeVisible()
        // Labels: "Member Name" and "PIN Code"
        await page.getByLabel(/Member Name|Nom/i).fill(staffName)
        await page.getByLabel(/PIN Code|Code PIN/i).fill(staffCode)

        // Submit: "Add to Pool"
        await page.getByRole('button', { name: /Add to Pool|Ajouter/i, exact: true }).click()

        // Assertion: Toast and Table Row
        // Toast: "Member added to pool."
        await expect(page.getByText(/Member added to pool|Membre ajouté/i)).toBeVisible()
        await expect(page.getByText(staffName)).toBeVisible()
        await expect(page.getByText(staffCode)).toBeVisible()

        // 3. Update Staff Member
        // Find the row containing the staff name
        const row = page.getByRole('row').filter({ hasText: staffName })
        // Click the first button in the actions cell (Edit)
        await row.getByRole('button').first().click()

        // Change Name
        await expect(page.getByRole('dialog')).toBeVisible()
        await page.getByLabel(/Member Name|Nom/i).fill(updatedName)

        // Submit Update: "Save Changes"
        await page.getByRole('button', { name: /Save Changes|Enregistrer/i }).click()

        // Assertion: Toast and Updated Name
        // Toast: "Staff member updated successfully"
        await expect(
            page.getByText(/Staff member updated successfully|Membre mis à jour/i),
        ).toBeVisible()
        await expect(page.getByText(updatedName)).toBeVisible()

        // 4. Delete Staff Member
        // Re-find row with updated name
        const targetRow = page.getByRole('row').filter({ hasText: updatedName })
        // Click the second button (Trash)
        await targetRow.getByRole('button').nth(1).click()

        // Confirm Dialog
        await expect(page.getByRole('dialog')).toBeVisible()
        await page.getByRole('button', { name: /Delete|Supprimer/i }).click()

        // Assertion: Toast and Row Gone
        // Toast: we assume "deleted" is in the text.
        await expect(page.getByText(/deleted|supprimé/i)).toBeVisible()
        await expect(page.getByText(updatedName)).not.toBeVisible()
    })
})
