#!/usr/bin/env node
import { Client } from 'pg'

async function checkDatabase() {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not set')
        process.exit(1)
    }

    console.log('🔍 Connecting to database...')
    console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`)
    
    const client = new Client({ connectionString: databaseUrl })
    
    try {
        await client.connect()
        console.log('✅ Connected\n')

        // Check tables
        console.log('📊 Tables:')
        const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `)
        
        if (tablesResult.rows.length === 0) {
            console.log('   ⚠️  No tables found!\n')
        } else {
            for (const row of tablesResult.rows) {
                console.log(`   - ${row.tablename}`)
            }
            console.log('')
        }

        // Check row counts for key tables
        const keyTables = ['users', 'services', 'media', 'payload_locked_documents', 'payload_preferences']
        
        console.log('📈 Row counts:')
        for (const table of keyTables) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM "${table}"`)
                console.log(`   ${table}: ${result.rows[0].count} rows`)
            } catch (err) {
                console.log(`   ${table}: table doesn't exist`)
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error))
        process.exit(1)
    } finally {
        await client.end()
    }
}

checkDatabase()
