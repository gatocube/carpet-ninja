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
 * Ensure default admin users exist for development
 */
async function ensureAdminUser(payload: Payload) {
    try {
        const existingUsers = await payload.find({
            collection: 'users',
            limit: 1,
        })

        if (existingUsers.totalDocs > 0) {
            payload.logger.info(`Admin users already exist`)
            return
        }

        // Create default admin user
        const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@carpet-ninja.com'
        const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD || 'admin123'

        await payload.create({
            collection: 'users',
            data: {
                email: adminEmail,
                password: adminPassword,
                roles: ['admin'],
            },
        })

        payload.logger.info(`✅ Default admin user created: ${adminEmail}`)

        // Create additional admin user (Giorgi)
        await payload.create({
            collection: 'users',
            data: {
                email: 'giorgi2510774@mail.ru',
                password: 'giorgipass',
                roles: ['admin'],
            },
        })

        payload.logger.info(`✅ Additional admin user created: giorgi2510774@mail.ru`)
        payload.logger.info(`   ⚠️  Change these credentials in production!`)
    } catch (error) {
        payload.logger.error(`❌ Failed to create admin users: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * Helper function to upload an image from public folder to media collection
 * In production (Vercel), filesystem access doesn't work, so we skip image uploads
 * Images should be manually uploaded via admin panel or use external URLs
 */
async function uploadImageToMedia(payload: Payload, imagePath: string, alt: string) {
    try {
        // In production, skip filesystem-based uploads
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            payload.logger.info(`⏭️  Skipping image upload in production: ${imagePath} (upload manually via admin)`)
            return null
        }

        // Local development: upload from filesystem
        const fullPath = path.join(process.cwd(), 'public', imagePath)
        
        if (!fs.existsSync(fullPath)) {
            payload.logger.warn(`Image not found: ${fullPath}`)
            return null
        }

        const buffer = fs.readFileSync(fullPath)
        const filename = path.basename(imagePath)

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

        payload.logger.info(`✅ Uploaded image: ${filename}`)
        return media
    } catch (error) {
        payload.logger.error(`❌ Failed to upload ${imagePath}: ${error instanceof Error ? error.message : String(error)}`)
        return null
    }
}

async function seedIfEmpty(payload: Payload) {
    // Always ensure admin user exists
    await ensureAdminUser(payload)

    // Check development settings for force reseed flag
    let devSettings: any = null
    let shouldForceReseed = false
    
    try {
        devSettings = await payload.findGlobal({ slug: 'development-settings' })
        shouldForceReseed = devSettings?.forceReseedOnNextStart === true
        
        if (shouldForceReseed && devSettings?.isDevelopment) {
            payload.logger.warn('🔄 FORCE RESEED ENABLED - Clearing all data...')
            
            // Delete all data from collections
            const collections = ['services', 'reviews', 'pricing', 'contact-requests']
            for (const collectionSlug of collections) {
                try {
                    const items = await payload.find({
                        collection: collectionSlug,
                        limit: 1000,
                    })
                    
                    for (const item of items.docs) {
                        await payload.delete({
                            collection: collectionSlug,
                            id: item.id,
                        })
                    }
                    payload.logger.info(`   Cleared ${items.totalDocs} items from ${collectionSlug}`)
                } catch (err) {
                    // Collection might not exist yet, ignore
                }
            }
            
            // Clear media
            try {
                const mediaItems = await payload.find({
                    collection: 'media',
                    limit: 1000,
                })
                for (const item of mediaItems.docs) {
                    await payload.delete({
                        collection: 'media',
                        id: item.id,
                    })
                }
                payload.logger.info(`   Cleared ${mediaItems.totalDocs} media items`)
            } catch (err) {
                // Ignore
            }
            
            payload.logger.info('✅ All data cleared, proceeding to reseed...')
        }
    } catch (error) {
        // Development settings don't exist yet, that's fine
    }

    // Check if any services exist (tables may not exist yet on first deploy)
    try {
        const existingServices = await payload.find({
            collection: 'services',
            limit: 1,
        })

        if (existingServices.totalDocs > 0 && !shouldForceReseed) {
            payload.logger.info('Data already exists, skipping seed')
            return
        }
    } catch (error) {
        // Tables don't exist yet - let Payload create them, then we'll seed
        payload.logger.info('Tables not found, will seed after schema sync')
    }

    payload.logger.info('🌱 Seeding initial data...')

    try {
        // Upload default images to media collection (local dev only)
        let heroImage: any = null
        let logo: any = null
        let serviceImages: Record<string, any> = {
            'deep-carpet-cleaning': null,
            'upholstery-mattresses': null,
            'stain-odor-removal': null,
        }
        let beforeImage: any = null
        let afterImage: any = null

        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            payload.logger.info('📸 Skipping image uploads in production (upload manually via admin panel)')
            payload.logger.info('   See docs/PRODUCTION-IMAGE-UPLOAD.md for instructions')
        } else {
            payload.logger.info('📸 Uploading default images...')
            
            heroImage = await uploadImageToMedia(payload, 'carpet-ninja-car-3.png', 'Carpet Ninja Van')
            logo = await uploadImageToMedia(payload, 'carpet-ninja.png', 'Carpet Ninja Logo')
            
            serviceImages = {
                'deep-carpet-cleaning': await uploadImageToMedia(payload, 'service-deep-carpet-cleaning.png', 'Deep Carpet Cleaning Service'),
                'upholstery-mattresses': await uploadImageToMedia(payload, 'service-upholstery-mattreses.png', 'Upholstery and Mattress Cleaning'),
                'stain-odor-removal': await uploadImageToMedia(payload, 'service-stain-order-removal.png', 'Stain and Odor Removal Service'),
            }
            
            beforeImage = await uploadImageToMedia(payload, 'before.png', 'Before Cleaning')
            afterImage = await uploadImageToMedia(payload, 'after.png', 'After Cleaning')
        }
        // Seed SiteSettings global
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
                heroImage: heroImage?.id,
                logo: logo?.id,
            },
        })

        // Seed BeforeAfter global
        await payload.updateGlobal({
            slug: 'before-after',
            data: {
                sectionTitle: 'See the Difference',
                sectionSubtitle: 'Real results from Bay Area homes',
                comparisons: beforeImage && afterImage ? [
                    {
                        title: 'Living Room Carpet',
                        beforeImage: beforeImage.id,
                        afterImage: afterImage.id,
                        description: 'Deep cleaning removed years of dirt and stains',
                    },
                ] : [],
            },
        })

        // Seed SectionVisibility global
        await payload.updateGlobal({
            slug: 'section-visibility',
            data: {
                showHero: true,
                showServices: true,
                showBeforeAfter: true,
                showReviews: true,
                showPricing: true,
                showCoverage: true,
                showContact: true,
                enableBubbles: true,
                bubbleCount: 15,
            },
        })

        // Seed Services with images
        await payload.create({
            collection: 'services',
            data: {
                title: 'Deep Carpet Cleaning',
                slug: 'deep-carpet-cleaning',
                description: 'Hot water extraction with powerful vacuum and edge tools for a wall-to-wall refresh.',
                image: serviceImages['deep-carpet-cleaning']?.id,
                order: 1,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Upholstery & Mattresses',
                slug: 'upholstery-mattresses',
                description: 'Fiber-safe cleaning for sofas, chairs, headboards and mattresses. Allergen reduction included.',
                image: serviceImages['upholstery-mattresses']?.id,
                order: 2,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Stain & Odor Removal',
                slug: 'stain-odor-removal',
                description: 'Targeted treatment for pet accidents, spills, and heavy traffic lanes. UV inspection on request.',
                image: serviceImages['stain-odor-removal']?.id,
                order: 3,
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

        // Seed Pricing with icons
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
                icon: 'fa-solid fa-broom',
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
                icon: 'fa-solid fa-star',
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
                icon: 'fa-solid fa-crown',
                order: 3,
            },
        })

        // Seed/Update DevelopmentSettings global
        await payload.updateGlobal({
            slug: 'development-settings',
            data: {
                isDevelopment: process.env.NODE_ENV !== 'production',
                allowDataReset: false,
                forceReseedOnNextStart: false, // Reset flag after seeding
                lastSeedDate: new Date().toISOString(),
                seedCount: (devSettings?.seedCount || 0) + 1,
            },
        })

        payload.logger.info('✅ Seed data created successfully')
    } catch (error) {
        payload.logger.error(`❌ Failed to seed data: ${error instanceof Error ? error.message : String(error)}`)
    }
}

export default seedPlugin
