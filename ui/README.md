# Carpet Ninja 🥷

Professional carpet & upholstery cleaning service website built with Next.js 16 and Payload CMS v3.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with Turbopack
- **CMS**: Payload CMS v3 (Next.js Native)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (production) / SQLite (development)
- **Storage**: Vercel Blob
- **Testing**: Playwright E2E
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

**That's it!** Server runs at http://localhost:3445

- Admin panel: http://localhost:3445/admin
- Default credentials: `admin@carpet-ninja.com` / `admin123`

## Documentation

- **[Local Development Guide](docs/LOCAL-DEVELOPMENT.md)** - Complete setup, common issues, workflows
- **[Production Debugging Guide](docs/DEBUGGING-PRODUCTION.md)** - Debug strategies, log analysis, rollback procedures
- **[Database Migrations Guide](docs/MIGRATIONS.md)** - Schema changes, backups, reset procedures
- **[Session Findings](docs/SESSION-FINDINGS.md)** - Technical decisions, issues discovered, caveats

## Testing

### Local E2E Tests

```bash
# Run E2E tests (uses isolated SQLite)
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

### Production E2E Tests

Test the full flow on production: login to admin, change content, verify on website:

```bash
# Run production sync test
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts
```

**What it tests:**
- ✅ Admin login works with production credentials
- ✅ Can edit Hero section content via admin UI
- ✅ Changes appear immediately on the production website
- ✅ Automatic cleanup (restores original content after test)

**When to run:**
- After deploying major changes
- To verify production database connectivity
- To test admin panel functionality on live site

## Environment Variables

```bash
# Required for production
DATABASE_URL=           # PostgreSQL connection string
PAYLOAD_SECRET=         # Random secret for Payload auth
BLOB_READ_WRITE_TOKEN=  # Vercel Blob storage token

# Optional
NEXT_PUBLIC_SITE_URL=   # Production URL (default: https://carpet-ninja.com)
```

## Deployment

### Standard Deployment (Recommended)

```bash
vercel --prod
```

Vercel builds remotely with correct native module binaries for linux-arm64.

### Database Initialization

The production PostgreSQL database must be initialized before the first deployment:

1. Pull production environment variables:
   ```bash
   vercel pull --yes --environment=production
   ```

2. Run dev server against production database to initialize schema:
   ```bash
   set -a && . .vercel/.env.production.local && set +a && pnpm dev:quick
   ```

3. Trigger a request to initialize Payload and seed data:
   ```bash
   curl http://localhost:3445/
   ```

4. Stop the dev server and deploy normally:
   ```bash
   vercel --prod
   ```

**Why this approach?**
- Payload's `push: true` mode auto-creates tables in development
- Production requires migrations, but initial setup needs tables first
- Running dev mode once against prod DB creates the schema

See [Payload CMS Vercel docs](https://payloadcms.com/docs/production/deployment/vercel) for more details.

## Project Structure

```
carpet-ninja/ui/
├── app/                    # Next.js App Router
│   ├── (app)/             # Public website
│   └── (payload)/         # CMS admin + API
├── src/
│   ├── collections/       # Payload collections
│   ├── globals/          # Payload globals
│   ├── plugins/          # Payload plugins
│   └── payload.config.ts # Main config
├── lib/                   # Shared utilities
├── e2e/                   # E2E tests
├── scripts/              # Helper scripts
└── docs/                 # Documentation
```

## Admin Credentials (Development)

```
Email: admin@carpet-ninja.com
Password: admin123
```

⚠️ **Change these before production use!**

## Production

**Live Site**: https://carpet-ninja.vercel.app/
**Admin Panel**: https://carpet-ninja.vercel.app/admin

See [docs/DEBUGGING-PRODUCTION.md](docs/DEBUGGING-PRODUCTION.md) for monitoring and troubleshooting.
