# Database Migrations & Reset Guide

## Overview

This project uses Payload CMS v3 with PostgreSQL (production) and SQLite (development). Understanding when and how to migrate your database is critical for data safety.

## Development vs Production

### Development (Local)
- Uses **SQLite** (`dev.db` or `test.db`)
- Auto-syncs schema with `push: true` (Drizzle push mode)
- Tables auto-created when you start dev server
- Safe to delete and recreate anytime

### Production (Vercel)
- Uses **PostgreSQL** (Neon)
- Should use migrations for schema changes
- `push: true` doesn't work in production (dev mode only)
- Manual initialization required for first deployment

## Initial Production Database Setup

### First Time Initialization

**⚠️ Only do this ONCE when first setting up production database:**

```bash
# 1. Pull production environment variables
vercel pull --yes --environment=production

# 2. Start dev server with production database
#    This triggers Drizzle push to create all tables
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick

# 3. In another terminal, trigger Payload initialization
curl http://localhost:3445/

# 4. Wait for logs to show:
#    - "Pulling schema from database..."
#    - Tables created
#    - "Seeding initial data..."

# 5. Verify tables were created
node scripts/check-db.mjs

# 6. Stop dev server (Ctrl+C)

# 7. Deploy to Vercel
vercel --prod
```

**What this does:**
- Creates all 19 tables based on Payload collections/globals
- Seeds initial admin user and sample data
- Establishes baseline schema

## Schema Changes (After Initial Setup)

### Option 1: Using Drizzle Push (Development-like)

**⚠️ CAUTION**: Only use for small, non-destructive changes. Not recommended for production with real data.

```bash
# Pull production env
vercel pull --yes --environment=production

# Make your schema changes in code
# Edit: src/collections/*.ts or src/globals/*.ts

# Push changes to production DB via dev mode
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick
curl http://localhost:3445/

# Verify changes
node scripts/check-db.mjs

# Stop dev server and deploy
vercel --prod
```

**Limitations:**
- Drizzle will DROP columns if you remove fields (DATA LOSS)
- Can't rollback easily
- No version history
- Mixing push and migrations causes conflicts

### Option 2: Using Migrations (Recommended for Production)

**Status**: Currently not set up due to Payload CLI issues with ESM modules.

**Future Implementation** (when needed):

1. Install Drizzle Kit:
```bash
pnpm add -D drizzle-kit
```

2. Configure `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/payload-generated.schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

3. Generate migration:
```bash
pnpm drizzle-kit generate
```

4. Review generated SQL in `src/migrations/`

5. Run migration before deployment:
```bash
# Add to package.json:
"migrate": "drizzle-kit migrate"

# Then in Vercel settings, set build command:
"pnpm migrate && pnpm build"
```

## Database Reset & Backup

### Backing Up Production Database

**Before any destructive operation, ALWAYS backup:**

```bash
# Option 1: Via Neon Dashboard
# 1. Go to https://console.neon.tech
# 2. Select your database
# 3. Click "Backups" -> "Create backup"

# Option 2: pg_dump (requires psql)
set -a && . .vercel/.env.production.local && set +a
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Option 3: Export via Payload API (programmatic)
# See scripts/backup-db.mjs below
```

### Reset Development Database

**Safe - This is just your local SQLite:**

```bash
# Delete local dev database
rm -f dev.db dev.db-shm dev.db-wal

# Restart dev server (will recreate with seed data)
pnpm dev
```

### Reset Test Database

```bash
# Test script automatically cleans up
pnpm test:e2e

# Or manually:
rm -f test.db test.db-shm test.db-wal
```

### Reset Production Database (DANGEROUS)

**⚠️ EXTREME CAUTION: This deletes ALL production data!**

**Prerequisites:**
1. ✅ Have a recent backup
2. ✅ Notified all team members
3. ✅ Confirmed this is what you want to do
4. ✅ Not Friday afternoon

**Method 1: Drop and Recreate Tables (via psql)**

```bash
# 1. BACKUP FIRST!
set -a && . .vercel/.env.production.local && set +a
pg_dump $DATABASE_URL > backup-before-reset-$(date +%Y%m%d-%H%M%S).sql

# 2. Connect to database
psql $DATABASE_URL

# 3. Drop all tables (POINT OF NO RETURN)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO neondb_owner;
\q

# 4. Re-initialize schema (see "Initial Production Database Setup")
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick
curl http://localhost:3445/

