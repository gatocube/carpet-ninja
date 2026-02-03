import type { CollectionConfig } from 'payload'

export const ContactRequests: CollectionConfig = {
    slug: 'contact-requests',
    labels: {
        singular: 'Contact Request',
        plural: 'Contact Requests',
    },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
    },
    access: {
        read: () => true,
        create: () => true, // Allow public form submissions
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'new',
            options: [
                { label: 'New', value: 'new' },
                { label: 'Contacted', value: 'contacted' },
                { label: 'Closed', value: 'closed' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'source',
            type: 'text',
            admin: {
                position: 'sidebar',
                description: 'Where the request came from',
            },
        },
    ],
}
