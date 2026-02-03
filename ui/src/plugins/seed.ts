import type { Payload, Config } from 'payload'

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
 * Ensure a default admin user exists for development
 */
async function ensureAdminUser(payload: Payload) {
    const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@carpet-ninja.com'
    const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD || 'admin123'

    try {
        const existingUsers = await payload.find({
            collection: 'users',
            limit: 1,
        })

        if (existingUsers.totalDocs > 0) {
            payload.logger.info(`Admin user already exists`)
            return
        }

        await payload.create({
            collection: 'users',
            data: {
                email: adminEmail,
                password: adminPassword,
                roles: ['admin'],
            },
        })

        payload.logger.info(`✅ Default admin user created: ${adminEmail}`)
        payload.logger.info(`   Password: ${adminPassword}`)
        payload.logger.info(`   ⚠️  Change these credentials in production!`)
    } catch (error) {
        payload.logger.error(`❌ Failed to create admin user: ${error instanceof Error ? error.message : String(error)}`)
    }
}

async function seedIfEmpty(payload: Payload) {
    // Always ensure admin user exists
    await ensureAdminUser(payload)

    // Check if any services exist (tables may not exist yet on first deploy)
    try {
        const existingServices = await payload.find({
            collection: 'services',
            limit: 1,
        })

        if (existingServices.totalDocs > 0) {
            payload.logger.info('Data already exists, skipping seed')
            return
        }
    } catch (error) {
        // Tables don't exist yet - let Payload create them, then we'll seed
        payload.logger.info('Tables not found, will seed after schema sync')
    }

    payload.logger.info('Seeding initial data...')

    try {
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
            },
        })

        // Seed Services
        await payload.create({
            collection: 'services',
            data: {
                title: 'Deep Carpet Cleaning',
                slug: 'deep-carpet-cleaning',
                description: 'Hot water extraction with powerful vacuum and edge tools for a wall-to-wall refresh.',
                order: 1,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Upholstery & Mattresses',
                slug: 'upholstery-mattresses',
                description: 'Fiber-safe cleaning for sofas, chairs, headboards and mattresses. Allergen reduction included.',
                order: 2,
            },
        })

        await payload.create({
            collection: 'services',
            data: {
                title: 'Stain & Odor Removal',
                slug: 'stain-odor-removal',
                description: 'Targeted treatment for pet accidents, spills, and heavy traffic lanes. UV inspection on request.',
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
