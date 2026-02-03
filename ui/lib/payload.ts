import { getPayload } from 'payload'
import config from '@/src/payload.config'

let payloadClient: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
    if (!payloadClient) {
        payloadClient = await getPayload({ config })
    }
    return payloadClient
}

// Default fallback data for build time
const fallbackServices = [
    { id: '1', title: 'Deep Carpet Cleaning', slug: 'deep-carpet-cleaning', description: 'Professional deep cleaning for all carpet types.' },
    { id: '2', title: 'Upholstery & Mattresses', slug: 'upholstery-mattresses', description: 'Refresh your furniture and mattresses.' },
    { id: '3', title: 'Stain & Odor Removal', slug: 'stain-odor-removal', description: 'Eliminate tough stains and odors.' },
]

const fallbackReviews = [
    { id: '1', name: 'Sarah M.', location: 'San Francisco', text: 'Amazing service!', rating: 5 },
    { id: '2', name: 'Mike T.', location: 'Oakland', text: 'Very professional.', rating: 5 },
    { id: '3', name: 'Lisa K.', location: 'San Jose', text: 'Highly recommend!', rating: 5 },
]

const fallbackPricing = [
    { id: '1', title: 'Essential', price: 129, rooms: 'Up to 3 rooms', features: [{ feature: 'Deep clean' }], popular: false },
    { id: '2', title: 'Complete', price: 199, rooms: 'Up to 5 rooms', features: [{ feature: 'Deep clean' }, { feature: 'Deodorizing' }], popular: true },
    { id: '3', title: 'Premium', price: 299, rooms: 'Whole home', features: [{ feature: 'Everything' }], popular: false },
]

// Fetch all services
export async function getServices() {
    try {
        const payload = await getPayloadClient()
        const result = await payload.find({ collection: 'services', sort: 'order', limit: 10 })
        return result.docs
    } catch {
        return fallbackServices
    }
}

// Fetch all reviews
export async function getReviews() {
    try {
        const payload = await getPayloadClient()
        const result = await payload.find({ collection: 'reviews', sort: 'order', limit: 10 })
        return result.docs
    } catch {
        return fallbackReviews
    }
}

// Fetch all pricing tiers
export async function getPricing() {
    try {
        const payload = await getPayloadClient()
        const result = await payload.find({ collection: 'pricing', sort: 'order', limit: 10 })
        return result.docs
    } catch {
        return fallbackPricing
    }
}

// Fetch site settings
export async function getSiteSettings() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'site-settings' })
    } catch {
        return {
            phone: '(415) 123-4567',
            email: 'hello@carpet-ninja.com',
            instagram: '@carpet.ninja',
            tagline: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
            cities: [{ name: 'San Francisco' }, { name: 'Oakland' }, { name: 'San Jose' }],
        }
    }
}

// Fetch hero content
export async function getHero() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'hero' })
    } catch {
        return {
            headline: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
            subheadline: "We're a mobile, pro-grade cleaning team serving the Bay Area, CA.",
            ctaText: 'Book Now',
            badges: [{ icon: 'fa-solid fa-leaf', text: 'Eco-friendly' }],
        }
    }
}

// Fetch before/after gallery
export async function getBeforeAfter() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'before-after' })
    } catch {
        return {
            sectionTitle: 'See the Difference',
            sectionSubtitle: 'Real results from Bay Area homes',
            comparisons: [],
        }
    }
}

// Fetch section visibility settings
export async function getSectionVisibility() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'section-visibility' })
    } catch {
        return {
            showHero: true,
            showServices: true,
            showBeforeAfter: true,
            showReviews: true,
            showPricing: true,
            showCoverage: true,
            showContact: true,
            enableBubbles: true,
            bubbleCount: 15,
        }
    }
}
