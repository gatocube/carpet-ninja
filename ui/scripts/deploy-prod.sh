#!/bin/bash
# Fast production deployment using local prebuild + archive upload
# This is 3-5x faster than remote builds on Vercel
#
# Workflow:
#   1. Pull latest env vars from Vercel
#   2. Build locally with production env
#   3. Deploy pre-built artifacts as compressed archive
#
# Benefits:
#   - Catch build errors before deploying
#   - Test production build locally first
#   - Much faster deployments (only upload, no remote build)
#
# Caveats:
#   - Must have Vercel CLI authenticated
#   - Requires local build to succeed
#   - .vercel/output created locally (gitignored)

set -e

echo "🚀 Fast Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Pull latest settings and env vars
echo "📥 Step 1/3: Pulling production environment..."
vercel pull --yes --environment=production

# Step 2: Build locally with production env
echo ""
echo "🔨 Step 2/3: Building locally with production environment..."
vercel build --prod --yes

# Step 3: Deploy pre-built artifacts as compressed archive
echo ""
echo "📤 Step 3/3: Deploying pre-built artifacts..."
vercel deploy --prebuilt --prod --archive=tgz

echo ""
echo "✅ Deployment complete!"
echo "🌐 Production URL: https://carpet-ninja.vercel.app"
echo "🔍 Admin Panel: https://carpet-ninja.vercel.app/admin"
