import type { GlobalConfig } from 'payload'

export const DevelopmentSettings: GlobalConfig = {
    slug: 'development-settings',
    label: 'Development Settings',
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: '⚠️ Development Mode',
                    fields: [
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'isDevelopment',
                                    type: 'checkbox',
                                    label: 'Website in Development Mode',
                                    defaultValue: false,
                                    admin: {
                                        description: '⚠️ DANGER: When enabled, data can be safely erased and reseeded. Disable this in production!',
                                        width: '100%',
                                    },
                                },
                            ],
                        },
                        {
                            name: 'allowDataReset',
                            type: 'checkbox',
                            label: 'Allow Automatic Data Reset',
                            defaultValue: false,
                            admin: {
                                description: 'When enabled, data will be automatically reset and reseeded on server restart if empty',
                                condition: (data) => data?.isDevelopment,
                            },
                        },
                        {
                            name: 'forceReseedOnNextStart',
                            type: 'checkbox',
                            label: 'Force Reseed on Next Server Start',
                            defaultValue: false,
                            admin: {
                                description: '⚠️ This will DELETE ALL DATA and reseed on next server restart. Uncheck this after restart.',
                                condition: (data) => data?.isDevelopment,
                            },
                        },
                    ],
                },
                {
                    label: 'Database Info',
                    fields: [
                        {
                            name: 'lastSeedDate',
                            type: 'date',
                            label: 'Last Seed Date',
                            admin: {
                                readOnly: true,
                                description: 'Automatically updated when data is seeded',
                            },
                        },
                        {
                            name: 'seedCount',
                            type: 'number',
                            label: 'Total Seed Count',
                            defaultValue: 0,
                            admin: {
                                readOnly: true,
                                description: 'Number of times data has been seeded',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
