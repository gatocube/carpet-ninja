import type { GlobalConfig } from 'payload'

export const BeforeAfter: GlobalConfig = {
    slug: 'before-after',
    label: 'Before/After Gallery',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'sectionTitle',
            type: 'text',
            defaultValue: 'See the Difference',
            admin: {
                description: 'Main heading for the before/after section',
            },
        },
        {
            name: 'sectionSubtitle',
            type: 'text',
            defaultValue: 'Real results from Bay Area homes',
            admin: {
                description: 'Subtitle text below the heading',
            },
        },
        {
            name: 'comparisons',
            type: 'array',
            label: 'Before/After Comparisons',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    admin: {
                        description: 'Short title for this comparison (e.g. "Living Room Carpet")',
                    },
                },
                {
                    name: 'beforeImage',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                    admin: {
                        description: 'Before cleaning image',
                    },
                },
                {
                    name: 'afterImage',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                    admin: {
                        description: 'After cleaning image',
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    admin: {
                        description: 'Optional description of the work done',
                    },
                },
            ],
        },
    ],
}
