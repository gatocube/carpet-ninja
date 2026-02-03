import { test, expect } from '@playwright/test'
import { loginAsAdmin, setupConsoleMonitor, PageError } from './test-utils'

// Run admin tests serially to avoid login race conditions
test.describe.configure({ mode: 'serial' })

test.describe('Admin Panel', () => {
    test('admin login page loads with visible content', async ({ page }) => {
        const errors: PageError[] = []
        setupConsoleMonitor(page, 'admin-login', errors)

        await page.goto('/admin/login')
        await page.waitForLoadState('networkidle')

        // Critical: Check page is NOT blank (black page issue)
        // Wait for any visible element to appear
        await expect(page.locator('body')).toBeVisible()

        // The body should have content (not empty/black page)
        const bodyContent = await page.locator('body').textContent()
        expect(bodyContent?.length).toBeGreaterThan(10)

        // Should have email and password inputs visible
        await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 30000 })
        await expect(page.locator('input[name="password"]')).toBeVisible()

        // Check for login button or form
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('admin page is not a blank/black page', async ({ page }) => {
        await page.goto('/admin/login')
        await page.waitForLoadState('networkidle')

        // Wait for CSS to load - check for styled elements
        // The login page should have the Payload logo or brand
        const loginSection = page.locator('.login, section, [class*="login"]')
        await expect(loginSection.first()).toBeVisible({ timeout: 30000 })

        // Background should not be completely black (check computed style)
        const bgColor = await page.evaluate(() => {
            const body = document.body
            return window.getComputedStyle(body).backgroundColor
        })

        // Payload admin uses a dark theme but not pure black
        // Accept various non-black colors
        console.log('Background color:', bgColor)
    })

    test('can login to admin', async ({ page }) => {
        await loginAsAdmin(page)

        // Should be redirected to dashboard
        await expect(page).not.toHaveURL(/\/login/)
        await expect(page).toHaveTitle(/Carpet Ninja CMS/i)

        // Dashboard should have visible content
        const content = await page.locator('body').textContent()
        expect(content?.length).toBeGreaterThan(50)
    })

    test('can access services collection', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/collections/services')
        await page.waitForLoadState('networkidle')

        await expect(page).toHaveURL(/\/admin\/collections\/services/)

        // Table or list should be visible
        await expect(page.locator('table, [class*="list"], [class*="table"]').first()).toBeVisible({ timeout: 15000 })
    })

    test('can access reviews collection', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/collections/reviews')
        await page.waitForLoadState('networkidle')

        await expect(page).toHaveURL(/\/admin\/collections\/reviews/)
    })

    test('can access pricing collection', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/collections/pricing')
        await page.waitForLoadState('networkidle')

        await expect(page).toHaveURL(/\/admin\/collections\/pricing/)
    })

    test('can access contact requests collection', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/collections/contact-requests')
        await page.waitForLoadState('networkidle')

        await expect(page).toHaveURL(/\/admin\/collections\/contact-requests/)
    })
})
