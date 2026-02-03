import { getPayload } from 'payload'
import config from '@/src/payload.config'
import { NextResponse } from 'next/server'

/**
 * API endpoint to initialize the site-settings global with default values.
 * This fixes the 404 issue when the global data doesn't exist in the database.
 */
export async function POST() {
    try {
        const payload = await getPayload({ config })

        // Try to get existing site-settings
        let siteSettings
        try {
            siteSettings = await payload.findGlobal({
                slug: 'site-settings',
            })
        } catch (error) {
            // Global doesn't exist, will create it
            siteSettings = null
        }

        // Initialize with default values if empty or missing
        const updatedSettings = await payload.updateGlobal({
            slug: 'site-settings',
            data: {
                phone: siteSettings?.phone || '(415) 123-4567',
                email: siteSettings?.email || 'hello@carpet-ninja.com',
                instagram: siteSettings?.instagram || '@carpet.ninja',
                tagline: siteSettings?.tagline || 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
                cities: siteSettings?.cities?.length ? siteSettings.cities : [
                    { name: 'San Francisco' },
                    { name: 'San Mateo' },
                    { name: 'San Jose' },
                    { name: 'Palo Alto' },
                    { name: 'Mountain View' },
                ],
                mapEmbedUrl: siteSettings?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253749.89588270477!2d-122.67501791888054!3d37.75781499767964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e2a7f2a2a4d%3A0x31d05b0f6e5c1d2!2sSan%20Francisco%20Bay%20Area!5e0!3m2!1sen!2sus!4v1716944550000',
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Site settings initialized',
            data: updatedSettings,
        })
    } catch (error) {
        console.error('Failed to initialize site-settings:', error)
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: '/api/init-site-settings',
        method: 'POST',
        description: 'Initialize site-settings global with default values',
    })
}
