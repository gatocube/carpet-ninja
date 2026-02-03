# Carpet Ninja - Deployment Setup Guide

## Live URLs
- **Website**: https://carpet-ninja.vercel.app
- **Admin Panel**: https://carpet-ninja.vercel.app/admin
- **GitHub**: https://github.com/gatocube/carpet-ninja

## Admin Credentials
See `~/kb/secrets.md` for admin login credentials.

---

## Vercel + Neon Setup

### 1. Connect Neon Database via Vercel UI
1. Go to Vercel Dashboard → Project → Storage
2. Add Neon PostgreSQL integration
3. Vercel auto-creates `POSTGRES_URL` env variable

### 2. Required Environment Variables
| Variable | Source |
|----------|--------|
| `POSTGRES_URL` | Auto-created by Neon integration |
| `DATABASE_URL` | Same as POSTGRES_URL (backup) |
| `PAYLOAD_SECRET` | Generate: `openssl rand -hex 32` |

### 3. Production Branch
- Deploy from `production` branch
- Push changes: `git push origin production`

---

## Key Configuration

### Postgres Adapter (payload.config.ts)
```typescript
postgresAdapter({
    pool: {
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
    },
    push: true,  // Auto-creates tables
})
```

### Dynamic Rendering (page.tsx)
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
This ensures content updates from admin appear immediately.

### Seed Plugin
- Runs on first deploy to create admin user and initial content
- Set `runInProduction: true` in `payload.config.ts`

---

## First Deploy Checklist

1. ✅ Push code to `production` branch
2. ✅ Connect Neon via Vercel Storage UI
3. ✅ Add `PAYLOAD_SECRET` env variable
4. ✅ Run local dev with prod DB to seed: 
   ```bash
   POSTGRES_URL="your-neon-url" pnpm dev
   ```
5. ✅ Verify admin login works
6. ✅ Test content editing → frontend update

---

## Troubleshooting

### "Error initializing Payload"
- Database tables not created → Run local dev with prod `POSTGRES_URL` to trigger seed
- Missing env vars → Check `POSTGRES_URL` and `PAYLOAD_SECRET`

### Content not updating on frontend
- Check `dynamic = 'force-dynamic'` is set in page.tsx
- Check `revalidate = 0` is set

### SSL Warnings
Normal with Neon - add `?sslmode=require` to connection string
