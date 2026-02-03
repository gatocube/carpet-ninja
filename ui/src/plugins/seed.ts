import type { Payload, Config } from 'payload'
import fs from 'fs'
import path from 'path'

interface SeedPluginOptions {
    /**
     * Whether to run seeding in production (default: false)
     */
    runInProduction?: boolean
}

/**
 * Helper to upload an image from the public folder to Media collection
 */
async function uploadImage(payload: Payload, filename: string, alt: string): Promise<number | null> {
    try {
        const publicDir = path.join(process.cwd(), 'public')
        const filePath = path.join(publicDir, filename)

        if (!fs.existsSync(filePath)) {
            payload.logger.warn(`Image not found: ${filePath}`)
            return null
        }

        const fileBuffer = fs.readFileSync(filePath)

        const mediaDoc = await payload.create({
            collection: 'media',
            data: {
                alt: alt,
            },
            file: {
                data: fileBuffer,
                name: filename,
                mimetype: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
                size: fileBuffer.length,
            },
        })

        payload.logger.info(`✅ Uploaded image: ${filename}`)
        return mediaDoc.id as number
    } catch (error) {
        payload.logger.error(`❌ Failed to upload ${filename}: ${error instanceof Error ? error.message : String(error)}`)
        return null
    }
}

/**
 * Seed plugin that populates minimal test data on first run
 * Uses Payload's onInit hook to check and seed data
 */
export const seedPlugin = (options: SeedPluginOptions = {}) => {
    return (incomingConfig: Config): Config => {
        const existingOnInit = incomingConfig.onInit

        return {
            ...incomingConfig,
            onInit: async (payload: Payload) => {
                // Call existing onInit if present
                if (existingOnInit) {
                    await existingOnInit(payload)
                }

                // Skip in production unless explicitly enabled
                if (process.env.NODE_ENV === 'production' && !options.runInProduction) {
                    return
                }

                // Check if we should seed (only if collections are empty)
                await seedIfEmpty(payload)
            },
        }
    }
}

/**
 * Ensure a default admin user exists for development
 */
