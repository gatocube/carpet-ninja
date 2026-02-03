import { chromium } from 'playwright'

const BASE_URL = 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = 'admin123'

async function connectImages() {
    console.log('🔗 Connecting images to collections...\n')
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        // Login
        console.log('1️⃣ Logging in...')
        await page.goto(`${BASE_URL}/admin/login`)
        await page.waitForLoadState('networkidle')
        
        await page.fill('input[name="email"]', ADMIN_EMAIL)
        await page.fill('input[name="password"]', ADMIN_PASSWORD)
        await page.click('button:has-text("Login")')
        
        await page.waitForURL('**/admin', { timeout: 10000 })
        console.log('   ✅ Logged in\n')

        // Get all services
        await page.goto(`${BASE_URL}/admin/collections/services`)
        await page.waitForLoadState('networkidle')
        
        // Edit each service and add image
        const serviceLinks = await page.locator('a[href*="/admin/collections/services/"]').all()
        
        for (const link of serviceLinks) {
            const href = await link.getAttribute('href')
            if (!href || href.includes('create')) continue
            
            console.log(`\n📝 Editing service...`)
            await page.goto(`${BASE_URL}${href}`)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(2000)
            
            // Check service slug/title
            const titleInput = page.locator('input[name="title"]').first()
            const title = await titleInput.inputValue()
            console.log(`   Service: ${title}`)
            
            // Click on image field to open media selector
            const imageButton = page.locator('button:has-text("Select")').first()
            if (await imageButton.count() > 0) {
                await imageButton.click()
                await page.waitForTimeout(2000)
                
                // Select appropriate image based on service name
                let imageName = ''
                if (title.includes('Deep Carpet')) {
                    imageName = 'service-deep-carpet-cleaning'
                } else if (title.includes('Upholstery')) {
                    imageName = 'service-upholstery-mattreses'
                } else if (title.includes('Stain')) {
                    imageName = 'service-stain-order-removal'
                }
                
                if (imageName) {
                    const imageCard = page.locator(`[alt*="${imageName}"]`).first()
                    if (await imageCard.count() > 0) {
                        await imageCard.click()
                        await page.waitForTimeout(1000)
                        
                        // Click Select button in modal
                        await page.locator('button:has-text("Select")').last().click()
                        await page.waitForTimeout(1000)
                        
                        // Save
                        await page.click('button:has-text("Save")')
                        await page.waitForTimeout(3000)
                        
                        console.log(`   ✅ Connected image: ${imageName}`)
                    }
                }
            }
        }

        // Update Hero global
        console.log('\n📝 Updating Hero global...')
        await page.goto(`${BASE_URL}/admin/globals/hero`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        // Set hero image
        const heroImageButton = page.locator('button:has-text("Select")').first()
        if (await heroImageButton.count() > 0) {
            await heroImageButton.click()
            await page.waitForTimeout(2000)
            
            const carImage = page.locator('[alt*="Carpet Ninja Van"]').first()
            if (await carImage.count() > 0) {
                await carImage.click()
                await page.waitForTimeout(1000)
                await page.locator('button:has-text("Select")').last().click()
                await page.waitForTimeout(1000)
            }
        }
        
        // Set logo
        const logoButton = page.locator('button:has-text("Select")').nth(1)
        if (await logoButton.count() > 0) {
            await logoButton.click()
            await page.waitForTimeout(2000)
            
            const logoImage = page.locator('[alt*="Logo"]').first()
            if (await logoImage.count() > 0) {
                await logoImage.click()
                await page.waitForTimeout(1000)
                await page.locator('button:has-text("Select")').last().click()
                await page.waitForTimeout(1000)
            }
        }
        
        await page.click('button:has-text("Save")')
        await page.waitForTimeout(3000)
        console.log('   ✅ Hero images connected')

        // Update Before/After global
        console.log('\n📝 Updating Before/After gallery...')
        await page.goto(`${BASE_URL}/admin/globals/before-after`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        // Add comparison if not exists
        const addButton = page.locator('button:has-text("Add Comparison")').first()
        if (await addButton.count() > 0) {
            await addButton.click()
            await page.waitForTimeout(1000)
            
            // Fill title
            await page.locator('input[name*="title"]').last().fill('Living Room Carpet')
            
            // Select before image
            const beforeButton = page.locator('button:has-text("Select")').filter({ hasText: /Before Image|Select/ }).first()
            if (await beforeButton.count() > 0) {
                await beforeButton.click()
                await page.waitForTimeout(2000)
                const beforeImg = page.locator('[alt*="Before"]').first()
                if (await beforeImg.count() > 0) {
                    await beforeImg.click()
                    await page.waitForTimeout(1000)
                    await page.locator('button:has-text("Select")').last().click()
                    await page.waitForTimeout(1000)
                }
            }
            
            // Select after image
            const afterButton = page.locator('button:has-text("Select")').filter({ hasText: /After Image|Select/ }).first()
            if (await afterButton.count() > 0) {
                await afterButton.click()
                await page.waitForTimeout(2000)
                const afterImg = page.locator('[alt*="After"]').first()
                if (await afterImg.count() > 0) {
                    await afterImg.click()
                    await page.waitForTimeout(1000)
                    await page.locator('button:has-text("Select")').last().click()
                    await page.waitForTimeout(1000)
                }
            }
            
            // Add description
            await page.locator('textarea[name*="description"]').last().fill('Deep cleaning removed years of dirt and stains')
            
            await page.click('button:has-text("Save")')
            await page.waitForTimeout(3000)
            console.log('   ✅ Before/After images connected')
        }

        console.log('\n🎉 All images connected to collections!')
        console.log('\n✅ Visit your website to see the images:')
        console.log('   https://carpet-ninja.vercel.app')

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

connectImages()
