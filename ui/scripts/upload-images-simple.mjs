#!/usr/bin/env node

/**
 * Simple image upload using Payload's REST API with native fetch
 * Uses correct multipart/form-data format
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Blob } from 'buffer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://carpet-ninja.vercel.app'
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

async function login() {
    console.log('🔐 Logging in...')
    const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })

    if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Logged in\n')
    return data.token
}

async function uploadImage(token, imagePath, alt) {
    const filename = path.basename(imagePath)
    console.log(`📤 Uploading: ${filename}`)

    // Read file as buffer
    const buffer = fs.readFileSync(imagePath)
    const blob = new Blob([buffer], { type: `image/${path.extname(filename).slice(1)}` })
    
    // Create FormData with native implementation
    const formData = new FormData()
    formData.append('file', blob, filename)
    formData.append('alt', alt)

    const response = await fetch(`${API_URL}/api/media`, {
        method: 'POST',
        headers: {
            'Authorization': `JWT ${token}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.text()
        console.error(`   ❌ Failed: ${error}`)
        return null
    }

    const data = await response.json()
    console.log(`   ✅ Uploaded (ID: ${data.doc.id})`)
    return data.doc
}

async function main() {
    console.log('🚀 Starting image upload to production...\n')

    try {
        const token = await login()
        const publicDir = path.join(__dirname, '..', 'public')
        const uploadedImages = {}

        for (const { file, alt } of IMAGES) {
            const imagePath = path.join(publicDir, file)
            
            if (!fs.existsSync(imagePath)) {
                console.log(`⚠️  Skipping ${file} (not found)`)
                continue
            }

            const result = await uploadImage(token, imagePath, alt)
            if (result) {
                uploadedImages[file] = result
            }
        }

        console.log('\n🎉 Upload complete!')
        console.log(`✅ Uploaded ${Object.keys(uploadedImages).length} images`)
        console.log('\n📝 Now you can connect them in the admin panel:')
        console.log('   https://carpet-ninja.vercel.app/admin')
    } catch (error) {
        console.error('\n❌ Error:', error.message)
        process.exit(1)
    }
}

main()