async function ensureAdminUser(payload: Payload) {
    const admins = [
        {
            email: process.env.PAYLOAD_ADMIN_EMAIL || 'admin@carpet-ninja.com',
            password: process.env.PAYLOAD_ADMIN_PASSWORD || 'admin123',
            roles: ['admin'],
        },
        {
            email: 'alex@carpet-ninja.com',
            password: 'barducks',
            roles: ['admin'],
        },
        {
            email: 'giorgi2510774@mail.ru',
            password: 'spaghetti39pass',
            roles: ['admin'],
        },
        {
            email: 'agagent@carpet-ninja.com',
            password: 'AgAgent2026!',
            roles: ['admin'],
        }
    ]

    for (const admin of admins) {
        try {
            const existingUsers = await payload.find({
                collection: 'users',
                where: {
                    email: { equals: admin.email },
                },
                limit: 1,
            })

            if (existingUsers.totalDocs === 0) {
                await payload.create({
                    collection: 'users',
                    data: {
                        email: admin.email,
                        password: admin.password,
                        roles: admin.roles,
                    },
                })
                payload.logger.info(`✅ Admin user created: ${admin.email}`)
            } else {
                payload.logger.info(`Admin user already exists: ${admin.email}`)
            }
        } catch (error) {
            payload.logger.error(`❌ Failed to create admin user ${admin.email}: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
}

async function seedIfEmpty(payload: Payload) {
    // Always ensure admin user exists
    await ensureAdminUser(payload)

    // Check if media collection is empty - if so, we need to upload images
    const existingMedia = await payload.find({
        collection: 'media',
        limit: 1,
    })

    // Check if any services exist
    const existingServices = await payload.find({
        collection: 'services',
        limit: 10,
    })

    const needsImages = existingMedia.totalDocs === 0
    const needsContent = existingServices.totalDocs === 0

    if (!needsImages && !needsContent) {
        payload.logger.info('Data and images already exist, skipping seed')
        return
    }

    // Upload images if needed
    let logoId: number | null = null
    let faviconId: number | null = null
    let beforeAfterId: number | null = null
    let service1ImageId: number | null = null
    let service2ImageId: number | null = null
    let service3ImageId: number | null = null

    if (needsImages) {
        payload.logger.info('Uploading images...')
        logoId = await uploadImage(payload, 'carpet-ninja.png', 'Carpet Ninja Logo')
        faviconId = await uploadImage(payload, 'favicon.png', 'Favicon')
        beforeAfterId = await uploadImage(payload, 'before-after.png', 'Before and After Cleaning')
        service1ImageId = await uploadImage(payload, 'service-deep-carpet-cleaning.png', 'Deep Carpet Cleaning')
        service2ImageId = await uploadImage(payload, 'service-upholstery-mattresses.png', 'Upholstery and Mattresses')
        service3ImageId = await uploadImage(payload, 'service-stain-odor-removal.png', 'Stain and Odor Removal')

        // Update site settings with images
        await payload.updateGlobal({
            slug: 'site-settings',
            data: {
                logo: logoId,
                favicon: faviconId,
                beforeAfterImage: beforeAfterId,
            },
        })
        payload.logger.info('✅ Site settings updated with images')

        // Update existing services with images if they exist but don't have images
        if (existingServices.totalDocs > 0) {
            const imageMap: Record<string, number | null> = {
                'deep-carpet-cleaning': service1ImageId,
                'upholstery-mattresses': service2ImageId,
                'stain-odor-removal': service3ImageId,
            }

            for (const service of existingServices.docs) {
                const imageId = imageMap[service.slug as string]
                if (imageId && !service.image) {
                    await payload.update({
                        collection: 'services',
                        id: service.id,
                        data: { image: imageId },
                    })
                    payload.logger.info(`✅ Updated service "${service.title}" with image`)
                }
            }
        }
    }

    // Seed full content if needed
    if (!needsContent) {
        payload.logger.info('Content already exists, only uploaded images')
        return
    }

    payload.logger.info('Seeding initial data...')

    try {
        // If we didn't upload images above, do it now
        if (!needsImages) {
            logoId = await uploadImage(payload, 'carpet-ninja.png', 'Carpet Ninja Logo')
            faviconId = await uploadImage(payload, 'favicon.png', 'Favicon')
            beforeAfterId = await uploadImage(payload, 'before-after.png', 'Before and After Cleaning')
            service1ImageId = await uploadImage(payload, 'service-deep-carpet-cleaning.png', 'Deep Carpet Cleaning')
            service2ImageId = await uploadImage(payload, 'service-upholstery-mattresses.png', 'Upholstery and Mattresses')
            service3ImageId = await uploadImage(payload, 'service-stain-odor-removal.png', 'Stain and Odor Removal')
        }

        // Seed SiteSettings global with images
        await payload.updateGlobal({
            slug: 'site-settings',
            data: {
                phone: '(415) 123-4567',
                email: 'hello@carpet-ninja.com',
                instagram: '@carpet.ninja',
                tagline: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
                cities: [
                    { name: 'San Francisco' },
                    { name: 'San Mateo' },
                    { name: 'San Jose' },
                    { name: 'Palo Alto' },
                    { name: 'Mountain View' },
                    { name: 'Sunnyvale' },
                    { name: 'Fremont' },
                    { name: 'Oakland' },
                ],
                logo: logoId,
                favicon: faviconId,
                beforeAfterImage: beforeAfterId,
                mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253749.89588270477!2d-122.67501791888054!3d37.75781499767964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e2a7f2a2a4d%3A0x31d05b0f6e5c1d2!2sSan%20Francisco%20Bay%20Area!5e0!3m2!1sen!2sus!4v1716944550000',
            },
        })

        // Seed Hero global
        await payload.updateGlobal({
            slug: 'hero',
            data: {
                headline: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
                subheadline: "We're a mobile, pro-grade cleaning team serving the Bay Area, CA. Eco-friendly detergents, industrial extractors, and ninja-level attention to detail. 🥷✨",
                ctaText: 'Book Now',
                badges: [
                    { icon: 'fa-solid fa-leaf', text: 'Eco-safe' },
                    { icon: 'fa-solid fa-truck-fast', text: 'Mobile Service' },
                    { icon: 'fa-solid fa-star', text: '5★ Rated' },
                ],
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Deep Carpet Cleaning',
                slug: 'deep-carpet-cleaning',
                description: 'Hot water extraction with powerful vacuum and edge tools for a wall-to-wall refresh.',
                order: 1,
                image: service1ImageId,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Upholstery & Mattresses',
                slug: 'upholstery-mattresses',
                description: 'Fiber-safe cleaning for sofas, chairs, headboards and mattresses. Allergen reduction included.',
                order: 2,
                image: service2ImageId,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Stain & Odor Removal',
                slug: 'stain-odor-removal',
                description: 'Targeted treatment for pet accidents, spills, and heavy traffic lanes. UV inspection on request.',
                order: 3,
                image: service3ImageId,
            },
        })

        // Seed Reviews
        await payload.create({
            collection: 'reviews',
            data: {
                name: 'Anna P.',
                location: 'San Jose',
                text: 'They rescued our light couch from a coffee disaster. It literally looks new again. Fast, polite, and super professional.',
                rating: 5,
                order: 1,
            },
        })

        await payload.create({
            collection: 'reviews',
            data: {
                name: 'Marcus W.',
                location: 'Oakland',
                text: 'Pet odor gone! The UV check and enzyme treatment worked wonders. Dry in a few hours.',
                rating: 5,
                order: 2,
            },
        })

        await payload.create({
            collection: 'reviews',
            data: {
                name: 'Chloe R.',
                location: 'Palo Alto',
                text: 'Fair pricing, on time, and the results were 🔥. Booking again before the holidays.',
                rating: 5,
                order: 3,
            },
        })

        // Seed Pricing
        await payload.create({
            collection: 'pricing',
            data: {
                title: 'Basic Clean',
                price: 120,
                rooms: 'Up to 3 rooms',
                features: [
                    { feature: 'Hot water extraction' },
                    { feature: 'Eco-friendly detergents' },
                    { feature: 'Edge cleaning' },
                    { feature: 'Fast drying' },
                ],
                popular: false,
                order: 1,
            },
        })

        await payload.create({
            collection: 'pricing',
            data: {
                title: 'Deep Clean',
                price: 180,
                rooms: 'Up to 5 rooms',
                features: [
                    { feature: 'Everything in Basic' },
                    { feature: 'Stain pre-treatment' },
                    { feature: 'Pet odor removal' },
                    { feature: 'Anti-allergen rinse' },
                    { feature: 'UV inspection' },
                ],
                popular: true,
                order: 2,
            },
        })

        await payload.create({
            collection: 'pricing',
            data: {
                title: 'Premium Clean',
                price: 250,
                rooms: 'Up to 8 rooms',
                features: [
                    { feature: 'Everything in Deep Clean' },
                    { feature: 'Furniture cleaning' },
                    { feature: 'Mattress cleaning' },
                    { feature: 'Area rug cleaning' },
                    { feature: 'Same-day service' },
                ],
                popular: false,
                order: 3,
            },
        })

        payload.logger.info('✅ Seed data created successfully')
    } catch (error) {
        payload.logger.error(`❌ Failed to seed data: ${error instanceof Error ? error.message : String(error)}`)
    }
}

export default seedPlugin
