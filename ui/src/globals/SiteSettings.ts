import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Settings',
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Section Visibility',
                    description: 'Enable or disable homepage sections',
                    fields: [
                        {
                            name: 'showHero',
                            label: 'Show Hero Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Main hero banner with CTA buttons',
                            },
                        },
                        {
                            name: 'showServices',
                            label: 'Show Services Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Service cards (carpet cleaning, upholstery, etc.)',
                            },
                        },
                        {
                            name: 'showPricing',
                            label: 'Show Pricing Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Pricing tiers and packages',
                            },
                        },
                        {
                            name: 'showResults',
                            label: 'Show Results Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Before/After comparison images',
                            },
                        },
                        {
                            name: 'showReviews',
                            label: 'Show Reviews Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Customer testimonials',
                            },
                        },
                        {
                            name: 'showCoverage',
                            label: 'Show Coverage Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Service area map and cities list',
                            },
                        },
                        {
                            name: 'showContact',
                            label: 'Show Contact Section',
                            type: 'checkbox',
                            defaultValue: true,
                            admin: {
                                description: 'Contact form and info',
                            },
                        },
                    ],
                },
                {
                    label: 'Branding',
                    fields: [
                        {
                            name: 'logo',
                            type: 'upload',
                            relationTo: 'media',
                            admin: {
                                description: 'Main site logo (recommended: square PNG)',
                            },
                        },
                        {
                            name: 'favicon',
                            type: 'upload',
                            relationTo: 'media',
                            admin: {
                                description: 'Browser tab icon (32x32 recommended)',
                            },
                        },
                    ],
                },
                {
                    label: 'Contact',
                    fields: [
                        {
                            name: 'phone',
                            type: 'text',
                            required: true,
                            defaultValue: '(415) 123-4567',
                        },
                        {
                            name: 'email',
                            type: 'email',
                            required: true,
                            defaultValue: 'hello@carpet-ninja.com',
                        },
                        {
                            name: 'instagram',
                            type: 'text',
                            defaultValue: '@carpet.ninja',
                        },
                    ],
                },
                {
                    label: 'Content',
                    fields: [
                        {
                            name: 'tagline',
                            type: 'text',
                            defaultValue: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
                        },
                        {
                            name: 'beforeAfterImage',
                            label: 'Before/After Image',
                            type: 'upload',
                            relationTo: 'media',
                            admin: {
                                description: 'Before/after comparison image for the Results section',
                            },
                        },
                    ],
                },
                {
                    label: 'Coverage',
                    fields: [
                        {
                            name: 'cities',
                            type: 'array',
                            fields: [
                                {
                                    name: 'name',
                                    type: 'text',
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: 'mapEmbedUrl',
                            label: 'Google Maps Embed URL',
                            type: 'text',
                            admin: {
                                description: 'Google Maps embed URL for coverage area. Get from Google Maps → Share → Embed a map',
                            },
                            defaultValue: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253749.89588270477!2d-122.67501791888054!3d37.75781499767964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e2a7f2a2a4d%3A0x31d05b0f6e5c1d2!2sSan%20Francisco%20Bay%20Area!5e0!3m2!1sen!2sus!4v1716944550000',
                        },
                    ],
                },
            ],
        },
    ],
}

