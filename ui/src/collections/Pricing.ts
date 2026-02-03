import type { CollectionConfig } from 'payload'

export const Pricing: CollectionConfig = {
    slug: 'pricing',
    labels: {
        singular: 'Pricing Tier',
        plural: 'Pricing',
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'price', 'popular', 'order'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            index: true,
        },
        {
            name: 'price',
            type: 'number',
            required: true,
        },
        {
            name: 'rooms',
            type: 'text',
            required: true,
            admin: {
                description: 'e.g. "Up to 3 rooms"',
            },
        },
        {
            name: 'features',
            type: 'array',
            required: true,
            fields: [
                {
                    name: 'feature',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'popular',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Show "Most Popular" badge',
            },
        },
        {
            name: 'order',
            type: 'number',
            defaultValue: 0,
            admin: {
                position: 'sidebar',
            },
        },
    ],
}
