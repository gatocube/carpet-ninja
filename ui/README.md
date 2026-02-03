# Carpet Ninja 🥷

Professional carpet & upholstery cleaning service website built with Next.js 16 and Payload CMS v3.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **CMS**: Payload CMS v3 (Next.js Native)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (production) / SQLite (development)
- **Storage**: Vercel Blob
- **Testing**: Playwright E2E

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (uses SQLite)
./scripts/dev.sh

# Or with PostgreSQL
DATABASE_URL=postgres://... pnpm dev
```

Dev server runs at http://localhost:3445

## Testing

```bash
# Run E2E tests (uses isolated SQLite)
pnpm test:e2e
```

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

Optimized for Vercel deployment. See [Payload CMS Vercel docs](https://payloadcms.com/docs/production/deployment/vercel).
