import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = 'admin123'

const IMAGES = [
    { file: 'service-deep-carpet-cleaning.png', alt: 'Deep Carpet Cleaning Service' },
    { file: 'service-upholstery-mattreses.png', alt: 'Upholstery and Mattress Cleaning' },
    { file: 'service-stain-order-removal.png', alt: 'Stain and Odor Removal Service' },
    { file: 'carpet-ninja-car-3.png', alt: 'Carpet Ninja Van' },
    { file: 'carpet-ninja.png', alt: 'Carpet Ninja Logo' },
    { file: 'before.png', alt: 'Before Cleaning' },
    { file: 'after.png', alt: 'After Cleaning' },
]

async function uploadImages() {
    console.log('🚀 Starting image upload via browser automation...\n')
    
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

        // Upload each image
        const publicDir = path.join(__dirname, '..', 'public')
        
        for (const { file, alt } of IMAGES) {
            const imagePath = path.join(publicDir, file)
            
            console.log(`📤 Uploading: ${file}`)
            
            // Navigate to media upload page
            await page.goto(`${BASE_URL}/admin/collections/media/create`)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(1000)
            
            // Find and click the file upload button
            const fileInput = page.locator('input[type="file"]').first()
            await fileInput.setInputFiles(imagePath)
            
            // Wait for file to be processed
            await page.waitForTimeout(2000)
            
            // Fill in alt text
            const altInput = page.locator('input[name="alt"]').first()
            await altInput.fill(alt)
            
            // Save
            await page.click('button:has-text("Save")')
            await page.waitForTimeout(3000)
            
            console.log(`   ✅ Uploaded: ${file}`)
        }

        console.log('\n🎉 All images uploaded successfully!')
        console.log('\n📝 Now connecting images to collections...')
        
        // Connect images to Services
        await page.goto(`${BASE_URL}/admin/collections/services`)
        await page.waitForLoadState('networkidle')
        
        const services = await page.locator('a[href*="/admin/collections/services/"]').all()
        console.log(`\n   Found ${services.length} services to update`)

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

uploadImages()
