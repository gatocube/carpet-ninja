#!/usr/bin/env node
/**
 * Initialize production database by triggering Payload onInit
 * This will create tables via push:true and seed initial data
 * 
 * Usage: set -a && . .vercel/.env.production.local && set +a && node --import tsx/esm scripts/init-prod-db.mjs
 */

// Force production mode
process.env.NODE_ENV = 'production'

console.log('🔧 Initializing production database...')
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`)

// Dynamic import to get the payload config
const { default: payloadConfig } = await import('../src/payload.config.ts')
const { getPayload } = await import('payload')

try {
    console.log('   Connecting to Payload...')
    const payload = await getPayload({ config: payloadConfig })
    
    console.log('✅ Payload initialized successfully!')
    console.log('   Database tables should now be created')
    
    process.exit(0)
} catch (error) {
    console.error('❌ Failed to initialize:', error instanceof Error ? error.message : String(error))
    process.exit(1)
}
