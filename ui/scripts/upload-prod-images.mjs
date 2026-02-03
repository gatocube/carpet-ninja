#!/usr/bin/env node

/**
 * Script to upload default images to production database
 * and connect them to existing collection items
 * 
 * Usage:
 *   node scripts/upload-prod-images.mjs
 * 
 * Requires production DATABASE_URL to be set
 */

import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function uploadImage(payload, imagePath, alt) {
    try {
        const fullPath = path.join(__dirname, '..', 'public', imagePath)
        
        if (!fs.existsSync(fullPath)) {
            console.log(`❌ Image not found: ${fullPath}`)
            return null
        }

        const buffer = fs.readFileSync(fullPath)
        const filename = path.basename(imagePath)

        // Check if image already exists
        const existing = await payload.find({
            collection: 'media',
            where: {
                filename: {
                    equals: filename,
                },
            },
            limit: 1,
        })

        if (existing.docs.length > 0) {
            console.log(`⏭️  Image already exists: ${filename}`)
            return existing.docs[0]
        }

        const media = await payload.create({
            collection: 'media',
            data: {
                alt,
            },
            file: {
                data: buffer,
                mimetype: `image/${path.extname(imagePath).slice(1)}`,
                name: filename,
                size: buffer.length,
            },
        })

        console.log(`✅ Uploaded: ${filename}`)
        return media
    } catch (error) {
        console.error(`❌ Failed to upload ${imagePath}:`, error.message)
        return null
    }
}

async function main() {
    console.log('🚀 Starting production image upload...\n')

    // Get Payload instance
    const payload = await getPayload({ config })
    
    console.log('📸 Uploading default images...\n')
    
    // Upload service images
    const serviceImages = {
        'deep-carpet-cleaning': await uploadImage(
            payload, 
            'service-deep-carpet-cleaning.png', 
            'Deep Carpet Cleaning Service'
        ),
        'upholstery-mattresses': await uploadImage(
            payload, 
            'service-upholstery-mattreses.png', 
            'Upholstery and Mattress Cleaning'
        ),
        'stain-odor-removal': await uploadImage(
            payload, 
            'service-stain-order-removal.png', 
            'Stain and Odor Removal Service'
        ),
    }
    
    // Upload hero images
    const heroImage = await uploadImage(
        payload, 
        'carpet-ninja-car-3.png', 
        'Carpet Ninja Van'
    )
    
    const logo = await uploadImage(
        payload, 
        'carpet-ninja.png', 
        'Carpet Ninja Logo'
    )
    
    // Upload before/after images
    const beforeImage = await uploadImage(
        payload, 
        'before.png', 
        'Before Cleaning'
    )
    
    const afterImage = await uploadImage(
        payload, 
        'after.png', 
        'After Cleaning'
    )
    
    console.log('\n🔗 Connecting images to collection items...\n')
    
    // Update services with images
    const services = await payload.find({
        collection: 'services',
        limit: 100,
    })
    
    for (const service of services.docs) {
        const imageKey = service.slug
        const image = serviceImages[imageKey]
        
        if (image && !service.image) {
            await payload.update({
                collection: 'services',
                id: service.id,
                data: {
                    image: image.id,
                },
            })
            console.log(`✅ Connected image to service: ${service.title}`)
        }
    }
    
    // Update Hero global
    const hero = await payload.findGlobal({
        slug: 'hero',
    })
    
    if (!hero.heroImage && heroImage) {
        await payload.updateGlobal({
            slug: 'hero',
            data: {
                heroImage: heroImage.id,
                logo: logo?.id,
            },
        })
        console.log(`✅ Connected images to Hero global`)
    }
    
    // Update BeforeAfter global
    const beforeAfter = await payload.findGlobal({
        slug: 'before-after',
    })
    
    if ((!beforeAfter.comparisons || beforeAfter.comparisons.length === 0) && beforeImage && afterImage) {
        await payload.updateGlobal({
            slug: 'before-after',
            data: {
                sectionTitle: 'See the Difference',
                sectionSubtitle: 'Real results from Bay Area homes',
                comparisons: [
                    {
                        title: 'Living Room Carpet',
                        beforeImage: beforeImage.id,
                        afterImage: afterImage.id,
                        description: 'Deep cleaning removed years of dirt and stains',
                    },
                ],
            },
        })
        console.log(`✅ Connected images to Before/After global`)
    }
    
    console.log('\n✅ All images uploaded and connected!')
    console.log('\n📝 Summary:')
    console.log(`   - Service images: ${Object.values(serviceImages).filter(Boolean).length}/3`)
    console.log(`   - Hero images: ${heroImage && logo ? '2/2' : '1/2'}`)
    console.log(`   - Before/After images: ${beforeImage && afterImage ? '2/2' : '0/2'}`)
    console.log('\n🎉 Done! Check your admin panel.')
    
    process.exit(0)
}

main().catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
})
