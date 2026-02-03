# Development Mode

## Overview

The **Development Mode** feature allows you to safely reset and reseed your database during development without writing complex migrations. This is perfect for rapid iteration and testing.

## How It Works

### Development Settings Global

Access via Admin Panel: **Globals → Development Settings**

### Available Options

#### 1. Website in Development Mode
- **Purpose**: Marks the website as being in active development
- **Default**: `false`  
- **When Enabled**:
  - Unlocks data reset features
  - Shows warning indicators in admin
  - Allows force reseeding

⚠️ **IMPORTANT**: Always disable this in production!

#### 2. Allow Automatic Data Reset
- **Purpose**: Permits automatic reseeding when database is empty
- **Default**: `false`
- **Requires**: Development Mode enabled
- **Behavior**: If collections are empty, data will be automatically reseeded

#### 3. Force Reseed on Next Server Start
- **Purpose**: Deletes ALL data and reseeds on next restart
- **Default**: `false`
- **Requires**: Development Mode enabled
- ⚠️ **DANGER ZONE**: This will DELETE everything!

**How to use**:
1. Enable "Website in Development Mode"
2. Check "Force Reseed on Next Server Start"
3. Save settings
4. Restart your dev server
5. Data will be cleared and reseeded
6. Flag automatically resets to `false` after seeding

## Common Workflows

### Fresh Start (Reset Everything)

```bash
# Method 1: Using Development Settings (Recommended)
# 1. Go to Admin → Globals → Development Settings
# 2. Enable "Website in Development Mode"
# 3. Enable "Force Reseed on Next Server Start"
# 4. Save
# 5. Restart dev server
pnpm dev

# Method 2: Manual database reset
rm -f dev.db dev.db-shm dev.db-wal
pnpm dev
```

### Testing with Fresh Data

```bash
# Local development with SQLite
rm -f dev.db*
pnpm dev

# The seed plugin will automatically:
# - Create database schema
# - Upload images from /public to media
# - Seed all collections with default data
# - Create admin user (admin@carpet-ninja.com / admin123)
```

### Production-like Testing

```bash
# Test with production database (but in dev mode)
export DATABASE_URL="your-production-db-url"
pnpm dev

# ⚠️ Be careful! This uses real production data
# Don't enable force reseed with production database
```

## Safety Features

### Automatic Protections

1. **Production Lock**: Force reseed only works when `isDevelopment: true`
2. **Flag Auto-Reset**: `forceReseedOnNextStart` automatically turns off after seeding
3. **Seed Counter**: Tracks how many times data has been seeded
4. **Last Seed Date**: Records when data was last seeded

### Manual Safety Checks

Before enabling force reseed:
- ✅ Confirm you're in local development
- ✅ Check you're not connected to production database
- ✅ Verify you don't need any existing data
- ✅ Backup important data if needed

## Database Information

The Development Settings panel shows:
- **Last Seed Date**: When data was last seeded
- **Total Seed Count**: Number of times data has been seeded
- Useful for tracking development activity

## vs. Migrations

### Use Development Mode When:
- ✅ Rapid prototyping
- ✅ Schema changes are frequent
- ✅ You don't need to preserve data
- ✅ Testing seed data integrity
- ✅ Local development

### Use Migrations When:
- ✅ Production deployments
- ✅ Preserving existing data is critical
- ✅ Schema evolution over time
- ✅ Team collaboration on data structure
- ✅ Rollback capability needed

## Example: Adding a New Field

### With Development Mode (Fast)

```typescript
// 1. Add field to collection
export const Services: CollectionConfig = {
    fields: [
        // ... existing fields
        {
            name: 'newField',
            type: 'text',
        },
    ],
}

// 2. Update seed data
async function seedIfEmpty(payload: Payload) {
    // ... add newField to seed data
}

// 3. Force reseed
// Admin → Development Settings → Force Reseed → Save → Restart
```

### With Migrations (Production-safe)

```bash
# 1. Add field to collection (same as above)

# 2. Generate migration
pnpm payload migrate:create

# 3. Review migration file

# 4. Run migration
pnpm payload migrate

# 5. Update seed data for future deployments
```

## Environment Variables

None required! The feature automatically detects:
- `NODE_ENV`: Auto-sets `isDevelopment` based on environment
- `DATABASE_URL`: Determines which database to use

## Troubleshooting

### "Development Mode is disabled"
**Solution**: Go to Development Settings and enable "Website in Development Mode"

### Force reseed didn't work
**Checklist**:
1. Is "Website in Development Mode" enabled?
2. Is "Force Reseed on Next Server Start" checked?
3. Did you save the settings?
4. Did you restart the server?
5. Check server logs for reseed messages

### Data keeps reappearing
**Cause**: `allowDataReset` is enabled and database is empty
**Solution**: Disable "Allow Automatic Data Reset" after initial seed

### Accidentally enabled in production
**Immediate actions**:
1. Go to Development Settings
2. Disable "Website in Development Mode"
3. Disable all other checkboxes
4. Save immediately
5. Restart server if needed

## Best Practices

### Do's ✅
- Enable development mode for local work
- Use force reseed for schema changes
- Check logs to confirm seeding
- Disable before deploying to production
- Document seed data changes

### Don'ts ❌
- Never enable in production
- Don't force reseed production database
- Don't rely on this for production deployments
- Don't use instead of proper migrations for production
- Don't forget to disable before merging to production branch

## Production Deployment Checklist

Before deploying to production:

```markdown
- [ ] Development Mode is DISABLED
- [ ] Force Reseed is DISABLED  
- [ ] Allow Data Reset is DISABLED
- [ ] Proper migrations are written (if needed)
- [ ] Seed data is tested and working
- [ ] Admin credentials are changed from defaults
- [ ] Database backups are configured
```

## Related Documentation

- [docs/MIGRATIONS.md](./MIGRATIONS.md) - Database migration strategies
- [docs/DEBUGGING-PRODUCTION.md](./DEBUGGING-PRODUCTION.md) - Production troubleshooting
- [docs/GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Development workflow

---

**Remember**: Development Mode is a powerful tool for development. With great power comes great responsibility! Always double-check before enabling in production environments.
