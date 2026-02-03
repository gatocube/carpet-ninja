# Production Image Upload Guide

## Problem

The seed plugin's automatic image upload works perfectly in local development but **doesn't work in Vercel production** because:

1. **Filesystem Access**: Vercel serverless functions can't read from `/public` at runtime
2. **Build vs Runtime**: Public folder is for static assets, not runtime file system operations
3. **Vercel Blob**: Production uses Vercel Blob storage, not local filesystem

## Solution: Manual Upload (One-Time Setup)

### Step 1: Bulk Upload Images

1. **Download images from GitHub**:
   ```bash
   # Clone or download the repository if you haven't
   git clone https://github.com/gatocube/carpet-ninja
   cd carpet-ninja/ui/public
   ```

2. **Login to Admin**: https://carpet-ninja.vercel.app/admin

3. **Navigate to Media**: Collections → Media

4. **Use Bulk Upload**:
   - Click "Bulk Upload" button
   - Select all images:
     - `service-deep-carpet-cleaning.png`
     - `service-upholstery-mattreses.png`
     - `service-stain-order-removal.png`
     - `carpet-ninja-car-3.png`
     - `carpet-ninja.png`
     - `before.png`
     - `after.png`
   - Upload all at once

### Step 2: Connect Images to Services

1. **Go to**: Collections → Services
2. **Edit "Deep Carpet Cleaning"**:
   - **Image** field → Select `service-deep-carpet-cleaning.png`
   - Save
3. **Edit "Upholstery & Mattresses"**:
   - **Image** field → Select `service-upholstery-mattreses.png`
   - Save
4. **Edit "Stain & Odor Removal"**:
   - **Image** field → Select `service-stain-order-removal.png`
   - Save

### Step 3: Connect Images to Hero

1. **Go to**: Globals → Hero Section
2. **Hero Image**: Select `carpet-ninja-car-3.png`
3. **Logo**: Select `carpet-ninja.png`
4. Save

### Step 4: Connect Images to Before/After

1. **Go to**: Globals → Before/After Gallery
2. **Add new comparison**:
   - **Title**: "Living Room Carpet"
   - **Before Image**: Select `before.png`
   - **After Image**: Select `after.png`
   - **Description**: "Deep cleaning removed years of dirt and stains"
3. Save

### Step 5: Verify

Visit https://carpet-ninja.vercel.app/ and check:
- ✅ Hero section has car image
- ✅ Services show their images
- ✅ Before/After section appears with comparison
- ✅ All images load properly

---

## Alternative: Use Development Mode (Resets ALL Data!)

If you're okay with resetting ALL data:

1. Enable Development Mode (already done ✅)
2. Wait 10-15 minutes for Vercel function to cold-start
3. Make a request to trigger Payload initialization
4. Data will be cleared and reseeded (but images might still fail due to filesystem issue)

⚠️ **Not recommended** - Manual upload is more reliable for production

---

## Future: Fix Seed Plugin for Production

To make automatic seeding work in production, we need to:

1. **Option A**: Pre-upload images to Vercel Blob during build
2. **Option B**: Use URL imports instead of filesystem
3. **Option C**: Seed images only in development, manual upload for production

---

## Quick Reference: Image Files

| File | Usage | Alt Text |
|------|-------|----------|
| `service-deep-carpet-cleaning.png` | Services collection | "Deep Carpet Cleaning Service" |
| `service-upholstery-mattreses.png` | Services collection | "Upholstery and Mattress Cleaning" |
| `service-stain-order-removal.png` | Services collection | "Stain and Odor Removal Service" |
| `carpet-ninja-car-3.png` | Hero global | "Carpet Ninja Van" |
| `carpet-ninja.png` | Hero global (logo) | "Carpet Ninja Logo" |
| `before.png` | Before/After global | "Before Cleaning" |
| `after.png` | Before/After global | "After Cleaning" |

---

## Estimated Time

- **Bulk upload**: 2-3 minutes
- **Connect to collections**: 5-7 minutes
- **Total**: ~10 minutes

Much faster than waiting for cold start! 🚀
