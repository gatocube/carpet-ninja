import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function bulkUpload() {
    console.log('🚀 Bulk uploading images to production...\n')
    
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

        console.log('1️⃣ Navigating to media page...')
        await page.goto('https://carpet-ninja.vercel.app/admin/collections/media')
        await page.waitForLoadState('networkidle')
        
        console.log('2️⃣ Opening bulk upload...')
        await page.click('button:has-text("Bulk Upload")')
        await page.waitForTimeout(2000)
        
        console.log('3️⃣ Selecting all 7 images...')
        // Find the file input and upload all files at once
        const fileInput = page.locator('input[type="file"]').first()
        await fileInput.setInputFiles(imagePaths)
        
        console.log('4️⃣ Waiting for upload to complete...')
        await page.waitForTimeout(10000) // Wait for all uploads
        
        console.log('✅ All images uploaded!')
        console.log('\n📝 Images uploaded:')
        imagePaths.forEach(p => console.log(`   - ${path.basename(p)}`))
        
        console.log('\n🎉 Done! Closing browser...')
        await page.waitForTimeout(5000)

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

bulkUpload()
