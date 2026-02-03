import { getPayload } from 'payload'
import config from '@/src/payload.config'

let payloadClient: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
    if (!payloadClient) {
        payloadClient = await getPayload({ config })
    }
    return payloadClient
}

// Fetch all services
export async function getServices() {
    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'services',
        sort: 'order',
        limit: 10,
    })
    return result.docs
}

// Fetch all reviews
export async function getReviews() {
    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'reviews',
        sort: 'order',
        limit: 10,
    })
    return result.docs
}

// Fetch all pricing tiers
export async function getPricing() {
    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'pricing',
        sort: 'order',
        limit: 10,
    })
    return result.docs
}

// Fetch site settings
export async function getSiteSettings() {
    const payload = await getPayloadClient()
    return payload.findGlobal({
        slug: 'site-settings',
    })
}

// Fetch hero content
export async function getHero() {
    const payload = await getPayloadClient()
    return payload.findGlobal({
        slug: 'hero',
    })
}
