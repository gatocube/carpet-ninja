import { chromium } from 'playwright'

const BASE_URL = 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = 'admin123'

async function enableDevMode() {
    console.log('🚀 Starting automated Development Mode activation...\n')
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        // Login
        console.log('1️⃣ Logging in to admin panel...')
        await page.goto(`${BASE_URL}/admin/login`)
        await page.waitForLoadState('networkidle')
        
        await page.fill('input[name="email"]', ADMIN_EMAIL)
        await page.fill('input[name="password"]', ADMIN_PASSWORD)
        await page.click('button:has-text("Login")')
        
        await page.waitForURL('**/admin', { timeout: 10000 })
        console.log('   ✅ Logged in successfully\n')

        // Navigate to Development Settings
        console.log('2️⃣ Navigating to Development Settings...')
        await page.goto(`${BASE_URL}/admin/globals/development-settings`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        console.log('   ✅ Page loaded\n')

        // Enable Development Mode checkbox
        console.log('3️⃣ Enabling Development Mode...')
        const devModeCheckbox = page.locator('input[name="isDevelopment"]').first()
        const isChecked = await devModeCheckbox.isChecked()
        
        if (!isChecked) {
            await devModeCheckbox.check()
            console.log('   ✅ Development Mode enabled')
        } else {
            console.log('   ℹ️  Development Mode already enabled')
        }
        
        await page.waitForTimeout(1000)

        // Enable Force Reseed checkbox
        console.log('4️⃣ Enabling Force Reseed on Next Start...')
        const forceReseedCheckbox = page.locator('input[name="forceReseedOnNextStart"]').first()
        const isReseedChecked = await forceReseedCheckbox.isChecked()
        
        if (!isReseedChecked) {
            await forceReseedCheckbox.check()
            console.log('   ✅ Force Reseed enabled')
        } else {
            console.log('   ℹ️  Force Reseed already enabled')
        }
        
        await page.waitForTimeout(1000)

        // Save
        console.log('5️⃣ Saving settings...')
        const saveButton = page.locator('button:has-text("Save")').first()
        await saveButton.click()
        await page.waitForTimeout(3000)
        console.log('   ✅ Settings saved\n')

        console.log('✅ Development Mode enabled successfully!')
        console.log('\n📝 Next steps:')
        console.log('   1. Deploy to production: vercel --prod')
        console.log('   2. Database will be reset and reseeded with images')
        console.log('   3. Both admin users will be created')
        console.log('   4. All images will be uploaded and connected')

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await browser.close()
    }
}

enableDevMode()
