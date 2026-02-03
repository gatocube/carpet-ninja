import { test, expect } from '@playwright/test'
import { setupConsoleMonitor, PageError } from './test-utils'

/**
 * This test suite validates that pages load without errors
 * in both terminal (server-side) and browser console (client-side)
 */
test.describe('Error-Free Page Load', () => {
    test('homepage loads without browser console errors', async ({ page }) => {
        const errors: PageError[] = []
        setupConsoleMonitor(page, 'homepage', errors)

        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Wait a bit for any delayed errors
        await page.waitForTimeout(1000)

        // Filter for real errors only
        const realErrors = errors.filter(e => e.type === 'error')

        if (realErrors.length > 0) {
            console.log('Console errors found:', realErrors)
        }

        // Should have no real errors
        expect(realErrors.length).toBe(0)
    })

    test('admin login page loads without browser console errors', async ({ page }) => {
        const errors: PageError[] = []
        setupConsoleMonitor(page, 'admin-login', errors)

        await page.goto('/admin/login')
        await page.waitForLoadState('networkidle')

        // Wait for page to fully render
        await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 30000 })
        await page.waitForTimeout(1000)

        const realErrors = errors.filter(e => e.type === 'error')

        if (realErrors.length > 0) {
            console.log('Admin console errors found:', realErrors)
        }

        expect(realErrors.length).toBe(0)
    })

    test('homepage has all expected sections visible', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Check all major sections are present and visible
        const sections = ['#home', '#services', '#reviews', '#pricing', '#contact']

        for (const section of sections) {
            const element = page.locator(section)
            await expect(element).toBeVisible({ timeout: 10000 })
        }
    })

    test('homepage renders seeded content correctly', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Check services are rendered (should have 3 from seed)
        const serviceCards = page.locator('#services .group')
        await expect(serviceCards).toHaveCount(3)

        // Check pricing tiers (should have 3 from seed)
        const pricingCards = page.locator('#pricing').locator('[class*="rounded-3xl"]').filter({ hasText: '$' })
        const count = await pricingCards.count()
        expect(count).toBeGreaterThanOrEqual(3)

        // Check "Most Popular" badge exists
        await expect(page.locator('text=Most Popular')).toBeVisible()
    })

    test('all navigation links work', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Test each nav link scrolls to section
        const navLinks = [
            { href: '#services', section: '#services' },
            { href: '#reviews', section: '#reviews' },
            { href: '#pricing', section: '#pricing' },
            { href: '#contact', section: '#contact' },
        ]

        for (const link of navLinks) {
            await page.click(`nav a[href="${link.href}"]`)
            await page.waitForTimeout(500) // Wait for scroll
            const section = page.locator(link.section)
            await expect(section).toBeInViewport()
        }
    })
})
