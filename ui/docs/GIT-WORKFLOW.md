# Git Workflow: Main → Production

## Branch Strategy

This project uses a **two-branch workflow**:

- **`main`** - Development branch (always test here first)
- **`production`** - Production branch (only merge from main after testing)

## Workflow

### 1. Develop on Main Branch

```bash
# Always work on main branch
git checkout main

# Make your changes
# ... edit files ...

# Commit to main
git add .
git commit -m "Your changes"
git push origin main
```

### 2. Test on Main Branch

```bash
# Deploy main to Vercel preview
vercel

# Or test locally
pnpm dev

# Run E2E tests
pnpm test:e2e

# Test production build locally
vercel pull --yes --environment=production
set -a && . .vercel/.env.production.local && set +a
pnpm build && pnpm start
```

### 3. Merge to Production (After Testing)

**⚠️ ONLY after everything works on main!**

```bash
# Switch to production branch
git checkout production

# Merge from main
git merge main

# Push to production
git push origin production

# Deploy to production
vercel --prod
```

## Rules

✅ **DO**:
- Always commit to `main` first
- Test thoroughly on `main` branch
- Only merge to `production` when everything works
- Run E2E tests before merging to production
- Review changes before merging

❌ **DON'T**:
- Never commit directly to `production`
- Don't merge untested code to `production`
- Don't skip testing
- Don't merge on Friday afternoon

## Hotfix Workflow

If production is broken and needs immediate fix:

```bash
# 1. Checkout production
git checkout production

# 2. Create hotfix branch
git checkout -b hotfix/description

# 3. Make minimal fix
# ... edit files ...

# 4. Test the fix
pnpm test:e2e

# 5. Merge to production
git checkout production
git merge hotfix/description
git push origin production

# 6. Also merge to main to keep in sync
git checkout main
git merge hotfix/description
git push origin main

# 7. Delete hotfix branch
git branch -d hotfix/description
```

## Vercel Setup

**Main Branch** (Preview):
- Automatic deploys: Yes
- Environment: Preview
- URL: https://carpet-ninja-[hash].vercel.app

**Production Branch** (Production):
- Automatic deploys: Yes
- Environment: Production
- URL: https://carpet-ninja.vercel.app

Configure in Vercel Dashboard:
1. Go to Project Settings → Git
2. Set Production Branch: `production`
3. Enable Preview Deployments for: `main`

## Rollback

If production needs to be rolled back:

```bash
# Option 1: Revert last commit
git checkout production
git revert HEAD
git push origin production

# Option 2: Reset to specific commit (DANGEROUS - use with caution)
git checkout production
git reset --hard <commit-hash>
git push origin production --force

# Option 3: Use Vercel rollback (fastest)
vercel ls
vercel alias <previous-deployment-url> carpet-ninja.vercel.app
```

## Best Practices

1. **Commit Messages**: Use clear, descriptive commit messages
   ```
   ✅ "Add before/after section to homepage"
   ❌ "update stuff"
   ```

2. **Small Commits**: Make small, focused commits
3. **Test Before Merge**: Always test on main before merging to production
4. **Code Review**: Have someone review production merges if possible
5. **Documentation**: Update docs when changing workflows

## Emergency Contacts

If you break production:
1. Immediately rollback using Vercel dashboard
2. Fix on main branch
3. Test thoroughly
4. Redeploy to production

---

**Current Workflow Summary**:
```
Work on main → Test → Merge to production → Deploy
```

Never skip the testing step!
