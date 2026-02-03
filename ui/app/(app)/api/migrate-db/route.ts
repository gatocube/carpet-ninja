import { getPayload } from 'payload'
import config from '@/src/payload.config'
import { NextResponse } from 'next/server'

/**
 * API endpoint to run database migrations for site-settings.
 * This adds missing columns and tables that weren't created by push mode.
 */
export async function POST() {
    try {
        const payload = await getPayload({ config })

        // Access the database adapter directly
        const db = (payload.db as unknown as { drizzle: { execute: (sql: unknown) => Promise<unknown> } }).drizzle

        if (!db) {
            return NextResponse.json({
                success: false,
                message: 'Database adapter not available',
            }, { status: 500 })
        }

        const migrations: string[] = []

        // Add visibility columns if they don't exist
        const visibilityColumns = [
            'show_hero',
            'show_services',
            'show_pricing',
            'show_results',
            'show_reviews',
            'show_coverage',
            'show_contact',
        ]

        for (const col of visibilityColumns) {
            try {
                await db.execute(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ${col} boolean DEFAULT true`)
                migrations.push(`Added column: ${col}`)
            } catch {
                migrations.push(`Column ${col} already exists or error`)
            }
        }

        // Create cities table if it doesn't exist
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS site_settings_cities (
                    id SERIAL PRIMARY KEY,
                    _order INTEGER NOT NULL,
                    _parent_id INTEGER NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL
                )
            `)
            migrations.push('Created site_settings_cities table')
        } catch {
            migrations.push('site_settings_cities table creation skipped')
        }

        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            migrations,
        })
    } catch (error) {
        console.error('Migration failed:', error)
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: '/api/migrate-db',
        method: 'POST',
        description: 'Run database migrations to add missing Site Settings columns',
    })
}
