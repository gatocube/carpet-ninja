#!/usr/bin/env node

/**
 * Upload images to production Payload CMS via API
 * This script reads images from /public and uploads them using multipart/form-data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import FormData from 'form-data'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const API_URL = process.env.API_URL || 'https://carpet-ninja.vercel.app'

// Images to upload
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
    console.log('🔐 Logging in to admin...')
    const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        }),
    })

    if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Logged in successfully\n')
    return data.token
}

async function uploadImage(token, imagePath, alt) {
    const filename = path.basename(imagePath)
    console.log(`📤 Uploading: ${filename}`)

    // Read file
    const fileBuffer = fs.readFileSync(imagePath)
    
    // Create form data
    const form = new FormData()
    form.append('file', fileBuffer, {
        filename,
        contentType: `image/${path.extname(filename).slice(1)}`,
    })
    form.append('alt', alt)

    try {
        const response = await fetch(`${API_URL}/api/media`, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${token}`,
                ...form.getHeaders(),
            },
            body: form,
        })

        if (!response.ok) {
            const error = await response.text()
            console.error(`   ❌ Failed: ${response.status} - ${error}`)
            return null
        }

        const data = await response.json()
        console.log(`   ✅ Uploaded: ${filename} (ID: ${data.doc.id})`)
        return data.doc
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`)
        return null
    }
}

async function connectImagesToCollections(token, uploadedImages) {
    console.log('\n🔗 Connecting images to collections...')

    // Update Services
    const servicesResponse = await fetch(`${API_URL}/api/services`, {
        headers: { 'Authorization': `JWT ${token}` },
    })
    const services = await servicesResponse.json()

    for (const service of services.docs) {
        let imageId = null
        
        if (service.slug === 'deep-carpet-cleaning') {
            imageId = uploadedImages['service-deep-carpet-cleaning.png']?.id
        } else if (service.slug === 'upholstery-mattresses') {
            imageId = uploadedImages['service-upholstery-mattreses.png']?.id
        } else if (service.slug === 'stain-odor-removal') {
            imageId = uploadedImages['service-stain-order-removal.png']?.id
        }

        if (imageId) {
            await fetch(`${API_URL}/api/services/${service.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageId }),
            })
            console.log(`   ✅ Connected image to: ${service.title}`)
        }
    }

    // Update Hero global
    const heroImageId = uploadedImages['carpet-ninja-car-3.png']?.id
    const logoId = uploadedImages['carpet-ninja.png']?.id

    if (heroImageId || logoId) {
        await fetch(`${API_URL}/api/globals/hero`, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                heroImage: heroImageId,
                logo: logoId,
            }),
        })
        console.log(`   ✅ Updated Hero global with car image and logo`)
    }

    // Update Before/After global
    const beforeImageId = uploadedImages['before.png']?.id
    const afterImageId = uploadedImages['after.png']?.id

    if (beforeImageId && afterImageId) {
        await fetch(`${API_URL}/api/globals/before-after`, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comparisons: [
                    {
                        title: 'Living Room Carpet',
                        beforeImage: beforeImageId,
                        afterImage: afterImageId,
                        description: 'Deep cleaning removed years of dirt and stains',
                    },
                ],
            }),
        })
        console.log(`   ✅ Updated Before/After gallery`)
    }

    console.log('\n✅ All images connected to collections!')
}

async function main() {
    console.log('🚀 Starting image upload to production...\n')

    try {
        // Login
        const token = await login()

        // Upload images
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

        // Connect images to collections
        await connectImagesToCollections(token, uploadedImages)

        console.log('\n🎉 Done! Check your admin panel: https://carpet-ninja.vercel.app/admin')
    } catch (error) {
        console.error('\n❌ Error:', error.message)
        process.exit(1)
    }
}

main()
