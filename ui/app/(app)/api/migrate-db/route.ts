import { NextResponse } from 'next/server'
import { Pool } from 'pg'

/**
 * API endpoint to run database migrations for site-settings.
 * Uses direct database connection to avoid Payload initialization issues.
 */
export async function POST() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

    if (!connectionString) {
        return NextResponse.json({
            success: false,
            message: 'No database connection string found',
        }, { status: 500 })
    }

    const pool = new Pool({ connectionString })
    const migrations: string[] = []
    const errors: string[] = []

    try {
        const client = await pool.connect()

        try {
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
                    await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ${col} boolean DEFAULT true`)
                    migrations.push(`Added column: ${col}`)
                } catch (err) {
                    errors.push(`Column ${col}: ${err instanceof Error ? err.message : 'unknown error'}`)
                }
            }

            // Create cities table if it doesn't exist
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS site_settings_cities (
                        id SERIAL PRIMARY KEY,
                        _order INTEGER NOT NULL DEFAULT 0,
                        _parent_id INTEGER NOT NULL,
                        name VARCHAR(255) NOT NULL
                    )
                `)
                migrations.push('Created site_settings_cities table')
            } catch (err) {
                errors.push(`Cities table: ${err instanceof Error ? err.message : 'unknown error'}`)
            }

            // Add foreign key if it doesn't exist
            try {
                await client.query(`
                    DO $$ 
                    BEGIN 
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.table_constraints 
                            WHERE constraint_name = 'site_settings_cities_parent_fk'
                        ) THEN
                            ALTER TABLE site_settings_cities 
                            ADD CONSTRAINT site_settings_cities_parent_fk 
                            FOREIGN KEY (_parent_id) REFERENCES site_settings(id) ON DELETE CASCADE;
                        END IF;
                    END $$;
                `)
                migrations.push('Added foreign key constraint')
            } catch (err) {
                errors.push(`Foreign key: ${err instanceof Error ? err.message : 'unknown error'}`)
            }

            // Insert default cities if table is empty
            try {
                const result = await client.query('SELECT COUNT(*) as count FROM site_settings_cities')
                if (parseInt(result.rows[0].count) === 0) {
                    // Get site_settings id
                    const settingsResult = await client.query('SELECT id FROM site_settings LIMIT 1')
                    if (settingsResult.rows.length > 0) {
                        const parentId = settingsResult.rows[0].id
                        const cities = ['San Francisco', 'Oakland', 'San Jose', 'Palo Alto', 'Mountain View']
                        for (let i = 0; i < cities.length; i++) {
                            await client.query(
                                'INSERT INTO site_settings_cities (_order, _parent_id, name) VALUES ($1, $2, $3)',
                                [i, parentId, cities[i]]
                            )
                        }
                        migrations.push(`Inserted ${cities.length} default cities`)
                    }
                }
            } catch (err) {
                errors.push(`Default cities: ${err instanceof Error ? err.message : 'unknown error'}`)
            }

        } finally {
            client.release()
        }

        await pool.end()

        return NextResponse.json({
            success: migrations.length > 0 && errors.length === 0,
            message: 'Migration completed',
            migrations,
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error) {
        console.error('Migration failed:', error)
        await pool.end()
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
        description: 'Run database migrations to add missing Site Settings columns and cities table',
    })
}
