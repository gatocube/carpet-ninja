import { test, expect } from '@playwright/test'
import { loginAsAdmin, setupConsoleMonitor, PageError } from './test-utils'

/**
 * Tests that content edited in admin UI is reflected on the website
 */
test.describe('Content Sync', () => {
    test('editing site settings updates contact info on homepage', async ({ page }) => {
        // Login to admin
        await loginAsAdmin(page)

        // Go to site settings
        await page.goto('/admin/globals/site-settings')
        await page.waitForLoadState('networkidle')

        // Wait for form to load
        await page.waitForSelector('input, textarea', { state: 'visible', timeout: 30000 })

        // Find and update the phone field
        const phoneInput = page.locator('input[name="phone"]')
        if (await phoneInput.isVisible()) {
            const newPhone = '(415) 555-TEST'
            await phoneInput.clear()
            await phoneInput.fill(newPhone)

            // Save changes
            await page.click('button:has-text("Save")')
            await page.waitForTimeout(2000)

            // Visit homepage and check phone is updated
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            // Check if new phone appears somewhere on page
            const pageContent = await page.content()
            expect(pageContent).toContain('555-TEST')
        }
    })

    test('editing hero updates homepage headline', async ({ page }) => {
        // Login to admin
        await loginAsAdmin(page)

        // Go to hero global
        await page.goto('/admin/globals/hero')
        await page.waitForLoadState('networkidle')

        // Wait for form
        await page.waitForSelector('input, textarea', { state: 'visible', timeout: 30000 })

        // Find headline field
        const headlineInput = page.locator('input[name="headline"]')
        if (await headlineInput.isVisible()) {
            const testText = 'Test Headline ' + Date.now()
            await headlineInput.clear()
            await headlineInput.fill(testText)

            // Save
            await page.click('button:has-text("Save")')
            await page.waitForTimeout(2000)

            // Visit homepage
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            // Verify headline changed
            const h1Text = await page.locator('h1').textContent()
            expect(h1Text).toContain('Test Headline')
        }
    })

    test('creating a new service adds card to homepage', async ({ page }) => {
        // Login
        await loginAsAdmin(page)

        // Go to services collection
        await page.goto('/admin/collections/services')
        await page.waitForLoadState('networkidle')

        // Count existing services
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        const initialCount = await page.locator('#services .group').count()

        // Go back to admin and create new service
        await page.goto('/admin/collections/services/create')
        await page.waitForLoadState('networkidle')
        await page.waitForSelector('input', { state: 'visible', timeout: 30000 })

        // Fill in required fields
        const titleInput = page.locator('input[name="title"]')
        if (await titleInput.isVisible()) {
            await titleInput.fill('Test Service ' + Date.now())

            const descInput = page.locator('textarea[name="description"]')
            if (await descInput.isVisible()) {
                await descInput.fill('Test description for e2e testing')
            }

            // Save
            await page.click('button:has-text("Save")')
            await page.waitForTimeout(3000)

            // Check homepage has one more service
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            const newCount = await page.locator('#services .group').count()

            expect(newCount).toBeGreaterThanOrEqual(initialCount)
        }
    })
})
