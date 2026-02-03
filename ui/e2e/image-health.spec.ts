import { test, expect } from '@playwright/test'

/**
 * Post-deploy E2E test to verify all images load correctly.
 * This catches issues like:
 * - Broken image URLs
 * - Missing assets not deployed
 * - Filename mismatches between code and assets
 */

const PROD_URL = process.env.PROD_URL || 'https://carpet-ninja.vercel.app'

test.describe('Image Health Check', () => {
    test('all images should load without 404 errors', async ({ page }) => {
        const brokenImages: string[] = []
        const loadedImages: string[] = []

        // Listen for failed requests
        page.on('response', (response) => {
            const url = response.url()
            if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
                if (response.status() >= 400) {
                    brokenImages.push(`${response.status()} - ${url}`)
                } else {
                    loadedImages.push(url)
                }
            }
        })

        // Visit the homepage
        await page.goto(PROD_URL, { waitUntil: 'networkidle' })

        // Wait for all images to be in the DOM
        await page.waitForTimeout(2000)

        // Get all img elements and check their naturalWidth (0 = broken)
        const imageStats = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'))
            return imgs.map((img) => ({
                src: img.src,
                alt: img.alt || '(no alt)',
                loaded: img.complete && img.naturalWidth > 0,
                naturalWidth: img.naturalWidth,
            }))
        })

        const brokenInDOM = imageStats.filter((img) => !img.loaded)

        // Log results
        console.log(`\n✅ Images loaded: ${loadedImages.length}`)
        console.log(`❌ Broken network requests: ${brokenImages.length}`)
        console.log(`❌ Broken in DOM: ${brokenInDOM.length}`)

        if (brokenImages.length > 0) {
            console.log('\nBroken image URLs:')
            brokenImages.forEach((url) => console.log(`  - ${url}`))
        }

        if (brokenInDOM.length > 0) {
            console.log('\nBroken images in DOM:')
            brokenInDOM.forEach((img) => console.log(`  - ${img.src} (${img.alt})`))
        }

        // Assertions
        expect(brokenImages, 'No images should return 4xx/5xx').toHaveLength(0)
        expect(brokenInDOM, 'All img elements should load successfully').toHaveLength(0)
    })

    test('critical assets should be accessible', async ({ request }) => {
        const criticalAssets = [
            '/carpet-ninja.png',      // Logo
            '/favicon.png',           // Favicon
            '/carpet-ninja-car-3.png', // Hero car
            '/before-after.png',      // Before/After section
            '/service-deep-carpet-cleaning.png',
            '/service-upholstery-mattresses.png',
            '/service-stain-odor-removal.png',
        ]

        for (const asset of criticalAssets) {
            const response = await request.get(`${PROD_URL}${asset}`)
            expect(
                response.status(),
                `Asset ${asset} should return 200`
            ).toBe(200)
            console.log(`✅ ${asset} - OK`)
        }
    })

    test('service images should match service slugs', async ({ page }) => {
        await page.goto(PROD_URL, { waitUntil: 'networkidle' })

        // Get all service image sources
        const serviceImages = await page.evaluate(() => {
            const section = document.querySelector('#services')
            if (!section) return []
            const imgs = Array.from(section.querySelectorAll('img'))
            return imgs.map((img) => ({
                src: img.src,
                loaded: img.complete && img.naturalWidth > 0,
            }))
        })

        expect(serviceImages.length).toBeGreaterThan(0)

        for (const img of serviceImages) {
            expect(img.loaded, `Service image should load: ${img.src}`).toBe(true)
        }

        console.log(`✅ All ${serviceImages.length} service images loaded`)
    })
})
