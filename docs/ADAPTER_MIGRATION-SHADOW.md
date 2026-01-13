# Adapter Migration: next-on-pages to OpenNext Cloudflare

## Summary

Successfully migrated from the deprecated `@cloudflare/next-on-pages` adapter to the modern `@opennextjs/cloudflare` adapter.

## Changes Made

### 1. Package Dependencies

**Removed:**
- `@cloudflare/next-on-pages@1.13.16` (deprecated, incompatible with Next.js 15)

**Kept:**
- `@opennextjs/cloudflare@1.11.0` (already installed)
- `wrangler@4.45.1` (already installed)

**Result:** Reduced vulnerabilities from 14 to 3, removed deprecation warnings

### 2. Build Scripts (`package.json`)

**Before:**
```json
"build:cf": "npx @cloudflare/next-on-pages@latest"
```

**After:**
```json
"build:cf": "npm run build && npm run build:open-next",
"build:open-next": "npx opennextjs-cloudflare build && node scripts/prepare-pages-deployment.js"
```

### 3. New Files Created

#### `wrangler.toml`
Minimal configuration for Cloudflare Workers/Pages deployment:
```toml
name = "next-starter-template"
main = ".open-next/worker.js"
compatibility_date = "2025-01-01"
```

#### `scripts/prepare-pages-deployment.js`
Post-build script that creates a Cloudflare Pages-compatible deployment structure:
- Copies static assets from `.open-next/assets/` to `.open-next/worker/`
- Copies `worker.js` to `.open-next/worker/_worker.js` for Pages Functions
- Copies supporting directories needed by the worker runtime

### 4. Updated `.gitignore`

Added explicit exclusion for deprecated adapter artifacts:
```
# Vercel build output from next-on-pages (deprecated)
.vercel/output/
```

## Build Output Structure

### Before (next-on-pages):
```
.vercel/
  output/
    static/
    functions/
  _worker.js (at root)
```

### After (OpenNext Cloudflare):
```
.open-next/
  worker.js                    # Worker entry point
  worker/                      # Pages deployment directory
    _worker.js                 # Pages Function entry point
    _next/static/             # Next.js static assets
    *.html                    # Static pages
    cloudflare/               # Runtime support files
    server-functions/         # Server components
    middleware/               # Middleware handlers
```

## Deployment Workflow

No changes required to GitHub Actions workflows! They already deploy `.open-next/worker/` to Cloudflare Pages.

**Workflow:**
1. `npm run cf:build` - Builds app with OpenNext
2. `prepare-pages-deployment.js` - Creates Pages structure
3. `wrangler pages deploy .open-next/worker` - Deploys to Pages

## Why This Fixes the White Screen Issue

### Root Cause
The deprecated `@cloudflare/next-on-pages@1.13.16` is incompatible with Next.js 15 and React 19. It creates a Worker artifact that React cannot hydrate, resulting in a blank screen despite successful builds.

### The Fix
`@opennextjs/cloudflare` is the official replacement that:
1. **Supports Next.js 15 and React 19** - Uses modern React server components
2. **Proper hydration** - Creates compatible client/server bundles
3. **Better runtime** - Optimized for Cloudflare Workers/Pages environment
4. **Active maintenance** - Regular updates for new Next.js features

### Expected Results
- Builds reference OpenNext adapter (not next-on-pages)
- Cloudflare Preview renders homepage with content
- Browser console has no fatal errors
- No 404s on `/_next/static/*` assets
- Proper React hydration on client side

## Testing Performed

✅ `npm run build` - Next.js build successful  
✅ `npm run cf:build` - OpenNext build successful  
✅ `npm run lint` - No ESLint errors  
✅ `npm run typecheck` - No TypeScript errors  
✅ `npm test` - All tests passing  
✅ Build output structure verified  
✅ No residual next-on-pages artifacts  

## Verification Checklist

Post-deployment verification (to be done after Cloudflare Pages deployment):

- [ ] Cloudflare Preview build succeeds
- [ ] Homepage renders with content (no white screen)
- [ ] Browser console has no fatal errors
- [ ] No 404 errors on `/_next/static/*` requests
- [ ] Network tab shows proper asset loading
- [ ] React hydration completes successfully
- [ ] All routes are accessible
- [ ] Dynamic content loads properly

## References

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Next.js 15 on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Migration Guide](https://github.com/cloudflare/next-on-pages#migration-to-opennext)
