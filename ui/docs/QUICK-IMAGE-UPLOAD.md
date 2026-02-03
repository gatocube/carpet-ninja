# Quick Image Upload Guide

## ⚡ Best Practice: Bulk Upload via Admin Panel

**Time required:** ~5 minutes (one-time setup)

### Why This Way?

- ✅ **Official Payload CMS method**
- ✅ **Works reliably in production**  
- ✅ **No complex scripts needed**
- ✅ **One-time setup only**

---

### Step 1: Access Bulk Upload

1. Open: https://carpet-ninja.vercel.app/admin
2. Login: `admin@carpet-ninja.com` / `admin123`
3. Go to: **Collections → Media**
4. Click: **"Bulk Upload"** button

###Step 2: Select All Images

Upload these 7 images from `carpet-ninja/ui/public/`:

```
✓ service-deep-carpet-cleaning.png
✓ service-upholstery-mattreses.png
✓ service-stain-order-removal.png
✓ carpet-ninja-car-3.png
✓ carpet-ninja.png
✓ before.png
✓ after.png
```

**How to bulk upload:**
- Click "Select a file" button
- Hold `Cmd` (Mac) or `Ctrl` (Windows)
- Select all 7 images at once
- Click "Open"
- Wait for all to upload (~30 seconds)

### Step 3: Connect Images (Optional Automation)

After upload, you can either:

**Option A: Manual** (5 min)
- Edit each Service and select its image
- Edit Hero Section and select car image + logo
- Edit Before/After and select before/after images

**Option B: Use Script** (if you prefer)
```bash
# Coming soon: auto-connect script
npm run connect-images
```

---

## Why Not Automated?

Vercel's serverless functions can't access the filesystem at runtime:
- ❌ Can't read from `/public` folder
- ❌ `fs.readFileSync()` doesn't work
- ✅ Admin UI uploads work perfectly
- ✅ One-time setup, then managed via CMS

---

## Troubleshooting

**"No images showing after upload"**
- Refresh the Media page
- Check Vercel Blob storage is configured
- Verify BLOB_READ_WRITE_TOKEN env var

**"Upload fails"**
- Check file sizes (should be < 10MB each)
- Try uploading one at a time
- Check browser console for errors

---

## After Upload

Once images are uploaded:
1. ✅ They're stored in Vercel Blob Storage
2. ✅ Accessible via CDN
3. ✅ Manageable via admin panel
4. ✅ Can be replaced anytime

**You're done!** Images are now in production. 🎉
