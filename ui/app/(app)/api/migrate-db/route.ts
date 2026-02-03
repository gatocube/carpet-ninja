import { NextResponse } from 'next/server'
import { Pool } from 'pg'

/**
 * API endpoint to RESET the database.
 * This drops the public schema and recreates it.
 * WARNING: DESTRUCTIVE ACTION.
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

    try {
        const client = await pool.connect()
        try {
            // Drop public schema cascading to all objects and recreate it
            // This is the cleanest way to wipe everything
            await client.query('DROP SCHEMA public CASCADE')
            await client.query('CREATE SCHEMA public')

            // Restore default grants
            await client.query('GRANT ALL ON SCHEMA public TO postgres')
            await client.query('GRANT ALL ON SCHEMA public TO public')

            return NextResponse.json({
                success: true,
                message: 'Database reset successful. Please redeploy application to trigger schema push and seeding.'
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Reset failed:', error)
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    } finally {
        await pool.end()
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: '/api/migrate-db',
        method: 'POST',
        description: 'RESET DATABASE: Drops public schema and recreates it.',
    })
}
