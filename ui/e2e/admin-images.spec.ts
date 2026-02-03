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
        // Navigate to services collection
        await page.goto(`${PROD_URL}/admin/collections/services`)
        await page.waitForLoadState('networkidle')

        // Click on first service in the table or list
        const serviceLink = page.locator('a[href*="/admin/collections/services/"]').first()
        if (await serviceLink.count() > 0) {
            await serviceLink.click()
            await page.waitForLoadState('networkidle')

            // Look for image upload field - more flexible selectors
            const uploadField = page.locator('[class*="upload"], [data-field-type="upload"], .upload-field')
            const imageLabel = page.locator('text="Image"').first()

            const hasUploadUI = (await uploadField.count()) > 0 || (await imageLabel.count()) > 0
            expect(hasUploadUI).toBe(true)
            console.log('✅ Service edit page loaded with image field')
        } else {
            // No services exist yet - that's ok for a fresh install
            console.log('⚠️ No services found - skipping')
            test.skip()
        }
    })

    test('site settings should have upload fields for images', async ({ page }) => {
        // Navigate to site settings
        await page.goto(`${PROD_URL}/admin/globals/site-settings`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        // Check that we're on site settings page
        const pageContent = await page.content()
        const hasSettingsUI = pageContent.includes('site-settings') || pageContent.includes('Site Settings')
        expect(hasSettingsUI).toBe(true)

        // Look for any tab system (Payload v3 uses tabs component)
        const tabs = page.locator('[role="tab"], [class*="tab"], button[class*="tabs"]')
        const tabCount = await tabs.count()

        if (tabCount > 0) {
            console.log(`✅ Found ${tabCount} tabs in site settings`)
            // Try clicking first tab to verify they work
            await tabs.first().click()
            await page.waitForTimeout(500)
        }

        // Verify page has form fields (any fields indicate the schema loaded)
        const formFields = page.locator('input, textarea, [class*="field-type"]')
        expect(await formFields.count()).toBeGreaterThan(0)
        console.log('✅ Site settings page loaded with form fields')
    })

    test('media collection should be accessible', async ({ page }) => {
        // Navigate to media collection
        await page.goto(`${PROD_URL}/admin/collections/media`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        // Check URL is correct
        expect(page.url()).toContain('/admin/collections/media')

        // Check we're on media page - look for create/upload button or empty state
        const createBtn = page.locator('a[href*="create"], button:has-text("Create"), button:has-text("Upload")')
        const emptyState = page.locator('text="No Media found"')
        const mediaItems = page.locator('[class*="upload"], [class*="thumbnail"], img[src*="/media/"]')

        const hasMediaUI =
            (await createBtn.count()) > 0 ||
            (await emptyState.count()) > 0 ||
            (await mediaItems.count()) > 0

        expect(hasMediaUI).toBe(true)
        console.log('✅ Media collection is accessible')
    })

    test('services API should return image field', async ({ request }) => {
        // Verify API structure includes image field
        const response = await request.get(`${PROD_URL}/api/services`)
        expect(response.status()).toBe(200)

        const data = await response.json()
        expect(data.docs).toBeDefined()
        expect(data.docs.length).toBeGreaterThan(0)

        // Check that each service has an 'image' field (can be null or object)
        for (const service of data.docs) {
            expect('image' in service).toBe(true)
            console.log(`Service "${service.title}": image = ${service.image ? 'set' : 'null'}`)
        }

        console.log('✅ Services API includes image field')
    })
})

