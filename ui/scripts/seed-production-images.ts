/**
 * Seed production images using Payload's Local API
 * This is the proper way to upload files programmatically
 * Run with: npx tsx scripts/seed-production-images.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seedImages() {
    console.log('🚀 Starting production image seeding...\n')

    try {
        // Initialize Payload
        console.log('⚡ Initializing Payload...')
        const payload = await getPayload({ config })
        console.log('✅ Payload initialized\n')

        const publicDir = path.resolve(__dirname, '..', 'public')

        // Upload images using Local API with filePath
        console.log('📸 Uploading images...\n')

        const heroImage = await payload.create({
            collection: 'media',
            data: {
                alt: 'Carpet Ninja Van',
            },
            filePath: path.join(publicDir, 'carpet-ninja-car-3.png'),
        })
        console.log(`✅ Uploaded: carpet-ninja-car-3.png (ID: ${heroImage.id})`)

        const logo = await payload.create({
            collection: 'media',
            data: {
                alt: 'Carpet Ninja Logo',
            },
            filePath: path.join(publicDir, 'carpet-ninja.png'),
        })
        console.log(`✅ Uploaded: carpet-ninja.png (ID: ${logo.id})`)

        const serviceDeep = await payload.create({
            collection: 'media',
            data: {
                alt: 'Deep Carpet Cleaning Service',
            },
            filePath: path.join(publicDir, 'service-deep-carpet-cleaning.png'),
        })
        console.log(`✅ Uploaded: service-deep-carpet-cleaning.png (ID: ${serviceDeep.id})`)

        const serviceUpholstery = await payload.create({
            collection: 'media',
            data: {
                alt: 'Upholstery and Mattress Cleaning',
            },
            filePath: path.join(publicDir, 'service-upholstery-mattreses.png'),
        })
        console.log(`✅ Uploaded: service-upholstery-mattreses.png (ID: ${serviceUpholstery.id})`)

        const serviceStain = await payload.create({
            collection: 'media',
            data: {
                alt: 'Stain and Odor Removal Service',
            },
            filePath: path.join(publicDir, 'service-stain-order-removal.png'),
        })
        console.log(`✅ Uploaded: service-stain-order-removal.png (ID: ${serviceStain.id})`)

        const beforeImage = await payload.create({
            collection: 'media',
            data: {
                alt: 'Before Cleaning',
            },
            filePath: path.join(publicDir, 'before.png'),
        })
        console.log(`✅ Uploaded: before.png (ID: ${beforeImage.id})`)

        const afterImage = await payload.create({
            collection: 'media',
            data: {
                alt: 'After Cleaning',
            },
            filePath: path.join(publicDir, 'after.png'),
        })
        console.log(`✅ Uploaded: after.png (ID: ${afterImage.id})`)

        console.log('\n🔗 Connecting images to collections...\n')

        // Update Services with images
        const services = await payload.find({
            collection: 'services',
            limit: 100,
        })

        for (const service of services.docs) {
            let imageId = null

            if (service.slug === 'deep-carpet-cleaning') {
                imageId = serviceDeep.id
            } else if (service.slug === 'upholstery-mattresses') {
                imageId = serviceUpholstery.id
            } else if (service.slug === 'stain-odor-removal') {
                imageId = serviceStain.id
            }

            if (imageId) {
                await payload.update({
                    collection: 'services',
                    id: service.id,
                    data: {
                        image: imageId,
                    },
                })
                console.log(`✅ Connected image to service: ${service.title}`)
            }
        }

        // Update Hero global
        await payload.updateGlobal({
            slug: 'hero',
            data: {
                heroImage: heroImage.id,
                logo: logo.id,
            },
        })
        console.log(`✅ Updated Hero global with car image and logo`)

        // Update Before/After global
        await payload.updateGlobal({
            slug: 'before-after',
            data: {
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
        console.log(`✅ Updated Before/After gallery`)

        console.log('\n🎉 Production seeding complete!')
        console.log('✅ All images uploaded and connected')
        console.log('\n📝 Check your admin panel:')
        console.log('   https://carpet-ninja.vercel.app/admin/collections/media')

        process.exit(0)
    } catch (error) {
        console.error('\n❌ Error:', error)
        process.exit(1)
    }
}

seedImages()
