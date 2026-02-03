import type { GlobalConfig } from 'payload'

export const Hero: GlobalConfig = {
    slug: 'hero',
    label: 'Hero Section',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'headline',
            type: 'text',
            required: true,
            defaultValue: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
        },
        {
            name: 'subheadline',
            type: 'textarea',
            defaultValue: "We're a mobile, pro-grade cleaning team serving the Bay Area, CA. Eco-friendly detergents, industrial extractors, and ninja-level attention to detail. 🥷✨",
        },
        {
            name: 'ctaText',
            type: 'text',
            defaultValue: 'Book Now',
        },
        {
            name: 'badges',
            type: 'array',
            fields: [
                {
                    name: 'icon',
                    type: 'text',
                    admin: {
                        description: 'Font Awesome icon class (e.g. fa-solid fa-leaf)',
                    },
                },
                {
                    name: 'text',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'heroImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Hero section image (recommended: van/truck image with transparent background)',
            },
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Company logo (used in header and footer)',
            },
        },
    ],
}
