# Local Development Setup Guide

## Quick Start (First Time Setup)

### Prerequisites

- **Node.js**: v18+ (v25.5.0 recommended)
- **pnpm**: v10+ (package manager)
- **Git**: For version control

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/gatocube/carpet-ninja.git
cd carpet-ninja/ui

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# Dev server runs at: http://localhost:3445
# Admin panel: http://localhost:3445/admin
```

**That's it!** The dev script automatically:
- Uses SQLite for database (no setup needed)
- Creates `dev.db` on first run
- Seeds initial admin user and sample data
- Kills any existing process on port 3445

### Default Admin Credentials

```
Email: admin@carpet-ninja.com
Password: admin123
```

**⚠️ Change these before production!**

## Development Scripts

```bash
# Start dev server (recommended - uses SQLite)
pnpm dev

# Quick dev start (no cleanup script)
pnpm dev:quick

# Build for production
pnpm build

# Start production server (after build)
pnpm start

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Check database state
node scripts/check-db.mjs  # (requires prod env vars)
```

## Project Structure

```
carpet-ninja/ui/
├── app/                      # Next.js App Router
│   ├── (app)/               # Public website routes
│   │   ├── page.tsx        # Homepage
│   │   └── layout.tsx      # Website layout
│   └── (payload)/          # Payload CMS routes
│       ├── admin/          # Admin panel
│       └── api/            # CMS API routes
├── src/
│   ├── collections/        # Payload collections
│   │   ├── Services.ts
│   │   ├── Reviews.ts
│   │   ├── Pricing.ts
│   │   └── ...
│   ├── globals/           # Payload globals
│   │   ├── Hero.ts
│   │   └── SiteSettings.ts
│   ├── plugins/           # Payload plugins
│   │   └── seed.ts        # Database seeding
│   └── payload.config.ts  # Payload configuration
├── lib/                   # Shared utilities
│   └── payload.ts        # Payload client & helpers
├── e2e/                   # Playwright E2E tests
├── scripts/              # Helper scripts
└── public/               # Static assets
```

## Common Issues & Solutions

### Issue 1: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3445`

**Solution**:
```bash
# The dev script should handle this, but if not:
lsof -ti :3445 | xargs kill -9

# Or use the quick dev script:
pnpm dev:quick
```

### Issue 2: pnpm Not Found

**Error**: `command not found: pnpm`

**Solution**:
```bash
# Install pnpm globally
npm install -g pnpm

# Or use Node.js corepack
corepack enable
corepack prepare pnpm@latest --activate
```

### Issue 3: Build Script Failures (Native Modules)

**Error**: `Ignored build scripts: sharp@0.34.5, esbuild@0.18.20`

**Solution**: Already handled by `pnpm-workspace.yaml`:
```yaml
# pnpm-workspace.yaml
allowBuilds:
  esbuild: true
  sharp: true
  bufferutil: true
  utf-8-validate: true
  unrs-resolver: true
```

If issues persist:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue 4: Database is Empty After Starting Dev Server

**Normal behavior**: Database is seeded automatically on first request.

**Solution**:
```bash
# Start dev server
pnpm dev

# Trigger seeding by visiting homepage
curl http://localhost:3445/

# Or visit in browser: http://localhost:3445/admin
```

Check logs for:
```
[Payload Config] Using SQLite adapter for tests
Seeding initial data...
✅ Created admin user
✅ Seeded 3 services
✅ Seeded 3 reviews
✅ Seeded 3 pricing tiers
```

### Issue 5: TypeScript Errors in Editor

**Solution**:
```bash
# Regenerate TypeScript types
pnpm build

# TypeScript types are generated at:
# - src/payload-types.ts
```

### Issue 6: Hot Reload Not Working

**Solution**:
```bash
# Turbopack (Next.js 16) is enabled by default
# If issues persist, try:

# 1. Clear Next.js cache
rm -rf .next

# 2. Restart dev server
pnpm dev

# 3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
```

## Development Workflows

### Workflow 1: Adding a New Collection

```bash
# 1. Create collection file
touch src/collections/NewCollection.ts

# 2. Define collection
# See existing collections for examples

# 3. Add to payload.config.ts
import { NewCollection } from './collections/NewCollection'

collections: [
  // ... existing
  NewCollection,
]

# 4. Restart dev server (auto-creates table)
pnpm dev

# 5. Visit admin panel to see new collection
open http://localhost:3445/admin
```

### Workflow 2: Changing Database Schema

```bash
# 1. Modify collection/global in code

# 2. Delete local database (safe - it's just dev)
rm -f dev.db dev.db-shm dev.db-wal

# 3. Restart dev server
pnpm dev

# 4. Database recreated with new schema + seed data
```

### Workflow 3: Testing Against Production Database

**⚠️ CAUTION: Read-only testing only!**

```bash
# 1. Pull production env vars
vercel pull --yes --environment=production

# 2. Start dev server with production DB
set -a && . .vercel/.env.production.local && set +a
pnpm dev:quick

# 3. Test in browser (don't modify data!)
open http://localhost:3445/

# 4. When done, restart with local DB
# (Remove env var sourcing)
pnpm dev
```

### Workflow 4: Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/admin.spec.ts

# Run with UI (debugging)
pnpm test:e2e:ui

# Run production sync test
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts
```

## Environment Variables

### Development (Auto-configured)

```bash
# .env.test (auto-loaded by dev script)
PAYLOAD_TEST_MODE=true
DATABASE_URL=file:./dev.db
PAYLOAD_SECRET=dev-secret-change-in-production
```

### Production (From Vercel)

```bash
# Pull from Vercel
vercel pull --yes --environment=production

# Stored in: .vercel/.env.production.local
# Contains:
# - DATABASE_URL (PostgreSQL)
# - PAYLOAD_SECRET
# - BLOB_READ_WRITE_TOKEN
# - POSTGRES_URL
# - NEXT_PUBLIC_SERVER_URL
```

## IDE Setup

### VS Code Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Debugging

### Debug Dev Server

```bash
# Enable verbose logging
DEBUG=payload:* pnpm dev

# Check what's happening
tail -f .next/trace
```

### Debug E2E Tests

```bash
# Run with UI (opens Playwright inspector)
pnpm test:e2e:ui

# Run with headed browser
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test --debug e2e/admin.spec.ts
```

### Debug Database

```bash
# Install SQLite CLI (if needed)
brew install sqlite

# Open database
sqlite3 dev.db

# Run queries
sqlite> .tables
sqlite> SELECT * FROM users;
sqlite> SELECT COUNT(*) FROM services;
sqlite> .quit
```

## Performance Tips

### Faster Dev Server Startup

```bash
# Use quick start (skips port cleanup)
pnpm dev:quick

# Or set in package.json:
"dev": "next dev"  # Remove bash script overhead
```

### Faster Builds

```bash
# Turbopack is enabled by default
# To use webpack (slower but more stable):
"dev": "next dev --turbo false"
```

### Faster Tests

```bash
# Run tests in parallel (default)
pnpm test:e2e

# Run specific test suite
pnpm test:e2e e2e/page-health.spec.ts

# Skip slow tests
pnpm test:e2e --grep-invert "slow"
```

## Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "Add my feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. Create Pull Request on GitHub

# 5. After merge, update main
git checkout main
git pull origin main
```

## Getting Help

**Local Development Issues:**
1. Check this guide first
2. Check error logs in terminal
3. Check `.next/trace` for build errors
4. Search Payload CMS Discord
5. Check Next.js GitHub Issues

**Quick Links:**
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
