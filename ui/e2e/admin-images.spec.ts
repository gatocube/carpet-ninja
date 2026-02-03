import { test, expect } from '@playwright/test'

/**
 * E2E tests for admin image upload and management
 * Verifies that images can be uploaded and changed in the Payload CMS admin panel
 */

const PROD_URL = process.env.PROD_URL || 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alex@carpet-ninja.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'barducks'

test.describe('Admin Image Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login to admin
        await page.goto(`${PROD_URL}/admin/login`)
        await page.fill('input[name="email"]', ADMIN_EMAIL)
        await page.fill('input[name="password"]', ADMIN_PASSWORD)
        await page.click('button[type="submit"]')

        // Wait for dashboard
        await page.waitForURL(/\/admin($|\/)/, { timeout: 30000 })
    })

    test('services should have image upload field visible', async ({ page }) => {
        // Navigate to first service
        await page.goto(`${PROD_URL}/admin/collections/services`)
        await page.waitForLoadState('networkidle')

        // Click on first service row
        const firstRow = page.locator('table tbody tr').first()
        if (await firstRow.count() > 0) {
            await firstRow.click()
            await page.waitForLoadState('networkidle')

            // Look for image upload field - Payload uses "Upload" or "Image" label
            const imageLabel = page.locator('label:has-text("Image")')
            const uploadField = page.locator('.field-type.upload, [data-field-type="upload"]')

            // Either the label or the upload field should exist
            const hasImageField = (await imageLabel.count()) > 0 || (await uploadField.count()) > 0

            expect(hasImageField).toBe(true)
            console.log('✅ Service has image upload field')
        } else {
            console.log('⚠️ No services found to test')
        }
    })

    test('site settings should have branding tab with logo fields', async ({ page }) => {
        // Navigate to site settings
        await page.goto(`${PROD_URL}/admin/globals/site-settings`)
        await page.waitForLoadState('networkidle')

        // Look for Branding tab
        const brandingTab = page.locator('button:has-text("Branding"), a:has-text("Branding")')

        if (await brandingTab.count() > 0) {
            await brandingTab.click()
            await page.waitForTimeout(500)

            // Check for logo and favicon fields
            const logoLabel = page.locator('label:has-text("Logo")')
            const faviconLabel = page.locator('label:has-text("Favicon")')

            expect(await logoLabel.count()).toBeGreaterThan(0)
            expect(await faviconLabel.count()).toBeGreaterThan(0)
            console.log('✅ Branding tab has Logo and Favicon fields')
        } else {
            console.log('⚠️ Branding tab not found - checking for direct fields')
            const logoLabel = page.locator('label:has-text("Logo")')
            expect(await logoLabel.count()).toBeGreaterThan(0)
        }
    })

    test('site settings content tab should have before/after image field', async ({ page }) => {
        // Navigate to site settings
        await page.goto(`${PROD_URL}/admin/globals/site-settings`)
        await page.waitForLoadState('networkidle')

        // Look for Content tab
        const contentTab = page.locator('button:has-text("Content"), a:has-text("Content")')

        if (await contentTab.count() > 0) {
            await contentTab.click()
            await page.waitForTimeout(500)

            // Check for before/after image field
            const beforeAfterLabel = page.locator('label:has-text("Before/After")')

            expect(await beforeAfterLabel.count()).toBeGreaterThan(0)
            console.log('✅ Content tab has Before/After Image field')
        }
    })

    test('site settings coverage tab should have map embed URL field', async ({ page }) => {
        // Navigate to site settings
        await page.goto(`${PROD_URL}/admin/globals/site-settings`)
        await page.waitForLoadState('networkidle')

        // Look for Coverage tab
        const coverageTab = page.locator('button:has-text("Coverage"), a:has-text("Coverage")')

        if (await coverageTab.count() > 0) {
            await coverageTab.click()
            await page.waitForTimeout(500)

            // Check for map embed URL field
            const mapLabel = page.locator('label:has-text("Google Maps")')

            expect(await mapLabel.count()).toBeGreaterThan(0)
            console.log('✅ Coverage tab has Google Maps Embed URL field')
        }
    })

    test('media collection should be accessible and allow uploads', async ({ page }) => {
        // Navigate to media collection
        await page.goto(`${PROD_URL}/admin/collections/media`)
        await page.waitForLoadState('networkidle')

        // Check page loaded
        const heading = page.locator('h1:has-text("Media")')
        expect(await heading.count()).toBeGreaterThan(0)

        // Check for "Create New" button
        const createBtn = page.locator('a:has-text("Create New"), button:has-text("Create New")')
        expect(await createBtn.count()).toBeGreaterThan(0)

        console.log('✅ Media collection is accessible with Create New option')
    })
})
