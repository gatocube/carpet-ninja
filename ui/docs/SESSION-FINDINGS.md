# Session Findings: Production Deployment & Database Setup

## Date
February 3, 2026

## Summary
Successfully deployed carpet-ninja website to Vercel with Payload CMS v3, initialized production database, and verified full admin-to-website content sync functionality.

## Key Issues Discovered & Resolved

### 1. **Payload CMS `push: true` Only Works in Development**

**Issue**: The production database had no tables even with `push: true` configured in the Postgres adapter.

**Root Cause**: Payload CMS documentation states that `push: true` (Drizzle's push mode) only works in development. Production requires migrations.

**Solution**: For initial setup, run dev mode against the production database to trigger schema push:
```bash
vercel pull --yes --environment=production
set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick
curl http://localhost:3445/  # Trigger Payload initialization
```

**Long-term Solution**: Use migrations for production schema changes (see MIGRATIONS.md).

### 2. **Local Prebuild Deployment Fails with Native Modules**

**Issue**: `vercel build --prod && vercel deploy --prebuilt` built native modules (sharp, libsql) for local architecture, causing runtime errors on Vercel's linux-arm64 platform.

**Error**:
```
Error: Could not load the "sharp" module using the linux-arm64 runtime
```

**Solution**: Use standard Vercel deployment which builds remotely:
```bash
vercel --prod
```

### 3. **Payload CLI Migration Commands Fail**

**Issue**: `pnpm payload migrate:create` failed with `ERR_MODULE_NOT_FOUND` for imports without `.js` extensions.

**Root Cause**: Node.js ESM requires explicit file extensions, but TypeScript imports omit them. The Payload CLI uses `tsx` which has compatibility issues with the project's module resolution.

**Workaround**: Migrations are not critical for this project's current stage. Use `push: true` in development and rebuild schema manually for major changes.

### 4. **Seed Plugin Crashes on Missing Tables**

**Issue**: The seed plugin's `onInit` hook tried to query tables before they existed, causing crashes.

**Solution**: Added try-catch around `payload.find()` to gracefully handle missing tables:
```typescript
try {
    const existingServices = await payload.find({
        collection: 'services',
        limit: 1,
    })
    // ... check if seeding needed
} catch (error) {
    payload.logger.info('Tables not found, will seed after schema sync')
}
```

### 5. **Admin Panel ImportMap Issues**

**Issue**: Admin panel failed to load with "Cannot find module" errors for `./importMap`.

**Root Cause**: 
- Empty `importMap.ts` was being imported instead of generated `importMap.js`
- The generated `importMap.js` was not tracked in git
- Import paths were incorrect (`./importMap` vs `../importMap`)

**Solution**:
- Deleted empty `importMap.ts`
- Corrected import paths in `layout.tsx` and `page.tsx` to `../importMap`
- Added generated `importMap.js` to git (Payload auto-generates it during build)

## Production Verification

### Manual Testing ✅
- Admin login: https://carpet-ninja.vercel.app/admin
- Edit Hero section headline
- Verified changes appear immediately on homepage
- Content sync working perfectly

### E2E Testing ✅
```bash
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts
```
- Test passed (33.7s)
- Automated login, edit, verify, restore cycle

## Database Status

**Production PostgreSQL (Neon)**:
- 19 tables created
- 1 admin user
- 3 services seeded
- Data persisting correctly across deployments

**Tables**:
```
contact_requests, hero, hero_badges, media, payload_kv,
payload_locked_documents, payload_locked_documents_rels,
payload_migrations, payload_preferences, payload_preferences_rels,
pricing, pricing_features, reviews, services, site_settings,
site_settings_cities, users, users_roles, users_sessions
```

## Deployment Workflow

**Standard Deployment**:
```bash
vercel --prod
```
- Build time: ~2 minutes
- Builds remotely with correct native modules
- Automatically uses production env vars

## Tools Created

### Database Inspection Script
`scripts/check-db.mjs` - Check production database tables and row counts:
```bash
set -a && . .vercel/.env.production.local && set +a && node scripts/check-db.mjs
```

## Caveats & Warnings

1. **Never mix push and migrations**: If you use `push: true` locally, don't try to run migrations - Payload will warn you.

2. **Native modules**: Always deploy via Vercel's remote build. Local prebuilds will fail at runtime.

3. **Database initialization**: First deployment requires manual schema initialization via dev mode push.

4. **Environment variables**: Always use `vercel pull` to sync production env vars locally. Never commit `.env.production.local`.

5. **Admin credentials**: Stored in seed plugin. Change before going live with real users.

## Recommendations

1. **Set up proper migrations**: Before production launch, configure Payload migrations properly for schema versioning.

2. **Change admin password**: The seeded admin password (`admin123`) should be changed via the admin panel.

3. **Add database backups**: Configure automated PostgreSQL backups via Neon.

4. **Monitor database size**: Free tier has limits. Monitor usage as content grows.

5. **Cache strategy**: Consider adding Redis or similar for API caching if traffic increases.

## Files Modified

- `src/payload.config.ts` - Added `serverURL` configuration
- `src/plugins/seed.ts` - Added try-catch for missing tables
- `app/(payload)/admin/[[...segments]]/layout.tsx` - Fixed importMap path
- `app/(payload)/admin/[[...segments]]/page.tsx` - Fixed importMap path
- `pnpm-workspace.yaml` - Added allowBuilds for native modules
- `package.json` - Added cross-env, tsx, pg dependencies
- `README.md` - Updated deployment and testing docs

## Success Metrics

✅ Homepage rendering with real database content
✅ Admin panel fully functional
✅ Content changes sync immediately to frontend
✅ E2E tests passing (local and production)
✅ Database persisting data correctly
✅ No data loss across deployments
✅ No dangerous database reset scripts
