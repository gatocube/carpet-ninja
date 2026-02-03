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
    { id: '1', title: 'Deep Carpet Cleaning', slug: 'deep-carpet-cleaning', description: 'Professional deep cleaning for all carpet types.', image: null as { url?: string } | null },
    { id: '2', title: 'Upholstery & Mattresses', slug: 'upholstery-mattresses', description: 'Refresh your furniture and mattresses.', image: null as { url?: string } | null },
    { id: '3', title: 'Stain & Odor Removal', slug: 'stain-odor-removal', description: 'Eliminate tough stains and odors.', image: null as { url?: string } | null },
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
            logo: null as { url?: string } | null,
            favicon: null as { url?: string } | null,
            beforeAfterImage: null as { url?: string } | null,
            mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253749.89588270477!2d-122.67501791888054!3d37.75781499767964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e2a7f2a2a4d%3A0x31d05b0f6e5c1d2!2sSan%20Francisco%20Bay%20Area!5e0!3m2!1sen!2sus!4v1716944550000',
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
