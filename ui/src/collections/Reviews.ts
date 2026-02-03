import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
    slug: 'reviews',
    labels: {
        singular: 'Review',
        plural: 'Reviews',
    },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'location', 'rating', 'createdAt'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            index: true,
        },
        {
            name: 'location',
            type: 'text',
            required: true,
        },
        {
            name: 'text',
            type: 'textarea',
            required: true,
        },
        {
            name: 'rating',
            type: 'number',
            min: 1,
            max: 5,
            defaultValue: 5,
            required: true,
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
