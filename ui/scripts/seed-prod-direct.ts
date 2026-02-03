/**
 * Direct production seeding script
 * Connects to production database and seeds images
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seedProduction() {
    console.log('🚀 Seeding production database with images...\n')

    try {
        console.log('⚡ Initializing Payload...')
        const payload = await getPayload({ config })
        console.log('✅ Payload initialized\n')

        const publicUrl = 'https://carpet-ninja.vercel.app'

        // Upload images by fetching from public URL
        console.log('📸 Uploading images...\n')

        async function uploadImage(filename: string, alt: string) {
            try {
                const url = `${publicUrl}/${filename}`
                console.log(`📥 Fetching: ${url}`)
                
                const response = await fetch(url)
                if (!response.ok) {
                    console.log(`   ❌ Failed to fetch: ${response.statusText}`)
                    return null
                }
                
                const arrayBuffer = await response.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                
                const media = await payload.create({
                    collection: 'media',
                    data: { alt },
                    file: {
                        data: buffer,
                        mimetype: `image/${path.extname(filename).slice(1)}`,
                        name: filename,
                        size: buffer.length,
                    },
                })
                
                console.log(`   ✅ Uploaded: ${filename} (ID: ${media.id})`)
                return media
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`)
                return null
            }
        }

        const heroImage = await uploadImage('carpet-ninja-car-3.png', 'Carpet Ninja Van')
        const logo = await uploadImage('carpet-ninja.png', 'Carpet Ninja Logo')
        const serviceDeep = await uploadImage('service-deep-carpet-cleaning.png', 'Deep Carpet Cleaning Service')
        const serviceUpholstery = await uploadImage('service-upholstery-mattreses.png', 'Upholstery and Mattress Cleaning')
        const serviceStain = await uploadImage('service-stain-order-removal.png', 'Stain and Odor Removal Service')
        const beforeImage = await uploadImage('before.png', 'Before Cleaning')
        const afterImage = await uploadImage('after.png', 'After Cleaning')

        console.log('\n🔗 Connecting images to collections...\n')

        // Update Services
        const services = await payload.find({
            collection: 'services',
            limit: 100,
        })

        for (const service of services.docs) {
            let imageId = null
            if (service.slug === 'deep-carpet-cleaning' && serviceDeep) imageId = serviceDeep.id
            else if (service.slug === 'upholstery-mattresses' && serviceUpholstery) imageId = serviceUpholstery.id
            else if (service.slug === 'stain-odor-removal' && serviceStain) imageId = serviceStain.id

            if (imageId) {
                await payload.update({
                    collection: 'services',
                    id: service.id,
                    data: { image: imageId },
                })
                console.log(`✅ Connected image to: ${service.title}`)
            }
        }

        // Update Hero
        if (heroImage && logo) {
            await payload.updateGlobal({
                slug: 'hero',
                data: {
                    heroImage: heroImage.id,
                    logo: logo.id,
                },
            })
            console.log(`✅ Updated Hero global`)
        }

        // Update Before/After
        if (beforeImage && afterImage) {
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
        }

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

seedProduction()
