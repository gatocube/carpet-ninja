import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
    slug: 'services',
    labels: {
        singular: 'Service',
        plural: 'Services',
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'order', 'updatedAt'],
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
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'description',
            type: 'textarea',
            required: true,
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
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
