import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Reviews } from './collections/Reviews'
import { Pricing } from './collections/Pricing'
import { ContactRequests } from './collections/ContactRequests'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { Hero } from './globals/Hero'

// Plugins
import { seedPlugin } from './plugins/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Build database adapter based on environment
// NOTE: We use PAYLOAD_TEST_MODE because Next.js forces NODE_ENV to 'development' in dev mode
const getDatabaseAdapter = () => {
    const isTestDb = process.env.PAYLOAD_TEST_MODE === 'true'
    console.log(`[Payload Config] PAYLOAD_TEST_MODE=${process.env.PAYLOAD_TEST_MODE}, isTest=${isTestDb}`)

    if (isTestDb) {
        console.log('[Payload Config] Using SQLite adapter for tests')
        return sqliteAdapter({
            client: {
                url: process.env.DATABASE_URL || 'file:./test.db',
            },
        })
    }
    console.log('[Payload Config] Using Postgres adapter for Neon')
    return postgresAdapter({
        pool: {
            connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
        },
        // Auto-create/update tables on startup
        push: true,
    })
}

// Helper to check test mode at runtime
const isTestMode = () => process.env.PAYLOAD_TEST_MODE === 'true'

// Build plugins array conditionally
const plugins = [
    // Seed plugin - runs in dev/test and also first production deploy
    seedPlugin({ runInProduction: true }),
    // Vercel Blob only when token is available (not in test)
    ...(!isTestMode() && process.env.BLOB_READ_WRITE_TOKEN
        ? [
            vercelBlobStorage({
                enabled: true,
                collections: {
                    media: true,
                },
                token: process.env.BLOB_READ_WRITE_TOKEN,
            }),
        ]
        : []),
]

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || (process.env.VERCEL_URL && process.env.VERCEL_URL !== '' ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3445'),
    admin: {
        user: 'users',
        importMap: {
            baseDir: path.resolve(dirname),
        },
        meta: {
            titleSuffix: isTestMode() ? ' — Carpet Ninja CMS (Test)' : ' — Carpet Ninja CMS',
        },
    },
    collections: [
        {
            slug: 'users',
            labels: {
                singular: 'User',
                plural: 'Users',
            },
            auth: true,
            admin: {
                useAsTitle: 'email',
            },
            fields: [
                {
                    name: 'roles',
                    type: 'select',
                    hasMany: true,
                    options: [
                        { label: 'Admin', value: 'admin' },
                        { label: 'Editor', value: 'editor' },
                    ],
                    defaultValue: ['admin'],
                    required: true,
                    saveToJWT: true,
                },
            ],
        },
        Media,
        Services,
        Reviews,
        Pricing,
        ContactRequests,
    ],
    globals: [SiteSettings, Hero],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || (isTestMode() ? 'test-secret' : 'dev-secret-change-in-production'),
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: getDatabaseAdapter(),
    plugins,
    sharp,
})
