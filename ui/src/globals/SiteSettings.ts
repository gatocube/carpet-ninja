import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Settings',
    access: {
        read: () => true,
    },
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
        {
            name: 'tagline',
            type: 'text',
            defaultValue: 'Deep Carpet & Upholstery Cleaning, done Ninja-fast.',
        },
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
    ],
}
