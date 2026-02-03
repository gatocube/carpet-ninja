import { test, expect } from '@playwright/test'

/**
 * E2E test that clicks through all admin UI menu items and verifies pages load
 * This catches 404s, broken routes, and missing globals/collections
 */

const PROD_URL = process.env.PROD_URL || 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alex@carpet-ninja.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'barducks'

// Run tests serially since we're navigating through the UI
test.describe.configure({ mode: 'serial' })

test.describe('Admin Menu Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Login to admin
        await page.goto(`${PROD_URL}/admin/login`)

        // Handle if already logged in
        if (!page.url().includes('login')) {
            return
        }

        await page.fill('input[name="email"]', ADMIN_EMAIL)
        await page.fill('input[name="password"]', ADMIN_PASSWORD)
        await page.click('button[type="submit"]')

        // Wait for dashboard
        await page.waitForURL(/\/admin($|\/)/, { timeout: 30000 })
    })

    test('admin dashboard should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin`)
        await page.waitForLoadState('networkidle')

        // Check we're on admin (not redirected to error)
        expect(page.url()).toContain('/admin')

        // Check for actual 404 page indicators (not just '404' in translation strings)
        // A real 404 page would have specific elements
        const notFoundHeading = page.locator('h1:has-text("Not Found"), h1:has-text("Page not found")')
        const has404Page = (await notFoundHeading.count()) > 0

        expect(has404Page).toBe(false)

        console.log('✅ Admin dashboard loaded')
    })

    test('collections: Services should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/services`)
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/admin/collections/services')

        // Check not a 404
        const content = await page.content()
        expect(content.toLowerCase()).not.toContain('page not found')

        console.log('✅ Services collection loaded')
    })

    test('collections: Reviews should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/reviews`)
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/admin/collections/reviews')
        console.log('✅ Reviews collection loaded')
    })

    test('collections: Pricing should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/pricing`)
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/admin/collections/pricing')
        console.log('✅ Pricing collection loaded')
    })

    test('collections: Media should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/media`)
        await page.waitForLoadState('networkidle')

        // Handle login redirect
        if (page.url().includes('login')) {
            await page.fill('input[name="email"]', ADMIN_EMAIL)
            await page.fill('input[name="password"]', ADMIN_PASSWORD)
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/admin\/collections\/media/, { timeout: 30000 })
        }

        expect(page.url()).toContain('/admin/collections/media')
        console.log('✅ Media collection loaded')
    })

    test('collections: Contact Requests should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/contact-requests`)
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/admin/collections/contact-requests')
        console.log('✅ Contact Requests collection loaded')
    })

    test('collections: Users should load', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/collections/users`)
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/admin/collections/users')
        console.log('✅ Users collection loaded')
    })

    test('globals: Site Settings should load without 404', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/globals/site-settings`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check URL
        const url = page.url()
        console.log(`Current URL: ${url}`)

        // Check for 404 indicators in page content
        const content = await page.content()
        const has404Content =
            content.toLowerCase().includes('page not found') ||
            content.toLowerCase().includes('404') && content.toLowerCase().includes('not found')

        // Check for form fields (indicates page loaded correctly)
        const formFields = page.locator('input, textarea, select')
        const fieldCount = await formFields.count()

        console.log(`Form fields found: ${fieldCount}`)
        console.log(`Has 404 content: ${has404Content}`)

        // Either should have form fields OR should not have 404 content
        if (has404Content) {
            // Take screenshot for debugging
            await page.screenshot({ path: 'test-results/site-settings-404.png' })
            console.log('❌ Site Settings page shows 404')
        }

        expect(has404Content).toBe(false)
        expect(fieldCount).toBeGreaterThan(0)
        console.log('✅ Site Settings global loaded')
    })

    test('globals: Hero should load without 404', async ({ page }) => {
        await page.goto(`${PROD_URL}/admin/globals/hero`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check for form fields
        const formFields = page.locator('input, textarea, select')
        const fieldCount = await formFields.count()

        // Check for 404 indicators
        const content = await page.content()
        const has404Content =
            content.toLowerCase().includes('page not found') ||
            (content.toLowerCase().includes('404') && content.toLowerCase().includes('not found'))

        expect(has404Content).toBe(false)
        expect(fieldCount).toBeGreaterThan(0)
        console.log('✅ Hero global loaded')
    })

    test('all admin API endpoints should return valid responses', async ({ request }) => {
        const endpoints = [
            { path: '/api/services', name: 'Services' },
            { path: '/api/reviews', name: 'Reviews' },
            { path: '/api/pricing', name: 'Pricing' },
            { path: '/api/media', name: 'Media' },
            { path: '/api/globals/site-settings', name: 'Site Settings' },
            { path: '/api/globals/hero', name: 'Hero' },
        ]

        for (const endpoint of endpoints) {
            const response = await request.get(`${PROD_URL}${endpoint.path}`)
            const status = response.status()

            // Should be 200 or 401 (auth required), not 404 or 500
            expect(
                [200, 401].includes(status),
                `${endpoint.name} (${endpoint.path}) returned ${status}`
            ).toBe(true)

            console.log(`✅ ${endpoint.name}: ${status}`)
        }
    })
})
