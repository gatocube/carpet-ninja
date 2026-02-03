# Production Debugging Guide

## Quick Debug Commands

### 1. Check Database State
```bash
# Pull production env vars
vercel pull --yes --environment=production

# Inspect database
set -a && . .vercel/.env.production.local && set +a && node scripts/check-db.mjs
```

### 2. View Vercel Logs
```bash
# Real-time logs
vercel logs carpet-ninja.vercel.app

# Logs for specific deployment
vercel logs [deployment-url]

# Filter by function
vercel logs --output raw | grep "ERROR"
```

### 3. Test Production Build Locally
```bash
# Pull production env
vercel pull --yes --environment=production

# Build with production settings
set -a && . .vercel/.env.production.local && set +a && pnpm build

# Run production server locally
set -a && . .vercel/.env.production.local && set +a && pnpm start
```

Then test:
- Homepage: http://localhost:3445/
- Admin: http://localhost:3445/admin

## Common Production Issues

### Issue 1: Admin Panel Shows 500 Error

**Symptoms**: 
- Admin login page loads but shows "Application error"
- Server logs show module loading errors

**Debug Steps**:
```bash
# 1. Check Vercel logs
vercel logs carpet-ninja.vercel.app | grep "ERROR"

# 2. Look for common errors:
# - "Cannot find module" - Missing importMap or build artifacts
# - "Invalid URL" - Missing NEXT_PUBLIC_SERVER_URL or VERCEL_URL
# - "Failed to load sharp" - Native module architecture mismatch
```

**Solutions**:
- Missing modules: Redeploy with `vercel --prod`
- Invalid URL: Check env vars in Vercel dashboard
- Native modules: Never use local prebuild, always remote build

### Issue 2: Homepage Shows 500 Error

**Symptoms**:
- Homepage fails to load
- Server logs show database query errors

**Debug Steps**:
```bash
# 1. Check if database tables exist
node scripts/check-db.mjs

# 2. If no tables, database wasn't initialized
# See MIGRATIONS.md for initialization steps
```

**Solutions**:
- No tables: Initialize database (see "Database Initialization" section)
- Query errors: Check if DATABASE_URL is set correctly in Vercel env vars

### Issue 3: Content Changes Don't Appear on Website

**Symptoms**:
- Changes saved in admin panel
- Frontend still shows old content
- No errors in logs

**Debug Steps**:
```bash
# 1. Check if changes are in database
node scripts/check-db.mjs

# 2. Test with production E2E test
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts

# 3. Check for caching issues
# - Vercel Edge Network caching
# - Browser caching
```

**Solutions**:
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check if ISR is configured (shouldn't be for dynamic content)
- Verify database connection in Vercel logs

### Issue 4: Slow Database Queries

**Symptoms**:
- Pages load slowly
- Timeout errors in logs
- High database connection count

**Debug Steps**:
```bash
# Check Neon dashboard for:
# - Active connections
# - Query performance
# - Database size
```

**Solutions**:
- Add database indexes for frequently queried fields
- Implement caching layer (Redis, Vercel KV)
- Optimize Payload queries (use `depth` parameter)
- Consider read replicas for high traffic

## Debugging Strategies

### Strategy 1: Binary Search Deployment

If a deployment breaks, narrow down the cause:

```bash
# 1. Redeploy previous known-good commit
git log --oneline
git checkout <good-commit>
vercel --prod

# 2. If works, bisect between good and bad commit
git bisect start
git bisect bad <bad-commit>
git bisect good <good-commit>
# Test each commit until you find the breaking change
```

### Strategy 2: Environment Parity Testing

Test locally with exact production environment:

```bash
# 1. Pull ALL production env vars
vercel pull --yes --environment=production

# 2. Use production database (READ-ONLY testing)
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick

# 3. Test the specific feature that's broken
```

**⚠️ CAUTION**: You're connecting to PRODUCTION database. Don't delete or modify data!

### Strategy 3: Incremental Rollback

If production is broken and you need to restore quickly:

```bash
# 1. Find last working deployment
vercel ls

# 2. Promote it to production
vercel alias <deployment-url> carpet-ninja.vercel.app

# 3. Debug the issue locally, then redeploy
```

## Production Database Access

### Read-Only Inspection

```bash
# Safe: Only reads data
set -a && . .vercel/.env.production.local && set +a
node scripts/check-db.mjs
```

### Direct Database Access (DANGEROUS)

```bash
# Connect with psql (install with: brew install postgresql)
set -a && . .vercel/.env.production.local && set +a
psql $DATABASE_URL
```

**⚠️ EXTREME CAUTION**: You have full write access. Wrong command can delete all data!

### Safe Testing Queries

```sql
-- Check table counts (READ ONLY)
SELECT 
  schemaname,
  tablename,
  (SELECT count(*) FROM pg_tables."tablename") as row_count
FROM pg_tables
WHERE schemaname = 'public';

-- View recent users (READ ONLY)
SELECT id, email, "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5;

-- Check services (READ ONLY)
SELECT id, title, slug FROM services;
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Response Time**
   - Homepage < 1s
   - Admin panel < 2s
   - API routes < 500ms

2. **Error Rate**
   - 500 errors: Should be 0%
   - 404 errors: Track unexpected routes

3. **Database**
   - Connection pool usage
   - Query duration
   - Table sizes

### Setting Up Alerts

```bash
# Vercel automatically monitors:
# - Deployment status
# - Function errors
# - Performance metrics

# Access via: vercel.com > Project > Analytics
```

## Caveats & Best Practices

### DO ✅

- Always check logs first
- Test locally with production env before deploying
- Keep a backup before making database changes
- Use staging environment for risky changes
- Document what you tried in debugging

### DON'T ❌

- Never run `DROP TABLE` or `TRUNCATE` on production
- Don't commit `.env.production.local` to git
- Don't test destructive operations on production database
- Don't deploy on Friday afternoon (harder to fix issues over weekend)
- Don't skip E2E tests before production deploy

## Emergency Rollback Procedure

If production is completely broken:

```bash
# 1. IMMEDIATE: Rollback to last working deployment (< 1 minute)
vercel ls
vercel alias <last-working-deployment> carpet-ninja.vercel.app

# 2. Notify team (if applicable)

# 3. Debug locally
vercel pull --yes --environment=production
git log --oneline -10  # Find the breaking commit
git diff <good-commit> <bad-commit>

# 4. Fix the issue
# - Revert breaking commit, OR
# - Apply hotfix

# 5. Test thoroughly locally
pnpm build
pnpm start
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts

# 6. Deploy fix
vercel --prod

# 7. Verify fix on production
# - Check homepage loads
# - Check admin panel works
# - Verify logs show no errors

# 8. Document what broke and how you fixed it
```

## Getting Help

If stuck:
1. Check this guide first
2. Review Vercel logs thoroughly
3. Check [Payload CMS Discord](https://discord.gg/payload)
4. Check [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
5. Review recent git commits for similar issues
