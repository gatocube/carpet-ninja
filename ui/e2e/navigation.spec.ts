import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
    test('navbar links scroll to sections', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Click Services link
        await page.click('nav a[href="#services"]')
        await page.waitForTimeout(500) // Wait for scroll
        const servicesSection = page.locator('#services')
        await expect(servicesSection).toBeInViewport()

        // Click Reviews link
        await page.click('nav a[href="#reviews"]')
        await page.waitForTimeout(500)
        const reviewsSection = page.locator('#reviews')
        await expect(reviewsSection).toBeInViewport()

        // Click Pricing link
        await page.click('nav a[href="#pricing"]')
        await page.waitForTimeout(500)
        const pricingSection = page.locator('#pricing')
        await expect(pricingSection).toBeInViewport()
    })

    test('CTA buttons link to contact section', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Click "Book Now" button in hero
        await page.click('a[href="#contact"]:has-text("Book")')
        await page.waitForTimeout(500)
        const contactSection = page.locator('#contact')
        await expect(contactSection).toBeInViewport()
    })

    test('header is fixed on scroll', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500))
        await page.waitForTimeout(300)

        // Header should still be visible
        const header = page.locator('header')
        await expect(header).toBeInViewport()
    })
})
