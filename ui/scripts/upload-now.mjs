#!/usr/bin/env node

/**
 * Upload images to production using REST API
 * This works with Node.js 18+ native fetch
 */

import https from 'https'
import { Readable } from 'stream'

const API_URL = 'https://carpet-ninja.vercel.app'
const ADMIN_EMAIL = 'admin@carpet-ninja.com'
const ADMIN_PASSWORD = 'admin123'

const IMAGES = [
    { file: 'carpet-ninja-car-3.png', alt: 'Carpet Ninja Van' },
    { file: 'carpet-ninja.png', alt: 'Carpet Ninja Logo' },
    { file: 'service-deep-carpet-cleaning.png', alt: 'Deep Carpet Cleaning Service' },
    { file: 'service-upholstery-mattreses.png', alt: 'Upholstery and Mattress Cleaning' },
    { file: 'service-stain-order-removal.png', alt: 'Stain and Odor Removal Service' },
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

async function fetchImageBuffer(filename) {
    const url = `${API_URL}/${filename}`
    console.log(`📥 Fetching: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

async function uploadImage(token, filename, alt) {
    try {
        console.log(`\n📤 Uploading: ${filename}`)
        
        // Fetch the image from public URL
        const imageBuffer = await fetchImageBuffer(filename)
        console.log(`   ✅ Fetched (${imageBuffer.length} bytes)`)
        
        // Create multipart form data manually
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36)
        const ext = filename.split('.').pop()
        const mimeType = `image/${ext}`
        
        const parts = []
        
        // Add file part
        parts.push(`--${boundary}\r\n`)
        parts.push(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`)
        parts.push(`Content-Type: ${mimeType}\r\n\r\n`)
        parts.push(imageBuffer)
        parts.push('\r\n')
        
        // Add alt text part
        parts.push(`--${boundary}\r\n`)
        parts.push(`Content-Disposition: form-data; name="alt"\r\n\r\n`)
        parts.push(alt)
        parts.push('\r\n')
        
        parts.push(`--${boundary}--\r\n`)
        
        // Combine parts
        const body = Buffer.concat(
            parts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
        )
        
        const response = await fetch(`${API_URL}/api/media`, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length.toString(),
            },
            body: body,
        })

        if (!response.ok) {
            const text = await response.text()
            console.error(`   ❌ Upload failed: ${text}`)
            return null
        }

        const data = await response.json()
        console.log(`   ✅ Uploaded successfully (ID: ${data.doc.id})`)
        return data.doc
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`)
        return null
    }
}

async function main() {
    console.log('🚀 Starting image upload to production...\n')

    try {
        const token = await login()
        const uploaded = []

        for (const { file, alt } of IMAGES) {
            const result = await uploadImage(token, file, alt)
            if (result) {
                uploaded.push({ file, id: result.id })
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('🎉 Upload Summary')
        console.log('='.repeat(50))
        console.log(`✅ Successfully uploaded: ${uploaded.length}/${IMAGES.length} images\n`)
        
        if (uploaded.length > 0) {
            console.log('📝 Uploaded images:')
            uploaded.forEach(({ file, id }) => {
                console.log(`   ✓ ${file} (ID: ${id})`)
            })
            console.log('\n📍 View in admin panel:')
            console.log('   https://carpet-ninja.vercel.app/admin/collections/media')
        }

        process.exit(uploaded.length === IMAGES.length ? 0 : 1)
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message)
        process.exit(1)
    }
}

main()
