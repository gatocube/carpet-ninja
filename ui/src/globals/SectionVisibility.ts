import { GlobalConfig } from 'payload'

export const SectionVisibility: GlobalConfig = {
    slug: 'section-visibility',
    label: 'Section Visibility',
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Homepage Sections',
                    fields: [
                        {
                            name: 'showHero',
                            type: 'checkbox',
                            label: 'Show Hero Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showServices',
                            type: 'checkbox',
                            label: 'Show Services Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showBeforeAfter',
                            type: 'checkbox',
                            label: 'Show Before/After Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showReviews',
                            type: 'checkbox',
                            label: 'Show Reviews Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showPricing',
                            type: 'checkbox',
                            label: 'Show Pricing Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showCoverage',
                            type: 'checkbox',
                            label: 'Show Service Area Section',
                            defaultValue: true,
                        },
                        {
                            name: 'showContact',
                            type: 'checkbox',
                            label: 'Show Contact Form',
                            defaultValue: true,
                        },
                    ],
                },
                {
                    label: 'Visual Effects',
                    fields: [
                        {
                            name: 'enableBubbles',
                            type: 'checkbox',
                            label: 'Enable Floating Bubbles Animation',
                            defaultValue: true,
                            admin: {
                                description: 'Show animated bubbles in the hero section background',
                            },
                        },
                        {
                            name: 'bubbleCount',
                            type: 'number',
                            label: 'Number of Bubbles',
                            defaultValue: 15,
                            min: 5,
                            max: 30,
                            admin: {
                                condition: (data) => data.enableBubbles,
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
