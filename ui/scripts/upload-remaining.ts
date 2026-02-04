import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function uploadRemaining() {
    console.log('🚀 Uploading remaining service images...\n')
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        const publicDir = path.join(__dirname, '..', 'public')
        
        const images = [
            { file: 'service-upholstery-mattresses.png', alt: 'Upholstery and Mattress Cleaning' },
            { file: 'service-stain-odor-removal.png', alt: 'Stain and Odor Removal Service' },
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

        for (const { file, alt } of images) {
            console.log(`3️⃣ Uploading: ${file}`)
            
            try {
                await page.click('a:has-text("Create new Media")')
                await page.waitForTimeout(2000)
                
                const filePath = path.join(publicDir, file)
                const fileInput = page.locator('input[type="file"]').first()
                await fileInput.setInputFiles(filePath)
                console.log(`   📁 File selected`)
                
                await page.waitForTimeout(2000)
                
                const altInput = page.locator('input[name="alt"]').first()
                await altInput.fill(alt)
                console.log(`   ✏️  Alt text: "${alt}"`)
                
                await page.waitForTimeout(1000)
                
                await page.click('button:has-text("Save")')
                console.log(`   💾 Saving...`)
                
                await page.waitForTimeout(5000)
                console.log(`   ✅ Uploaded\n`)
                
                await page.goto('https://carpet-ninja.vercel.app/admin/collections/media')
                await page.waitForLoadState('networkidle')
                await page.waitForTimeout(2000)
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`)
            }
        }

        console.log('✅ All service images uploaded!')
        await page.waitForTimeout(2000)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await browser.close()
    }
}

uploadRemaining()
