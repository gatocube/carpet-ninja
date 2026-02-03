# Remaining Implementation Plan

## Status: Partially Complete

### ✅ Completed
1. Git workflow documentation (main → production)
2. Section visibility controls in Payload
3. BeforeAfter global configuration
4. Image upload fields added to collections
5. Logo field added to Hero

### 🚧 In Progress

#### 1. Update Seed Plugin (CRITICAL)
The seed plugin needs to:
- Upload images from `/public` to media collection
- Associate uploaded images with services, hero, before/after
- Seed BeforeAfter global with default comparisons
- Seed SectionVisibility global with defaults

**File**: `src/plugins/seed.ts`

**Changes Needed**:
```typescript
// Add helper function to upload images
async function uploadImageToMedia(payload: Payload, imagePath: string, alt: string) {
    const fs = await import('fs')
    const path = await import('path')
    
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    const buffer = fs.readFileSync(fullPath)
    
    return await payload.create({
        collection: 'media',
        data: {
            alt,
        },
        file: {
            data: buffer,
            mimetype: 'image/png',
            name: path.basename(imagePath),
            size: buffer.length,
        },
    })
}

// In seedIfEmpty, upload default images:
const serviceImages = {
    'deep-carpet-cleaning': await uploadImageToMedia(payload, 'service-deep-carpet-cleaning.png', 'Deep Carpet Cleaning'),
    'upholstery-mattresses': await uploadImageToMedia(payload, 'service-upholstery-mattreses.png', 'Upholstery Cleaning'),
    'stain-odor-removal': await uploadImageToMedia(payload, 'service-stain-order-removal.png', 'Stain Removal'),
}

// Seed services with images
await payload.create({
    collection: 'services',
    data: {
        title: 'Deep Carpet Cleaning',
        slug: 'deep-carpet-cleaning',
        description: '...',
        image: serviceImages['deep-carpet-cleaning'].id,
        order: 1,
    },
})
```

#### 2. Reset Database
```bash
# Delete local database
rm -f dev.db dev.db-shm dev.db-wal

# Start dev server (will recreate with new schema + images)
pnpm dev

# Trigger seeding
curl http://localhost:3445/
```

#### 3. Update Homepage (`app/(app)/page.tsx`)

**Add Before/After Section**:
```typescript
{visibility?.showBeforeAfter && beforeAfter?.comparisons?.length > 0 && (
    <section id="before-after" className="py-24 bg-[#1a1b26]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                    {beforeAfter.sectionTitle}
                </h2>
                <p className="text-white/60 mt-4">{beforeAfter.sectionSubtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {beforeAfter.comparisons.map((comp, idx) => (
                    <div key={idx} className="group relative">
                        <div className="relative overflow-hidden rounded-3xl">
                            {/* Image comparison slider implementation */}
                            <img src={comp.afterImage?.url} alt={comp.title} />
                        </div>
                        <h3 className="mt-4 font-bold">{comp.title}</h3>
                        <p className="text-white/60">{comp.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
)}
```

**Add Bubbles Animation**:
```typescript
{visibility?.enableBubbles && (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(visibility.bubbleCount || 15)].map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-white/5 animate-float"
                style={{
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 10 + 10}s`,
                }}
            />
        ))}
    </div>
)}
```

**Add animation to globals.css**:
```css
@keyframes float {
    0%, 100% {
        transform: translateY(0) translateX(0);
    }
    25% {
        transform: translateY(-20px) translateX(10px);
    }
    50% {
        transform: translateY(-40px) translateX(-10px);
    }
    75% {
        transform: translateY(-20px) translateX(5px);
    }
}

.animate-float {
    animation: float 20s ease-in-out infinite;
}
```

#### 4. Fix Car Image
The car image `/carpet-ninja-car-3.png` likely has a white background. Options:
- Use image editing tool to remove background (recommended)
- Use CSS: `mix-blend-mode: multiply` 
- Replace with `/carpet-ninja-car-2.png` or car with transparent background

#### 5. Logo & Favicon
- Create `public/logo-small.png` (just the ninja icon, 512x512)
- Create `public/favicon.ico` from logo-small.png
- Add to `app/(app)/layout.tsx`:
```typescript
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/logo-small.png" />
```

#### 6. Update `lib/payload.ts`
Add functions to fetch new globals:
```typescript
export async function getBeforeAfter() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'before-after' })
    } catch {
        return { comparisons: [] }
    }
}

export async function getSectionVisibility() {
    try {
        const payload = await getPayloadClient()
        return await payload.findGlobal({ slug: 'section-visibility' })
    } catch {
        return {
            showHero: true,
            showServices: true,
            showBeforeAfter: true,
            showReviews: true,
            showPricing: true,
            showCoverage: true,
            showContact: true,
            enableBubbles: true,
            bubbleCount: 15,
        }
    }
}
```

### 📝 Testing Checklist

After implementing:
- [ ] Run `pnpm dev` - should see seeded images in media
- [ ] Check admin panel - all sections have toggle controls
- [ ] Upload custom images via admin - should replace defaults
- [ ] Check homepage - bubbles animate smoothly
- [ ] Check homepage - before/after section displays
- [ ] Toggle sections off - should hide from homepage
- [ ] Run E2E tests: `pnpm test:e2e`

### 🚀 Deployment to Production

```bash
# 1. Test on main branch
git checkout main
vercel

# 2. Run production E2E test
TEST_PRODUCTION=true pnpm test:e2e e2e/prod-sync.spec.ts

# 3. Merge to production
git checkout production
git merge main
git push origin production

# 4. Deploy to production
vercel --prod
```

### ⚠️ Important Notes

1. **Image Seeding**: The seed plugin runs only once when database is empty. If you need to re-seed, delete `dev.db` first.

2. **Production Database**: Already initialized. To reset production:
   - Backup first! (see docs/MIGRATIONS.md)
   - Follow database reset procedure
   - Re-run initialization

3. **Media Upload**: In production, images are stored in Vercel Blob. Local development uses filesystem.

4. **Performance**: 15 bubbles is reasonable. More than 30 may impact performance on mobile devices.

### 🔗 Related Documentation
- docs/GIT-WORKFLOW.md - Branch strategy
- docs/MIGRATIONS.md - Database reset procedures
- docs/DEBUGGING-PRODUCTION.md - Production troubleshooting
