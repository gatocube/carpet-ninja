import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function uploadImages() {
    console.log('🚀 Uploading images via browser automation...\n')
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        const publicDir = path.join(__dirname, '..', 'public')
        
        // All available images
        const images = [
            { file: 'carpet-ninja-car-3.png', alt: 'Carpet Ninja Van' },
            { file: 'carpet-ninja.png', alt: 'Carpet Ninja Logo' },
            { file: 'service-deep-carpet-cleaning.png', alt: 'Deep Carpet Cleaning Service' },
            { file: 'before.png', alt: 'Before Cleaning' },
            { file: 'after.png', alt: 'After Cleaning' },
        ]

        console.log('1️⃣ Logging in...')
        await page.goto('https://carpet-ninja.vercel.app/admin/login')
        await page.waitForLoadState('networkidle')
        await page.fill('input[name="email"]', 'admin@carpet-ninja.com')
        await page.fill('input[name="password"]', 'admin123')
        await page.click('button:has-text("Login")')
        await page.waitForURL('**/admin', { timeout: 10000 })
        console.log('   ✅ Logged in\n')

        console.log('2️⃣ Navigating to Media...')
        await page.goto('https://carpet-ninja.vercel.app/admin/collections/media')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        console.log('   ✅ Ready\n')

        // Upload each image individually
        for (const { file, alt } of images) {
            console.log(`3️⃣ Uploading: ${file}`)
            
            try {
                // Click Create New
                await page.click('a:has-text("Create new Media")', { timeout: 5000 })
                await page.waitForTimeout(2000)
                
                // Upload file
                const filePath = path.join(publicDir, file)
                const fileInput = page.locator('input[type="file"]').first()
                await fileInput.setInputFiles(filePath)
                console.log(`   📁 File selected`)
                
                await page.waitForTimeout(2000)
                
                // Fill alt text
                const altInput = page.locator('input[name="alt"]').first()
                await altInput.fill(alt)
                console.log(`   ✏️  Alt text: "${alt}"`)
                
                await page.waitForTimeout(1000)
                
                // Save
                await page.click('button:has-text("Save")')
                console.log(`   💾 Saving...`)
                
                await page.waitForTimeout(5000)
                console.log(`   ✅ Uploaded successfully\n`)
                
                // Go back to list
                await page.goto('https://carpet-ninja.vercel.app/admin/collections/media')
                await page.waitForLoadState('networkidle')
                await page.waitForTimeout(2000)
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`)
            }
        }

        console.log('🎉 All uploads complete!')
        console.log('\n📝 Check the media collection now:')
        console.log('   https://carpet-ninja.vercel.app/admin/collections/media')
        
        await page.waitForTimeout(3000)

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

uploadImages()
