import { test, expect } from '@playwright/test'

const BASE_URL = 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = 'admin123'

test.describe('Production Admin Content Sync', () => {
    test('can login, edit hero, and see changes on frontend', async ({ page }) => {
        // Step 1: Login to admin
        await page.goto(`${BASE_URL}/admin/login`)
        await page.waitForLoadState('networkidle')

        // Take screenshot of login page
        await page.screenshot({ path: 'test-results/prod-login.png' })

        // Fill login form
        await page.fill('input[name="email"]', ADMIN_EMAIL)
        await page.fill('input[name="password"]', ADMIN_PASSWORD)
        await page.click('button[type="submit"]')

        // Wait for redirect to dashboard
        await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 })
        await page.screenshot({ path: 'test-results/prod-dashboard.png' })

        console.log('✅ Logged in successfully')

        // Step 2: Navigate to Hero global
        await page.goto(`${BASE_URL}/admin/globals/hero`)
        await page.waitForLoadState('networkidle')
        await page.screenshot({ path: 'test-results/prod-hero-edit.png' })

        // Step 3: Get current headline and modify it
        const headlineInput = page.locator('input[name="headline"]').first()
        const originalHeadline = await headlineInput.inputValue()
        console.log(`Original headline: ${originalHeadline}`)

        // Add a timestamp to make it unique
        const timestamp = Date.now()
        const newHeadline = `Ninja-fast Cleaning - Updated ${timestamp}`

        await headlineInput.clear()
        await headlineInput.fill(newHeadline)

        // Save changes
        await page.click('button:has-text("Save")')
        await page.waitForTimeout(3000)
        await page.screenshot({ path: 'test-results/prod-hero-saved.png' })

        console.log('✅ Hero headline updated')

        // Step 4: Verify change on frontend
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')
        await page.screenshot({ path: 'test-results/prod-frontend.png' })

        const heroSection = await page.textContent('h1')
        console.log(`Frontend headline: ${heroSection}`)

        // Check if our update is visible
        expect(heroSection).toContain(String(timestamp))

        console.log('✅ Content sync verified!')

        // Step 5: Restore original headline
        await page.goto(`${BASE_URL}/admin/globals/hero`)
        await page.waitForLoadState('networkidle')
        await headlineInput.clear()
        await headlineInput.fill(originalHeadline)
        await page.click('button:has-text("Save")')
        await page.waitForTimeout(2000)

        console.log('✅ Original headline restored')
    })
})