# 5. Verify
node scripts/check-db.mjs

# 6. Redeploy
vercel --prod
```

**Method 2: Delete via Neon Dashboard**

```bash
# 1. Go to https://console.neon.tech
# 2. Select database
# 3. Click "Reset" or delete database
# 4. Create new database
# 5. Update DATABASE_URL in Vercel env vars
# 6. Follow "Initial Production Database Setup"
```

### Restore from Backup

```bash
# 1. Reset database first (see above)

# 2. Restore from SQL dump
psql $DATABASE_URL < backup-20260203-153045.sql

# 3. Verify data
node scripts/check-db.mjs
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM services;"

# 4. Test production
curl https://carpet-ninja.vercel.app/
curl https://carpet-ninja.vercel.app/admin
```

## Database Backup Script

Create `scripts/backup-db.mjs`:

```javascript
#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set')
  process.exit(1)
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const filename = `backups/backup-${timestamp}.sql`

console.log(`📦 Creating backup: ${filename}`)

try {
  await execAsync(`mkdir -p backups`)
  await execAsync(`pg_dump "${databaseUrl}" > ${filename}`)
  console.log(`✅ Backup created: ${filename}`)
  
  // Also create compressed version
  await execAsync(`gzip -k ${filename}`)
  console.log(`✅ Compressed: ${filename}.gz`)
} catch (error) {
  console.error('❌ Backup failed:', error.message)
  process.exit(1)
}
```

Usage:
```bash
set -a && . .vercel/.env.production.local && set +a
node scripts/backup-db.mjs
```

## Data Migration Strategies

### Adding a New Field

**Safe - No data loss:**

```typescript
// src/collections/Services.ts
export const Services: CollectionConfig = {
  slug: 'services',
  fields: [
    // ... existing fields ...
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,  // Existing records get this value
      label: 'Featured Service',
    },
  ],
}
```

Then:
```bash
# Push schema change
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick
curl http://localhost:3445/
vercel --prod
```

### Removing a Field

**DANGER - Causes data loss:**

```typescript
// Before removing, check if data exists
// psql $DATABASE_URL -c "SELECT COUNT(*) FROM services WHERE old_field IS NOT NULL;"

// If data is important, export it first:
// psql $DATABASE_URL -c "COPY services(id, old_field) TO '/tmp/old_field_backup.csv' CSV HEADER;"

// Then remove from code
export const Services: CollectionConfig = {
  fields: [
    // removed: old_field
  ]
}
```

### Renaming a Field

**Complex - Requires data migration:**

```typescript
// Option 1: Add new field, migrate data, remove old field
// 1. Add new field
{
  name: 'service_title',  // new name
  type: 'text',
}

// 2. Migrate data via SQL or Payload API
// psql: UPDATE services SET service_title = title;

// 3. Remove old field
// delete: title field

// Option 2: Use migrations (when set up)
// Drizzle can generate ALTER TABLE RENAME COLUMN statements
```

## Preventing Data Loss

### Pre-deployment Checklist

Before ANY schema change deployment:

- [ ] Backup production database
- [ ] Test schema change locally with production data copy
- [ ] Review what data will be affected
- [ ] Plan rollback strategy
- [ ] Run in off-peak hours
- [ ] Have someone else review the change

### Safe Schema Changes

✅ Adding new optional fields
✅ Adding new collections
✅ Changing field labels/descriptions
✅ Adding validation (non-breaking)
✅ Adding indexes

### Dangerous Schema Changes

❌ Removing fields (data loss)
❌ Changing field types (potential data loss)
❌ Renaming fields (breaks code + data)
❌ Changing required fields (breaks existing records)
❌ Removing collections (complete data loss)

## Emergency Recovery

If you accidentally destroyed data:

1. **Stop all deployments immediately**
2. **Don't make more changes** (could overwrite backups)
3. **Check Neon automatic backups** (point-in-time recovery)
4. **Restore from your manual backup**
5. **Document what happened**
6. **Improve backup/migration procedures**

## Summary

**Golden Rules:**
1. 🔒 **ALWAYS backup before schema changes**
2. 🧪 **Test migrations locally first**
3. 📝 **Document what you're changing**
4. ⏱️ **Run during off-peak hours**
5. 🔄 **Have a rollback plan**
6. 👥 **Get a second pair of eyes for production changes**
