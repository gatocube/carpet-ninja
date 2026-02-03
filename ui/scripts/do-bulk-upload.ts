import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function doBulkUpload() {
    console.log('🚀 Uploading images to production...\n')
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        const publicDir = path.join(__dirname, '..', 'public')
        const imagePaths = [
            path.join(publicDir, 'service-deep-carpet-cleaning.png'),
            path.join(publicDir, 'service-upholstery-mattreses.png'),
            path.join(publicDir, 'service-stain-order-removal.png'),
            path.join(publicDir, 'carpet-ninja-car-3.png'),
            path.join(publicDir, 'carpet-ninja.png'),
            path.join(publicDir, 'before.png'),
            path.join(publicDir, 'after.png'),
        ]

        console.log('1️⃣ Logging in...')
        await page.goto('https://carpet-ninja.vercel.app/admin/login')
        await page.waitForLoadState('networkidle')
        await page.fill('input[name="email"]', 'admin@carpet-ninja.com')
        await page.fill('input[name="password"]', 'admin123')
        await page.click('button:has-text("Login")')
        await page.waitForURL('**/admin', { timeout: 10000 })
        console.log('   ✅ Logged in\n')

        console.log('2️⃣ Going to Media collection...')
        await page.goto('https://carpet-ninja.vercel.app/admin/collections/media')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        console.log('3️⃣ Opening bulk upload modal...')
        await page.click('button:has-text("Bulk Upload")')
        await page.waitForTimeout(2000)
        
        console.log('4️⃣ Uploading all 7 images at once...')
        const fileInput = page.locator('input[type="file"]').first()
        await fileInput.setInputFiles(imagePaths)
        
        console.log('5️⃣ Waiting for uploads to complete...')
        await page.waitForTimeout(15000) // Wait for all 7 images
        
        console.log('\n✅ Upload complete!')
        console.log('\n📝 Images uploaded:')
        imagePaths.forEach(p => console.log(`   ✓ ${path.basename(p)}`))
        
        console.log('\n🎉 Done! Check the admin panel now.')
        await page.waitForTimeout(3000)

    } catch (error) {
        console.error('\n❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

doBulkUpload()
